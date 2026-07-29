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
const MC_BASE = "https://mc-api.marketcheck.com/v2";
const CACHE_TTL_MS = 60 * 1000; // short-lived cache

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

/* ---------- upstream fetch (returns parsed JSON) ---------- */
function mcFetch(pathAndQuery) {
  return new Promise((resolve, reject) => {
    const url = `${MC_BASE}${pathAndQuery}${
      pathAndQuery.includes("?") ? "&" : "?"
    }api_key=${API_KEY}`;
    https
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
function normalizeListing(l) {
  const b = l.build || {};
  const media = l.media || {};
  const photos = media.photo_links || media.photo_links_cached || [];
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
    dealer_phone: dealer.phone || null,
    seller_type: l.seller_type || null,
    dom: l.dom || null,
    photo: photos[0] || null,
    photos: photos.slice(0, 12),
    vdp_url: l.vdp_url || null,
  };
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

  const mMax = params.get("miles_max");
  if (mMax) q.set("miles_range", `0-${mMax}`);

  // sort: newest | price_asc | price_desc | miles_asc | miles_desc
  const sortMap = {
    newest: ["dom", "asc"],
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
  // "Default" browse = curated marques, no explicit narrowing by the user.
  const isDefault = !sp.get("make") && !sp.get("model") && !sp.get("keyword");

  // For the default mix, pull a bigger pool so we can balance across makes.
  const poolParams = new URLSearchParams(sp);
  if (isDefault) poolParams.set("rows", "50");
  const upstream = buildSearchQuery(poolParams);

  const cacheKey = "s:" + requested + ":" + upstream;
  const cached = cacheGet(cacheKey);
  if (cached) return sendJSON(res, 200, cached);
  try {
    const data = await mcFetch(upstream);
    let listings = (data.listings || []).map(normalizeListing);
    if (isDefault) listings = diversifyByMake(listings).slice(0, requested);
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
    const out = normalizeListing(data);
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
  ".ico": "image/x-icon",
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
