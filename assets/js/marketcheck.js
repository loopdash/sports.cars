/* ============================================================
   Sports.Cars — MarketCheck front-end
   Talks to the same-origin proxy (/api/*) which holds the key.
   Enhances the search + listing pages with live inventory;
   silently falls back to the static demo markup if the proxy
   or API is unavailable (e.g. opened as a plain static file).
   ============================================================ */

(function () {
  "use strict";

  var fav =
    '<button class="car-card__fav" aria-label="Save"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>';

  function money(n) {
    return typeof n === "number" ? "$" + n.toLocaleString("en-US") : "Call";
  }
  function miles(n) {
    return typeof n === "number" ? n.toLocaleString("en-US") + " mi" : "—";
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function cardHTML(v) {
    var media = v.photo
      ? '<img src="' + esc(v.photo) + '" alt="' + esc(v.title) + '" loading="lazy">'
      : "";
    return (
      '<a href="listing.html?id=' + encodeURIComponent(v.id) + '" class="car-card">' +
      '<div class="car-card__media">' + media + fav + "</div>" +
      '<div class="car-card__body"><div class="car-card__row">' +
      '<span class="car-card__name">' + esc(v.title || "Vehicle") + "</span>" +
      '<span class="car-card__price">' + money(v.price) + "</span></div>" +
      '<div class="car-card__meta"><span>' + miles(v.miles) + "</span>" +
      (v.location ? "<span>" + esc(v.location) + "</span>" : "") +
      "</div></div></a>"
    );
  }

  /* ---------------- SEARCH PAGE ---------------- */
  function initSearchPage() {
    var grid = document.getElementById("resultsGrid");
    var countEl = document.getElementById("resultsCount");
    if (!grid) return;

    var controls = {
      make: document.getElementById("f-make"),
      model: document.getElementById("f-model"),
      priceMin: document.getElementById("f-price-min"),
      priceMax: document.getElementById("f-price-max"),
      milesMax: document.getElementById("f-miles"),
      sort: document.getElementById("f-sort"),
      keyword: document.getElementById("f-keyword"),
    };
    var facets = Array.prototype.slice.call(document.querySelectorAll(".f-facet"));
    var chipsEl = document.getElementById("activeChips");
    var clearBtn = document.querySelector(".filters__clear");

    function val(el) {
      return el && el.value && el.value.indexOf("Any") !== 0 ? el.value.trim() : "";
    }
    function digits(s) { return (s || "").replace(/[^\d]/g, ""); }
    function facetVals(name) {
      return facets
        .filter(function (f) { return f.dataset.facet === name && f.checked; })
        .map(function (f) { return f.value; });
    }
    function priceLabel(min, max) {
      var f = function (n) { return "$" + Number(n).toLocaleString("en-US"); };
      if (min && max) return f(min) + "–" + f(max);
      if (min) return f(min) + "+";
      return "Up to " + f(max);
    }

    function params() {
      var p = new URLSearchParams();
      if (val(controls.make)) p.set("make", val(controls.make));
      if (val(controls.model)) p.set("model", val(controls.model));
      ["body_type", "transmission", "drivetrain"].forEach(function (name) {
        var v = facetVals(name);
        if (v.length) p.set(name, v.join(","));
      });
      if (digits(val(controls.priceMin))) p.set("price_min", digits(val(controls.priceMin)));
      if (digits(val(controls.priceMax))) p.set("price_max", digits(val(controls.priceMax)));
      if (val(controls.milesMax)) p.set("miles_max", digits(val(controls.milesMax)));
      if (val(controls.keyword)) p.set("keyword", val(controls.keyword));
      if (val(controls.sort)) p.set("sort", val(controls.sort));
      p.set("rows", "12");
      return p;
    }

    // Active filters → chips (each removable).
    function activeFilters() {
      var out = [];
      if (val(controls.make)) out.push({ label: val(controls.make), clear: function () { controls.make.selectedIndex = 0; } });
      if (val(controls.model)) out.push({ label: val(controls.model), clear: function () { controls.model.selectedIndex = 0; } });
      facets.forEach(function (f) {
        if (f.checked) out.push({ label: f.value, clear: function () { f.checked = false; } });
      });
      var pmin = digits(val(controls.priceMin)), pmax = digits(val(controls.priceMax));
      if (pmin || pmax) out.push({ label: priceLabel(pmin, pmax), clear: function () { controls.priceMin.value = ""; controls.priceMax.value = ""; } });
      if (val(controls.milesMax)) out.push({ label: "Under " + Number(digits(val(controls.milesMax))).toLocaleString("en-US") + " mi", clear: function () { controls.milesMax.selectedIndex = 0; } });
      if (val(controls.keyword)) out.push({ label: '"' + val(controls.keyword) + '"', clear: function () { controls.keyword.value = ""; } });
      return out;
    }
    function renderChips() {
      if (!chipsEl) return;
      chipsEl.innerHTML = "";
      activeFilters().forEach(function (f) {
        var chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = f.label + " ";
        var b = document.createElement("button");
        b.setAttribute("aria-label", "Remove " + f.label);
        b.textContent = "×";
        b.addEventListener("click", function () { f.clear(); run(); });
        chip.appendChild(b);
        chipsEl.appendChild(chip);
      });
    }

    var seq = 0;
    function run() {
      var mySeq = ++seq;
      grid.style.opacity = "0.45";
      renderChips();
      fetch("/api/search?" + params().toString())
        .then(function (r) {
          if (!r.ok) throw new Error("http " + r.status);
          return r.json();
        })
        .then(function (data) {
          if (mySeq !== seq) return; // a newer request superseded this one
          if (countEl) {
            countEl.innerHTML =
              "<b>" + (data.num_found || 0).toLocaleString("en-US") + "</b> vehicles found";
          }
          var list = data.listings || [];
          grid.innerHTML = list.length
            ? list.map(cardHTML).join("")
            : '<p style="color:var(--text-muted);grid-column:1/-1;padding:40px 0">No vehicles match these filters. Try widening your search.</p>';
        })
        .catch(function () {
          if (mySeq !== seq) return;
          if (countEl && !countEl.dataset.flagged) {
            countEl.dataset.flagged = "1";
            var note = document.createElement("span");
            note.style.cssText = "color:var(--text-muted);font-size:13px;margin-left:10px";
            note.textContent = "· showing sample data (start ./run.sh for live inventory)";
            countEl.appendChild(note);
          }
        })
        .finally(function () {
          if (mySeq === seq) grid.style.opacity = "";
        });
    }

    // Re-run on any change; debounce text inputs.
    Object.keys(controls).forEach(function (k) {
      var el = controls[k];
      if (!el) return;
      var ev = el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(ev, debounce(run, ev === "input" ? 450 : 0));
    });
    facets.forEach(function (f) { f.addEventListener("change", run); });
    if (clearBtn) {
      clearBtn.addEventListener("click", function (e) {
        e.preventDefault();
        [controls.make, controls.model, controls.milesMax, controls.sort].forEach(function (s) { if (s) s.selectedIndex = 0; });
        [controls.priceMin, controls.priceMax, controls.keyword].forEach(function (i) { if (i) i.value = ""; });
        facets.forEach(function (f) { f.checked = false; });
        run();
      });
    }

    run();
  }

  /* ---------------- LISTING PAGE ---------------- */
  function initListingPage() {
    var id = new URLSearchParams(location.search).get("id");
    if (!id) return; // keep the static demo listing
    var titleEl = document.querySelector(".listing-title");
    if (!titleEl) return;

    fetch("/api/listing/" + encodeURIComponent(id))
      .then(function (r) {
        if (!r.ok) throw new Error("http " + r.status);
        return r.json();
      })
      .then(function (v) {
        document.title = (v.title || "Listing") + " — Sports.Cars";
        titleEl.textContent = v.title || "Vehicle";
        var priceEl = document.querySelector(".listing-price");
        if (priceEl) priceEl.textContent = money(v.price);

        var specs = [
          ["Mileage", v.miles != null ? miles(v.miles) : null],
          ["Exterior color", v.exterior],
          ["Interior color", v.interior],
          ["Transmission", v.transmission],
          ["Drivetrain", v.drivetrain],
          ["Engine", v.engine],
          ["Body style", v.body_type],
          ["Location", v.location],
        ].filter(function (r) {
          return r[1];
        });
        var specTable = document.querySelector(".spec-table");
        if (specTable) {
          specTable.innerHTML = specs
            .map(function (r) {
              return (
                '<div class="spec-table__row"><span>' +
                esc(r[0]) + "</span><span>" + esc(r[1]) + "</span></div>"
              );
            })
            .join("");
        }

        // Gallery — hand the full photo set to the carousel controller.
        if (v.photos && v.photos.length) {
          if (window.__gallery && window.__gallery.load) {
            window.__gallery.load(v.photos);
          } else {
            var main = document.getElementById("galleryMain");
            if (main) main.src = v.photos[0];
          }
        }

        // Dealer name + VDP link
        var sellerName = document.querySelector(".seller__name");
        if (sellerName && v.dealer) {
          sellerName.childNodes[0].nodeValue = v.dealer + " ";
        }
        if (v.vdp_url) {
          document.querySelectorAll('a[href="#"].btn--primary').forEach(function (a) {
            if (/contact seller/i.test(a.textContent)) {
              a.href = v.vdp_url;
              a.target = "_blank";
              a.rel = "noopener";
            }
          });
        }
      })
      .catch(function () {
        /* keep static demo listing on failure */
      });
  }

  function debounce(fn, ms) {
    if (!ms) return fn;
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function boot() {
    initSearchPage();
    initListingPage();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
