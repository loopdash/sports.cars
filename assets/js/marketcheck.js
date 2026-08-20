/* ============================================================
   Sports.Cars — MarketCheck front-end
   ------------------------------------------------------------
   Talks to the same-origin proxy (/api/*) which holds the key
   and merges live inventory with the stored spec/taxonomy layer.

   Enhances the search + listing pages with live inventory.
   When the proxy or API is unavailable (e.g. the page is opened
   as a plain static file with no key), it falls back to a demo
   inventory GENERATED FROM THE SAME TAXONOMY and runs the exact
   same filter / sort / paginate logic client-side — so every
   filter is demonstrable with or without a live key.
   ============================================================ */

(function () {
  "use strict";

  var ROWS = 12; // page size, kept in sync with the proxy
  var TAX = typeof window !== "undefined" ? window.TAXONOMY : null;

  var fav =
    '<button class="car-card__fav" aria-label="Save"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>';

  function money(n) {
    return typeof n === "number" ? "$" + n.toLocaleString("en-US") : "Call";
  }
  function milesLabel(n) {
    return typeof n === "number" ? n.toLocaleString("en-US") + " mi" : "—";
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function digits(s) { return String(s == null ? "" : s).replace(/[^\d]/g, ""); }
  function toInt(s) { var d = digits(s); return d ? parseInt(d, 10) : null; }

  function cardHTML(v) {
    var link = v.id ? "listing.html?id=" + encodeURIComponent(v.id) : "listing.html";
    var media = v.photo
      ? '<img src="' + esc(v.photo) + '" alt="' + esc(v.title) + '" loading="lazy">'
      : "";
    var metaBits = "<span>" + milesLabel(v.miles) + "</span>";
    if (v.location) metaBits += "<span>" + esc(v.location) + "</span>";
    return (
      '<a href="' + link + '" class="car-card">' +
      '<div class="car-card__media">' + media + fav +
      '<div class="car-card__overlay">' +
      '<span class="car-card__name">' + esc(v.title || "Vehicle") + "</span>" +
      '<span class="car-card__meta">' + metaBits + "</span>" +
      "</div></div>" +
      '<div class="car-card__footer">' +
      '<span class="car-card__plabel">Price</span>' +
      '<span class="car-card__price">' + money(v.price) + "</span>" +
      "</div></a>"
    );
  }

  /* ============================================================
     DEMO INVENTORY — generated once from the taxonomy so the
     fallback covers every make / model / generation / body /
     hp / year the filters can select. Deterministic (no RNG) so
     it's stable across reloads.
     ============================================================ */
  var EXOTIC = { Ferrari: 1, Lamborghini: 1, McLaren: 1, "Aston Martin": 1, Mercedes: 1 };
  var AWD = { "Nissan|GT-R": 1, "Lamborghini|Huracán": 1, "Lamborghini|Aventador": 1, "Lamborghini|Revuelto": 1, "Audi|R8": 1, "Audi|TT RS": 1, "Ferrari|SF90": 1, "Ferrari|296": 1 };
  var MANUAL = {
    "Porsche|911": 1, "Porsche|718 Cayman": 1, "Porsche|718 Boxster": 1,
    "Chevrolet|Corvette": 1, "Chevrolet|Camaro": 1, "Ford|Mustang": 1,
    "Toyota|Supra": 1, "Toyota|GR86": 1, "Nissan|Z": 1, "BMW|M4": 1, "BMW|M2": 1,
    "Lotus|Emira": 1, "Lotus|Evora": 1, "Dodge|Challenger": 1, "Dodge|Viper": 1,
    "Aston Martin|Vantage": 1, "Jaguar|F-Type": 1, "Acura|NSX": 1,
  };
  // Sample-inventory photos. Pool = the 8 sports-car images the design already
  // uses on car cards (all confirmed to render). Rotated per listing so cards
  // vary; each known make leads with its own image. Live inventory ignores this
  // entirely and shows each listing's real MarketCheck photo.
  function u(id) { return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=800&q=70"; }
  var IMG_POOL = [
    u("1544829099-b9a0c07fad1a"), u("1503736334956-4c8f8e92946d"),
    u("1580273916550-e323be2ae537"), u("1614162692292-7ac56d7f7f1e"),
    u("1503376780353-7e6692767b70"), u("1552519507-da3b142c6e3d"),
    u("1600712242805-5f78671b24da"), u("1583121274602-3e2820c69888"),
  ];
  var IMG_PRIMARY = {
    Ferrari: u("1544829099-b9a0c07fad1a"),
    Porsche: u("1503736334956-4c8f8e92946d"),
    McLaren: u("1580273916550-e323be2ae537"),
    Lamborghini: u("1614162692292-7ac56d7f7f1e"),
  };
  function photoFor(make, seed) {
    var primary = IMG_PRIMARY[make];
    var pool = primary
      ? [primary].concat(IMG_POOL.filter(function (x) { return x !== primary; }))
      : IMG_POOL;
    return pool[seed % pool.length];
  }
  var CITIES = [
    "Miami, FL", "Los Angeles, CA", "Dallas, TX", "Atlanta, GA", "Chicago, IL",
    "Scottsdale, AZ", "New York, NY", "Seattle, WA", "Denver, CO", "Charlotte, NC",
  ];

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function round(n, step) { return Math.round(n / step) * step; }

  var _demo = null;
  function demoInventory() {
    if (_demo) return _demo;
    var out = [];
    var rows = (TAX && TAX.rows) || [];
    var cur = (TAX && TAX.currentYear) || 2026;
    rows.forEach(function (r) {
      var yEnd = Math.min(r.yEnd, cur);
      var yStart = r.yStart;
      var mid = Math.round((yStart + yEnd) / 2);
      var hpMid = Math.round((r.hpMin + r.hpMax) / 2);
      // Three representative listings per generation spanning the year / price
      // range, with body styles decoupled from price tier so filter
      // combinations (e.g. Coupe under $250k) don't dead-end.
      var variants = [
        { year: yEnd, hp: r.hpMax, body: r.body[0] || "Coupe" },
        { year: mid, hp: hpMid, body: r.body[0] || "Coupe" },
        { year: yStart, hp: r.hpMin, body: r.body[r.body.length > 1 ? 1 : 0] || "Coupe" },
      ];
      variants.forEach(function (vr, i) {
        var seed = hash(r.make + r.model + r.gen + i);
        var age = Math.max(0, cur - vr.year);
        var msrpPerHp = EXOTIC[r.make] ? 620 : 190;
        var yearFactor = Math.max(0.55, 1 - age * 0.04);
        var noise = 0.85 + (seed % 30) / 100; // 0.85–1.15
        var price = round(vr.hp * msrpPerHp * yearFactor * noise, 500);
        var perYear = 2500 + (seed % 4000);
        var miles = age <= 0 ? seed % 1500 : age * perYear + (seed % 2000);
        var trans = i === 1 && MANUAL[r.make + "|" + r.model] ? "Manual" : "Automatic";
        var drive = AWD[r.make + "|" + r.model] ? "4WD" : "RWD";
        out.push({
          id: null, // demo cards open the static listing page
          year: vr.year,
          make: r.make,
          model: r.model,
          generation: r.gen,
          hp: vr.hp,
          title: vr.year + " " + r.make + " " + r.model,
          price: price,
          miles: miles,
          body_type: vr.body,
          transmission: trans,
          drivetrain: drive,
          location: CITIES[seed % CITIES.length],
          photo: photoFor(r.make, seed),
        });
      });
    });
    _demo = out;
    return out;
  }

  /* ---------------- SEARCH PAGE ---------------- */
  function initSearchPage() {
    var grid = document.getElementById("resultsGrid");
    if (!grid) return;
    var countEl = document.getElementById("resultsCount");
    var chipsEl = document.getElementById("activeChips");
    var pagerEl = document.getElementById("pagination");
    var clearBtn = document.querySelector(".filters__clear");

    // Dealer-scoped view: search.html?dealer_id=X shows that dealer's live
    // inventory (via /api/dealer, which handles the plan's dealer-body gap).
    var dealerId = new URLSearchParams(location.search).get("dealer_id");
    if (dealerId) return initDealerScopedSearch(grid, countEl, chipsEl, pagerEl, dealerId);

    var el = {
      keyword: document.getElementById("f-keyword"),
      make: document.getElementById("f-make"),
      model: document.getElementById("f-model"),
      generation: document.getElementById("f-generation"),
      yearMin: document.getElementById("f-year-min"),
      yearMax: document.getElementById("f-year-max"),
      hpMin: document.getElementById("f-hp-min"),
      hpMax: document.getElementById("f-hp-max"),
      priceMin: document.getElementById("f-price-min"),
      priceMax: document.getElementById("f-price-max"),
      milesMin: document.getElementById("f-miles-min"),
      milesMax: document.getElementById("f-miles-max"),
      sort: document.getElementById("f-sort"),
    };
    var facets = Array.prototype.slice.call(document.querySelectorAll(".f-facet"));

    /* ---------- taxonomy-driven cascading selects ---------- */
    function opt(value, label, selected) {
      var o = document.createElement("option");
      o.value = value; o.textContent = label;
      if (selected) o.selected = true;
      return o;
    }
    function makesList() { return TAX ? TAX.makes.map(function (m) { return m.make; }).sort() : []; }
    function modelsFor(make) {
      if (!TAX) return [];
      var m = TAX.makes.filter(function (x) { return x.make === make; })[0];
      return m ? m.models.map(function (x) { return x.model; }) : [];
    }
    function gensFor(make, model) {
      if (!TAX) return [];
      var m = TAX.makes.filter(function (x) { return x.make === make; })[0];
      if (!m) return [];
      var md = m.models.filter(function (x) { return x.model === model; })[0];
      return md ? md.generations.map(function (g) { return g.gen; }) : [];
    }
    function fillMakes() {
      if (!el.make) return;
      el.make.innerHTML = "";
      el.make.appendChild(opt("", "Any make"));
      makesList().forEach(function (m) { el.make.appendChild(opt(m, m)); });
    }
    function fillModels(make, keep) {
      if (!el.model) return;
      el.model.innerHTML = "";
      el.model.appendChild(opt("", "Any model"));
      modelsFor(make).forEach(function (m) { el.model.appendChild(opt(m, m, m === keep)); });
      el.model.disabled = !make;
    }
    function fillGens(make, model, keep) {
      if (!el.generation) return;
      el.generation.innerHTML = "";
      el.generation.appendChild(opt("", "Any generation"));
      gensFor(make, model).forEach(function (g) { el.generation.appendChild(opt(g, g, g === keep)); });
      el.generation.disabled = !model;
    }

    /* ---------- read the current filter state ---------- */
    function selVal(e) { return e && e.value ? e.value : ""; }
    function facetVals(name) {
      return facets.filter(function (f) { return f.dataset.facet === name && f.checked; })
        .map(function (f) { return f.value; });
    }
    function state() {
      return {
        keyword: el.keyword ? el.keyword.value.trim() : "",
        make: selVal(el.make),
        model: selVal(el.model),
        generation: selVal(el.generation),
        yearMin: toInt(el.yearMin && el.yearMin.value),
        yearMax: toInt(el.yearMax && el.yearMax.value),
        hpMin: toInt(el.hpMin && el.hpMin.value),
        hpMax: toInt(el.hpMax && el.hpMax.value),
        priceMin: toInt(el.priceMin && el.priceMin.value),
        priceMax: toInt(el.priceMax && el.priceMax.value),
        milesMin: toInt(el.milesMin && el.milesMin.value),
        milesMax: toInt(el.milesMax && el.milesMax.value),
        sort: selVal(el.sort) || "newest",
        body_type: facetVals("body_type"),
        transmission: facetVals("transmission"),
        drivetrain: facetVals("drivetrain"),
      };
    }

    /* ---------- state -> filter params (shared by URL + API) ---------- */
    function filterParams(s) {
      var p = new URLSearchParams();
      if (s.keyword) p.set("keyword", s.keyword);
      if (s.make) p.set("make", s.make);
      if (s.model) p.set("model", s.model);
      if (s.generation) p.set("generation", s.generation);
      if (s.yearMin != null) p.set("year_min", s.yearMin);
      if (s.yearMax != null) p.set("year_max", s.yearMax);
      if (s.hpMin != null) p.set("hp_min", s.hpMin);
      if (s.hpMax != null) p.set("hp_max", s.hpMax);
      if (s.priceMin != null) p.set("price_min", s.priceMin);
      if (s.priceMax != null) p.set("price_max", s.priceMax);
      if (s.milesMin != null) p.set("miles_min", s.milesMin);
      if (s.milesMax != null) p.set("miles_max", s.milesMax);
      if (s.body_type.length) p.set("body_type", s.body_type.join(","));
      if (s.transmission.length) p.set("transmission", s.transmission.join(","));
      if (s.drivetrain.length) p.set("drivetrain", s.drivetrain.join(","));
      if (s.sort && s.sort !== "newest") p.set("sort", s.sort);
      return p;
    }

    /* ---------- URL persistence ---------- */
    function writeURL(s, page) {
      var p = filterParams(s);
      if (page > 1) p.set("page", page);
      var qs = p.toString();
      try {
        history.replaceState(null, "", qs ? "?" + qs : location.pathname);
      } catch (e) { /* file:// — ignore, filters still work */ }
    }
    function readURL() {
      var p = new URLSearchParams(location.search);
      // Cascading selects must be populated in order before values apply.
      var make = p.get("make") || "";
      var model = p.get("model") || "";
      var gen = p.get("generation") || "";
      if (el.make) el.make.value = make;
      fillModels(make, model);
      if (el.model) el.model.value = model;
      fillGens(make, model, gen);
      if (el.generation) el.generation.value = gen;

      function setTxt(e, key) { if (e && p.get(key) != null) e.value = p.get(key); }
      setTxt(el.keyword, "keyword");
      setTxt(el.yearMin, "year_min"); setTxt(el.yearMax, "year_max");
      setTxt(el.hpMin, "hp_min"); setTxt(el.hpMax, "hp_max");
      setTxt(el.priceMin, "price_min"); setTxt(el.priceMax, "price_max");
      setTxt(el.milesMin, "miles_min"); setTxt(el.milesMax, "miles_max");
      if (el.sort && p.get("sort")) el.sort.value = p.get("sort");
      ["body_type", "transmission", "drivetrain"].forEach(function (name) {
        var vals = (p.get(name) || "").split(",").filter(Boolean);
        facets.forEach(function (f) {
          if (f.dataset.facet === name && vals.indexOf(f.value) !== -1) f.checked = true;
        });
      });
      var page = parseInt(p.get("page"), 10);
      return page > 1 ? page : 1;
    }

    /* ---------- active-filter chips (each removable) ---------- */
    function activeChips(s) {
      var out = [];
      function push(label, clear) { out.push({ label: label, clear: clear }); }
      if (s.keyword) push('"' + s.keyword + '"', function () { el.keyword.value = ""; });
      if (s.make) push(s.make, function () { el.make.value = ""; fillModels("", ""); fillGens("", "", ""); });
      if (s.model) push(s.model, function () { el.model.value = ""; fillGens(s.make, "", ""); });
      if (s.generation) push(s.generation, function () { el.generation.value = ""; });
      if (s.yearMin != null || s.yearMax != null)
        push(rangeLabel(s.yearMin, s.yearMax, "", ""), function () { el.yearMin.value = ""; el.yearMax.value = ""; });
      s.body_type.concat(s.transmission, s.drivetrain).forEach(function (v) {
        push(v, function () { facets.forEach(function (f) { if (f.value === v) f.checked = false; }); });
      });
      if (s.hpMin != null || s.hpMax != null)
        push(rangeLabel(s.hpMin, s.hpMax, "", " hp"), function () { el.hpMin.value = ""; el.hpMax.value = ""; });
      if (s.priceMin != null || s.priceMax != null)
        push(rangeLabel(s.priceMin, s.priceMax, "$", ""), function () { el.priceMin.value = ""; el.priceMax.value = ""; });
      if (s.milesMin != null || s.milesMax != null)
        push(rangeLabel(s.milesMin, s.milesMax, "", " mi"), function () { el.milesMin.value = ""; el.milesMax.value = ""; });
      return out;
    }
    function rangeLabel(min, max, pre, suf) {
      var f = function (n) { return pre + Number(n).toLocaleString("en-US") + suf; };
      if (min != null && max != null) return f(min) + "–" + f(max);
      if (min != null) return f(min) + "+";
      return "Up to " + f(max);
    }
    function renderChips(s) {
      if (!chipsEl) return;
      chipsEl.innerHTML = "";
      activeChips(s).forEach(function (c) {
        var chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = c.label + " ";
        var b = document.createElement("button");
        b.setAttribute("aria-label", "Remove " + c.label);
        b.textContent = "×";
        b.addEventListener("click", function () { c.clear(); go(1); });
        chip.appendChild(b);
        chipsEl.appendChild(chip);
      });
    }

    /* ---------- pagination ---------- */
    function renderPager(page, total) {
      if (!pagerEl) return;
      var pages = Math.max(1, Math.ceil(total / ROWS));
      if (pages <= 1) { pagerEl.innerHTML = ""; return; }
      var html = "";
      html += page > 1
        ? '<a href="#" data-page="' + (page - 1) + '" aria-label="Previous">‹</a>'
        : '<span aria-hidden="true" style="opacity:.35">‹</span>';
      var nums = [];
      for (var i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) nums.push(i);
        else if (nums[nums.length - 1] !== "…") nums.push("…");
      }
      nums.forEach(function (n) {
        if (n === "…") html += "<span>…</span>";
        else if (n === page) html += '<span class="is-active">' + n + "</span>";
        else html += '<a href="#" data-page="' + n + '">' + n + "</a>";
      });
      html += page < pages
        ? '<a href="#" data-page="' + (page + 1) + '" aria-label="Next">›</a>'
        : '<span aria-hidden="true" style="opacity:.35">›</span>';
      pagerEl.innerHTML = html;
    }
    if (pagerEl) {
      pagerEl.addEventListener("click", function (e) {
        var a = e.target.closest("a[data-page]");
        if (!a) return;
        e.preventDefault();
        go(parseInt(a.getAttribute("data-page"), 10));
        var tb = document.querySelector(".results-toolbar");
        if (tb) tb.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    /* ---------- client-side fallback (demo inventory) ---------- */
    function matches(s, v) {
      if (s.make && v.make !== s.make) return false;
      if (s.model && v.model !== s.model) return false;
      if (s.generation && v.generation !== s.generation) return false;
      if (s.yearMin != null && v.year < s.yearMin) return false;
      if (s.yearMax != null && v.year > s.yearMax) return false;
      if (s.hpMin != null && v.hp < s.hpMin) return false;
      if (s.hpMax != null && v.hp > s.hpMax) return false;
      if (s.priceMin != null && v.price < s.priceMin) return false;
      if (s.priceMax != null && v.price > s.priceMax) return false;
      if (s.milesMin != null && v.miles < s.milesMin) return false;
      if (s.milesMax != null && v.miles > s.milesMax) return false;
      if (s.body_type.length && s.body_type.indexOf(v.body_type) === -1) return false;
      if (s.transmission.length && s.transmission.indexOf(v.transmission) === -1) return false;
      if (s.drivetrain.length && s.drivetrain.indexOf(v.drivetrain) === -1) return false;
      if (s.keyword) {
        var hay = (v.title + " " + v.generation + " " + v.body_type).toLowerCase();
        if (hay.indexOf(s.keyword.toLowerCase()) === -1) return false;
      }
      return true;
    }
    function sortDemo(list, sort) {
      var by = {
        newest: function (a, b) { return b.year - a.year || a.miles - b.miles; },
        oldest: function (a, b) { return a.year - b.year || b.miles - a.miles; },
        price_asc: function (a, b) { return a.price - b.price; },
        price_desc: function (a, b) { return b.price - a.price; },
        miles_asc: function (a, b) { return a.miles - b.miles; },
        miles_desc: function (a, b) { return b.miles - a.miles; },
      };
      return list.slice().sort(by[sort] || by.newest);
    }
    function fallback(s, page) {
      var all = demoInventory().filter(function (v) { return matches(s, v); });
      var sorted = sortDemo(all, s.sort);
      var startIdx = (page - 1) * ROWS;
      return { num_found: sorted.length, listings: sorted.slice(startIdx, startIdx + ROWS) };
    }
    var demoMode = false; // flipped once the live API proves unavailable

    /* ---------- render + fetch ---------- */
    function render(data, page) {
      var list = data.listings || [];
      if (countEl) {
        countEl.innerHTML =
          "<b>" + (data.num_found || 0).toLocaleString("en-US") + "</b> vehicles found";
        if (demoMode) {
          var note = document.createElement("span");
          note.style.cssText = "color:var(--text-muted);font-size:13px;margin-left:10px";
          note.textContent = "· sample inventory (run ./run.sh for live data)";
          countEl.appendChild(note);
        }
      }
      grid.innerHTML = list.length
        ? list.map(cardHTML).join("")
        : '<p style="color:var(--text-muted);grid-column:1/-1;padding:40px 0">No vehicles match these filters. Try widening your search.</p>';
      renderPager(page, data.num_found || 0);
    }

    var seq = 0;
    function go(page) {
      page = page || 1;
      var s = state();
      var mySeq = ++seq;
      grid.style.opacity = "0.45";
      writeURL(s, page);
      renderChips(s);
      var api = filterParams(s);
      api.set("rows", ROWS);
      api.set("start", (page - 1) * ROWS);
      fetch("/api/search?" + api.toString())
        .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
        .then(function (data) {
          if (mySeq !== seq) return;
          render(data, page);
        })
        .catch(function () {
          if (mySeq !== seq) return;
          demoMode = true;
          render(fallback(s, page), page);
        })
        .finally(function () { if (mySeq === seq) grid.style.opacity = ""; });
    }

    /* ---------- wire up controls ---------- */
    fillMakes();
    var startPage = readURL();

    if (el.make) el.make.addEventListener("change", function () {
      fillModels(el.make.value, "");
      fillGens(el.make.value, "", "");
      go(1);
    });
    if (el.model) el.model.addEventListener("change", function () {
      fillGens(el.make.value, el.model.value, "");
      go(1);
    });
    if (el.generation) el.generation.addEventListener("change", function () { go(1); });
    if (el.sort) el.sort.addEventListener("change", function () { go(1); });
    facets.forEach(function (f) { f.addEventListener("change", function () { go(1); }); });

    [el.keyword, el.yearMin, el.yearMax, el.hpMin, el.hpMax,
     el.priceMin, el.priceMax, el.milesMin, el.milesMax].forEach(function (input) {
      if (input) input.addEventListener("input", debounce(function () { go(1); }, 450));
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", function (e) {
        e.preventDefault();
        [el.make, el.model, el.generation, el.sort].forEach(function (s) { if (s) s.value = ""; });
        fillModels("", ""); fillGens("", "", "");
        [el.keyword, el.yearMin, el.yearMax, el.hpMin, el.hpMax,
         el.priceMin, el.priceMax, el.milesMin, el.milesMax].forEach(function (i) { if (i) i.value = ""; });
        facets.forEach(function (f) { f.checked = false; });
        if (el.sort) el.sort.value = "newest";
        go(1);
      });
    }

    go(startPage);
  }

  /* ---------------- DEALER-SCOPED SEARCH (search.html?dealer_id=) ---------------- */
  function initDealerScopedSearch(grid, countEl, chipsEl, pagerEl, dealerId) {
    grid.style.opacity = "0.45";
    if (pagerEl) pagerEl.innerHTML = "";
    fetch("/api/dealer?dealer_id=" + encodeURIComponent(dealerId) + "&rows=24")
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (data) {
        var list = data.listings || [];
        if (countEl) {
          countEl.innerHTML =
            "<b>" + (data.num_found || list.length).toLocaleString("en-US") + "</b> vehicles found";
        }
        grid.innerHTML = list.length
          ? list.map(cardHTML).join("")
          : '<p style="color:var(--text-muted);grid-column:1/-1;padding:40px 0">No live inventory available for this dealer right now.</p>';
        if (chipsEl) {
          chipsEl.innerHTML = "";
          var name = (data.dealer && data.dealer.name) || "This dealer";
          var chip = document.createElement("span");
          chip.className = "chip";
          chip.textContent = name + " ";
          var b = document.createElement("button");
          b.setAttribute("aria-label", "Clear dealer filter");
          b.textContent = "×";
          b.addEventListener("click", function () { location.href = "search.html"; });
          chip.appendChild(b);
          chipsEl.appendChild(chip);
        }
      })
      .catch(function () { /* keep the static demo grid on failure */ })
      .finally(function () { grid.style.opacity = ""; });
  }

  /* ---------------- DEALER PROFILE PAGES ---------------- */
  function initDealerPage() {
    var grid = document.querySelector("[data-dealer-inventory]");
    if (!grid) return;
    var id =
      new URLSearchParams(location.search).get("dealer_id") ||
      grid.getAttribute("data-dealer-id");
    if (!id) return;
    var countEl = document.querySelector("[data-dealer-count]");
    var viewAll = document.querySelector("[data-dealer-viewall]");
    if (viewAll) viewAll.setAttribute("href", "search.html?dealer_id=" + encodeURIComponent(id));

    fetch("/api/dealer?dealer_id=" + encodeURIComponent(id) + "&rows=9")
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (data) {
        var list = data.listings || [];
        if (!list.length) return; // keep the static design if nothing came back
        grid.innerHTML = list.map(cardHTML).join("");
        if (countEl && data.num_found) {
          countEl.textContent = data.num_found.toLocaleString("en-US");
        }
      })
      .catch(function () { /* keep the static design on failure */ });
  }

  /* ---------------- LISTING PAGE ---------------- */
  function initListingPage() {
    var id = new URLSearchParams(location.search).get("id");
    if (!id) return; // keep the static demo listing
    var titleEl = document.querySelector(".listing-title");
    if (!titleEl) return;

    fetch("/api/listing/" + encodeURIComponent(id))
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (v) {
        document.title = (v.title || "Listing") + " — Sports.Cars";
        titleEl.textContent = v.title || "Vehicle";
        var priceEl = document.querySelector(".listing-price");
        if (priceEl) priceEl.textContent = money(v.price);

        var specs = [
          ["Mileage", v.miles != null ? milesLabel(v.miles) : null],
          ["Generation", v.generation],
          ["Horsepower", v.hp ? v.hp + " hp" : null],
          ["Exterior color", v.exterior],
          ["Interior color", v.interior],
          ["Transmission", v.transmission],
          ["Drivetrain", v.drivetrain],
          ["Engine", v.engine],
          ["Body style", v.body_type],
          ["Location", v.location],
        ].filter(function (r) { return r[1]; });
        var specTable = document.querySelector(".spec-table");
        if (specTable) {
          specTable.innerHTML = specs.map(function (r) {
            return '<div class="spec-table__row"><span>' + esc(r[0]) + "</span><span>" + esc(r[1]) + "</span></div>";
          }).join("");
        }

        if (v.photos && v.photos.length) {
          if (window.__gallery && window.__gallery.load) window.__gallery.load(v.photos);
          else { var main = document.getElementById("galleryMain"); if (main) main.src = v.photos[0]; }
        }

        var sellerName = document.querySelector(".seller__name");
        if (sellerName && v.dealer) sellerName.childNodes[0].nodeValue = v.dealer + " ";
        if (v.vdp_url) {
          document.querySelectorAll('a[href="#"].btn--primary').forEach(function (a) {
            if (/contact seller/i.test(a.textContent)) {
              a.href = v.vdp_url; a.target = "_blank"; a.rel = "noopener";
            }
          });
        }
      })
      .catch(function () { /* keep static demo listing on failure */ });
  }

  function debounce(fn, ms) {
    if (!ms) return fn;
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  function boot() {
    initSearchPage();
    initListingPage();
    initDealerPage();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
