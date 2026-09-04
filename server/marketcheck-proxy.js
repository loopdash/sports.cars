/* ============================================================
   Sports.Cars — MarketCheck proxy + static file server
   ------------------------------------------------------------
   - Keeps the MarketCheck API key server-side (env var), never
     exposed to the browser.
   - Serves the static prototype so front-end and API are
     same-origin (no CORS).
   - Normalizes MarketCheck responses into the shape the
     front-end expects.
   - Short-lived in-memory cache for cost + performance.

   Run it with the key injected from 1Password (never on disk):
     op run --account loopdash.1password.com \
       --env-file=marketcheck.env.tmpl -- node server/marketcheck-proxy.js
   ============================================================ */

"use strict";

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 8080;
const ROOT = path.resolve(__dirname, "..");
const API_KEY = process.env.MARKETCHECK_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MC_BASE = process.env.MC_BASE || "https://mc-api.marketcheck.com/v2";
const CACHE_TTL_MS = 60 * 1000; // short-lived cache

// Stored spec / taxonomy layer (Phase 1). Merged into live inventory at
// request time to add the generation + horsepower the basic feed lacks.
const TAX = require("../assets/data/taxonomy.js");
const EXTERIOR = require("./lib/exterior-first.js");
const CURRENT_YEAR = TAX.currentYear || 2026;

// Curated default marques so the marketplace reads as sports/exotic cars.
// Stand-in for the Phase 1 taxonomy layer; overridden by any explicit
// make / model / keyword the user selects.
const DEFAULT_MAKES =
  "Ferrari,Porsche,Lamborghini,McLaren,Aston Martin,Maserati,Lotus";

if (!API_KEY) {
  console.warn(
    "\n⚠  MARKETCHECK_API_KEY is not set. The site will still serve, but\n" +
      "   /api/* will return 503 and pages fall back to demo data.\n" +
      "   Start with:  ./run.sh   (injects the key from 1Password)\n"
  );
}

/* ---------- tiny in-memory cache ---------- */
const cache = new Map();
function cacheGet(key) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  cache.delete(key);
  return null;
}
function cacheSet(key, value) {
  cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
}

/* ---------- exterior-first photo ordering (Claude vision, cached by VIN) ----------
 * MarketCheck leads with whatever photo the dealer uploaded first, which is
 * sometimes an interior shot. We classify a listing's photos once, cache the
 * first-exterior index by VIN (persists past the 60s listing cache so a car is
 * only ever classified once), and move that photo to the front. No API key ->
 * this is a no-op and the original MarketCheck order is served unchanged. */
const exteriorIndexByVin = new Map();
const exteriorCache = {
  get: (k) => exteriorIndexByVin.get(k),
  set: (k, v) => void exteriorIndexByVin.set(k, v),
};
const classifyExterior = ANTHROPIC_API_KEY
  ? EXTERIOR.createAnthropicClassifier({ apiKey: ANTHROPIC_API_KEY })
  : null;

/* ---------- upstream fetch (returns parsed JSON) ---------- */
function mcFetch(pathAndQuery) {
  return new Promise((resolve, reject) => {
    const url = `${MC_BASE}${pathAndQuery}${
      pathAndQuery.includes("?") ? "&" : "?"
    }api_key=${API_KEY}`;
    const client = url.indexOf("https:") === 0 ? https : http;
    client
      .get(url, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`MarketCheck ${res.statusCode}`));
          }
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

/* ---------- normalization ---------- */
function normalizeListing(l, maxPhotos) {
  const b = l.build || {};
  const media = l.media || {};
  const photos = media.photo_links || media.photo_links_cached || [];
  // Search cards only need a thumbnail, so the pool stays small there; the
  // listing detail page passes Infinity to surface the full gallery.
  const cap = maxPhotos || 12;
  const dealer = l.dealer || {};
  const city = dealer.city || l.build_city || null;
  const state = dealer.state || null;
  return {
    id: l.id,
    vin: l.vin || null,
    year: b.year || null,
    make: b.make || null,
    model: b.model || null,
    trim: b.trim || null,
    title: [b.year, b.make, b.model].filter(Boolean).join(" "),
    price: typeof l.price === "number" ? l.price : null,
    miles: typeof l.miles === "number" ? l.miles : null,
    body_type: b.body_type || null,
    transmission: b.transmission || null,
    drivetrain: b.drivetrain || null,
    engine: b.engine || (b.engine_size ? `${b.engine_size}L` : null),
    doors: b.doors || null,
    exterior: l.exterior_color || null,
    interior: l.interior_color || null,
    city,
    state,
    location: [city, state].filter(Boolean).join(", "),
    dealer: dealer.name || null,
    dealer_id: dealer.id || dealer.dealer_id || null,
    dealer_phone: dealer.phone || null,
    seller_type: l.seller_type || null,
    dom: l.dom || null,
    photo: photos[0] || null,
    photos: photos.slice(0, cap),
    vdp_url: l.vdp_url || null,
    // generation + hp are filled by mergeSpec() from the taxonomy layer
    generation: null,
    hp: null,
    hp_min: null,
    hp_max: null,
  };
}

/* ---------- request-time merge: live listing + stored spec/taxonomy ---------- */
function mergeSpec(listing) {
  const g = TAX.matchGeneration(TAX.rows, listing.make, listing.model, listing.year);
  if (!g) return listing;
  listing.generation = g.gen;
  listing.hp_min = g.hpMin;
  listing.hp_max = g.hpMax;
  // Single value when the generation is unambiguous, else a display range.
  listing.hp = g.hpMin === g.hpMax ? g.hpMin : `${g.hpMin}–${g.hpMax}`;
  return listing;
}

// Resolve a generation name -> its [startYear, endYear] window.
function generationYears(make, model, gen) {
  const row = TAX.rows.filter(
    (r) => r.make === make && r.model === model && r.gen === gen
  )[0];
  return row ? [row.yStart, row.yEnd] : null;
}

/* ---------- param mapping: our query -> MarketCheck query ---------- */
function buildSearchQuery(params) {
  const q = new URLSearchParams();
  q.set("car_type", "used");
  q.set("rows", clampInt(params.get("rows"), 12, 1, 50));
  q.set("start", clampInt(params.get("start"), 0, 0, 5000));

  var make = params.get("make");
  var model = params.get("model");
  var keyword = params.get("keyword");
  var generation = params.get("generation");
  // Default to curated marques only when the user hasn't narrowed the search.
  if (make) q.set("make", make);
  else if (!model && !keyword) q.set("make", DEFAULT_MAKES);
  if (model) q.set("model", model);
  if (params.get("body_type")) q.set("body_type", params.get("body_type"));
  if (params.get("transmission")) q.set("transmission", params.get("transmission"));
  if (params.get("drivetrain")) q.set("drivetrain", params.get("drivetrain"));
  if (keyword) q.set("keyword", keyword);

  const pMin = params.get("price_min");
  const pMax = params.get("price_max");
  if (pMin || pMax) q.set("price_range", `${pMin || 0}-${pMax || 100000000}`);

  const milesMin = params.get("miles_min");
  const milesMax = params.get("miles_max");
  if (milesMin || milesMax) q.set("miles_range", `${milesMin || 0}-${milesMax || 100000000}`);

  // Year window: explicit year_min/year_max, or derived from the generation.
  let yMin = params.get("year_min");
  let yMax = params.get("year_max");
  if ((!yMin && !yMax) && generation && make && model) {
    const win = generationYears(make, model, generation);
    if (win) { yMin = String(win[0]); yMax = String(win[1]); }
  }
  if (yMin || yMax) q.set("year_range", `${yMin || 1900}-${yMax || CURRENT_YEAR}`);

  // sort: newest | oldest | price_asc | price_desc | miles_asc | miles_desc
  const sortMap = {
    newest: ["dom", "asc"],
    oldest: ["dom", "desc"],
    price_asc: ["price", "asc"],
    price_desc: ["price", "desc"],
    miles_asc: ["miles", "asc"],
    miles_desc: ["miles", "desc"],
  };
  const [sortBy, sortOrder] = sortMap[params.get("sort")] || sortMap.newest;
  q.set("sort_by", sortBy);
  q.set("sort_order", sortOrder);

  return `/search/car/active?${q.toString()}`;
}

function clampInt(v, def, min, max) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return def;
  return Math.max(min, Math.min(max, n));
}

/* ---------- request routing ---------- */
function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

// Round-robin interleave by make so a mixed-marque page isn't dominated
// by the highest-volume brand (Porsche has ~10x the exotics' inventory).
function diversifyByMake(listings) {
  const byMake = {};
  listings.forEach((v) => {
    (byMake[v.make || "?"] = byMake[v.make || "?"] || []).push(v);
  });
  const buckets = Object.values(byMake);
  const out = [];
  let added = true;
  while (added) {
    added = false;
    for (const b of buckets) {
      if (b.length) { out.push(b.shift()); added = true; }
    }
  }
  return out;
}

async function handleSearch(req, res, u) {
  if (!API_KEY) return sendJSON(res, 503, { error: "api_key_missing" });
  const sp = u.searchParams;
  const requested = clampInt(sp.get("rows"), 12, 1, 50);
  const start = clampInt(sp.get("start"), 0, 0, 5000);

  // Post-filters we apply after merging the taxonomy (the basic feed can't
  // filter on hp or our generation names). These narrow the returned page.
  const hpMin = sp.get("hp_min") ? parseInt(sp.get("hp_min"), 10) : null;
  const hpMax = sp.get("hp_max") ? parseInt(sp.get("hp_max"), 10) : null;
  const gen = sp.get("generation");

  // "Default" browse = curated marques, no explicit narrowing by the user.
  const isDefault =
    !sp.get("make") && !sp.get("model") && !sp.get("keyword") && !gen;
  // Only balance-and-slice the curated mix on the first page of a default browse.
  const diversify = isDefault && start === 0;

  // For the default first page, pull a bigger pool so we can balance makes.
  const poolParams = new URLSearchParams(sp);
  if (diversify) poolParams.set("rows", "50");
  const upstream = buildSearchQuery(poolParams);

  const cacheKey = "s:" + requested + ":" + upstream + ":" + [hpMin, hpMax, gen].join(",");
  const cached = cacheGet(cacheKey);
  if (cached) return sendJSON(res, 200, cached);
  try {
    const data = await mcFetch(upstream);
    let listings = (data.listings || []).map(normalizeListing).map(mergeSpec);

    // Taxonomy-driven post-filters.
    if (gen) listings = listings.filter((l) => l.generation === gen);
    if (hpMin != null || hpMax != null) {
      listings = listings.filter((l) => {
        if (l.hp_min == null) return false; // unknown hp excluded when filtering
        if (hpMin != null && l.hp_max < hpMin) return false;
        if (hpMax != null && l.hp_min > hpMax) return false;
        return true;
      });
    }

    if (diversify) listings = diversifyByMake(listings).slice(0, requested);
    else listings = listings.slice(0, requested);

    // num_found reflects the upstream match count; hp/generation post-filters
    // may trim the current page below `rows`.
    const out = { num_found: data.num_found || 0, listings };
    cacheSet(cacheKey, out);
    sendJSON(res, 200, out);
  } catch (e) {
    sendJSON(res, 502, { error: "upstream_error", detail: String(e.message) });
  }
}

async function handleListing(req, res, id) {
  if (!API_KEY) return sendJSON(res, 503, { error: "api_key_missing" });
  const cacheKey = "l:" + id;
  const cached = cacheGet(cacheKey);
  if (cached) return sendJSON(res, 200, cached);
  try {
    const data = await mcFetch(`/listing/car/${encodeURIComponent(id)}`);
    const out = mergeSpec(normalizeListing(data, Infinity));
    if (classifyExterior && Array.isArray(out.photos) && out.photos.length > 1) {
      const idx = await EXTERIOR.resolveExteriorIndex({
        vin: out.vin,
        photos: out.photos,
        cache: exteriorCache,
        classify: classifyExterior,
      });
      Object.assign(out, EXTERIOR.applyExteriorFirst(out, idx));
    }
    cacheSet(cacheKey, out);
    sendJSON(res, 200, out);
  } catch (e) {
    sendJSON(res, 502, { error: "upstream_error", detail: String(e.message) });
  }
}

/* ---------- dealer profile: info + that dealer's live inventory ---------- */
async function fetchDealerInfo(id) {
  try {
    const d = await mcFetch(`/dealer/car/${encodeURIComponent(id)}`);
    return {
      id: d.id || id,
      name: d.seller_name || null,
      city: d.city || null,
      state: d.state || null,
      location: [d.city, d.state].filter(Boolean).join(", ") || null,
      phone: d.seller_phone || null,
      website: d.inventory_url || null,
    };
  } catch (e) {
    return { id, name: null, location: null, phone: null };
  }
}

// Which makes to scan for the fallback below. The dealer's own franchise
// brand (inferred from its name) goes first so a brand store resolves in one
// call; then the curated exotic/sports marques.
function dealerScanMakes(name) {
  const makes = DEFAULT_MAKES.split(",");
  if (name) {
    const lower = name.toLowerCase();
    TAX.makes.map((m) => m.make).forEach((mk) => {
      if (lower.indexOf(mk.toLowerCase()) !== -1 && makes.indexOf(mk) === -1) {
        makes.unshift(mk);
      }
    });
  }
  return makes;
}

async function handleDealer(req, res, u) {
  if (!API_KEY) return sendJSON(res, 503, { error: "api_key_missing" });
  const id = u.searchParams.get("dealer_id");
  if (!id) return sendJSON(res, 400, { error: "dealer_id_required" });
  const rows = clampInt(u.searchParams.get("rows"), 9, 1, 24);

  const cacheKey = "dlr:" + id + ":" + rows;
  const cached = cacheGet(cacheKey);
  if (cached) return sendJSON(res, 200, cached);

  try {
    const dealer = await fetchDealerInfo(id);

    // 1) Direct dealer-scoped search: accurate total count, and — on a
    //    MarketCheck plan that returns dealer-scoped bodies — the listings.
    // No car_type filter: a dealer profile shows their whole inventory
    // (new + used), which also yields far more cards for franchise stores.
    const direct = await mcFetch(
      `/search/car/active?dealer_id=${encodeURIComponent(id)}&rows=${rows}`
    );
    const numFound = direct.num_found || 0;
    let listings = (direct.listings || []).map((l) => normalizeListing(l)).map(mergeSpec);

    // 2) Fallback: some plans return the count but not the listing bodies when
    //    filtered by dealer_id. Recover this dealer's cars by scanning curated
    //    makes and keeping only listings whose dealer id matches.
    if (!listings.length && numFound > 0) {
      const acc = [];
      const makes = dealerScanMakes(dealer.name);
      for (const mk of makes) {
        if (acc.length >= rows) break;
        try {
          const j = await mcFetch(
            `/search/car/active?make=${encodeURIComponent(mk)}&rows=50`
          );
          (j.listings || []).forEach((l) => {
            if (l.dealer && String(l.dealer.id) === String(id)) acc.push(l);
          });
        } catch (e) {
          /* skip this make */
        }
      }
      listings = acc.map((l) => normalizeListing(l)).map(mergeSpec);
    }

    // Newest-listed first, then trim to the requested page size.
    listings.sort((a, b) => (a.dom || 9999) - (b.dom || 9999));
    listings = listings.slice(0, rows);

    // Backfill dealer identity from a listing if the dealer endpoint was sparse.
    if (!dealer.name && listings[0]) dealer.name = listings[0].dealer;
    if (!dealer.location && listings[0]) dealer.location = listings[0].location;
    if (!dealer.phone && listings[0]) dealer.phone = listings[0].dealer_phone;

    const out = { dealer, num_found: numFound, listings };
    cacheSet(cacheKey, out);
    sendJSON(res, 200, out);
  } catch (e) {
    sendJSON(res, 502, { error: "upstream_error", detail: String(e.message) });
  }
}

/* ---------- static file serving ---------- */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  // Fonts must carry the correct Content-Type or browsers behind a CDN/HTTPS
  // edge (e.g. Render) refuse to apply them.
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".txt": "text/plain; charset=utf-8",
};
function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === "/") rel = "/index.html";
  // prevent path traversal
  const filePath = path.normalize(path.join(ROOT, rel));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
      // Dev server: never cache, so code changes always show on refresh.
      "Cache-Control": "no-cache, no-store, must-revalidate",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);
  const p = u.pathname;

  if (p === "/api/search") return handleSearch(req, res, u);
  if (p === "/api/dealer") return handleDealer(req, res, u);
  const m = p.match(/^\/api\/listing\/(.+)$/);
  if (m) return handleListing(req, res, m[1]);
  if (p === "/api/health") {
    return sendJSON(res, 200, { ok: true, key: Boolean(API_KEY) });
  }
  return serveStatic(req, res, p);
});

server.listen(PORT, () => {
  console.log(`\n▸ Sports.Cars running at http://localhost:${PORT}`);
  console.log(`  MarketCheck: ${API_KEY ? "live ✓" : "not configured (demo fallback)"}\n`);
});
