/* ============================================================
   Sports.Cars — Concept #3 homepage behaviour
   Hero carousel, custom filter dropdowns, explore preview,
   favourites, newsletter. Vanilla JS. No dependencies.
   Card and panel hover states are pure CSS — see concept3.css.
   ============================================================ */

(function () {
  "use strict";

  var CAT_NAMES = ["EXOTICS", "SUPERCARS", "TRACK CARS", "CLASSIC SPORTS CARS", "MODERN PERFORMANCE", "RARE & COLLECTIBLE"];

  function pad(n) { return ("00" + n).slice(-3); }

  /* ---------- Hero carousel ---------- */
  function initHero() {
    var hero = document.querySelector("[data-c3-hero]");
    if (!hero) return;
    var slides = [].slice.call(hero.querySelectorAll(".c3-hero__slide"));
    var dots = [].slice.call(hero.querySelectorAll("[data-c3-dot]"));
    var cur = hero.querySelector("[data-c3-current]");
    if (slides.length < 2) return;

    var idx = 0, timer = null, DELAY = 3000;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle("is-active", n === idx); });
      dots.forEach(function (d, n) { d.classList.toggle("is-active", n === idx); });
      if (cur) cur.textContent = pad(idx + 1);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() { stop(); if (!reduced) timer = setInterval(function () { show(idx + 1); }, DELAY); }

    dots.forEach(function (d, n) { d.addEventListener("click", function () { show(n); start(); }); });
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });

    show(0);
    start();
  }

  /* ---------- Custom filter dropdowns ----------
     Native <select> popups are drawn by the OS and can't carry the
     brand; these are buttons + panels writing to hidden inputs. */
  function initFields() {
    var fields = [].slice.call(document.querySelectorAll("[data-c3-field]"));
    if (!fields.length) return;

    fields.forEach(function (field) {
      var toggle = field.querySelector("[data-c3-toggle]");
      var value = field.querySelector("[data-c3-value]");
      var hidden = field.querySelector("input[type=hidden]");
      var opts = [].slice.call(field.querySelectorAll("[data-c3-opt]"));

      toggle.addEventListener("click", function () {
        var open = field.classList.contains("is-open");
        fields.forEach(function (f) { f.classList.remove("is-open"); });
        field.classList.toggle("is-open", !open);
      });

      opts.forEach(function (opt, i) {
        opt.addEventListener("click", function () {
          var label = opt.getAttribute("data-c3-opt");
          value.textContent = label;
          opts.forEach(function (o) { o.classList.remove("is-active"); });
          opt.classList.add("is-active");
          // index 0 is the "Any …" default — treat it as unset
          toggle.classList.toggle("is-set", i > 0);
          if (hidden) hidden.value = i > 0 ? label : "";
          field.classList.remove("is-open");
        });
      });
    });

    document.addEventListener("mousedown", function (e) {
      if (e.target.closest("[data-c3-field]")) return;
      fields.forEach(function (f) { f.classList.remove("is-open"); });
    });
  }

  /* ---------- Hero search: hand off to the search page ----------
     Mirrors the mapping in main.js initFilters so search.html reads
     the same query keys. */
  function initFilterForm() {
    var form = document.querySelector("[data-c3-filter]");
    if (!form) return;
    var note = document.querySelector("[data-c3-note]");

    function val(key) {
      var input = form.querySelector('input[name="' + key + '"]');
      return input && input.value ? input.value.trim() : "";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var make = val("make"), model = val("model"), price = val("price"), body = val("body");
      var locEl = form.querySelector("#f-loc");
      var loc = locEl && locEl.value.trim() !== "" ? locEl.value.trim() : "";

      var parts = [make, model, price, body, loc].filter(Boolean);
      if (note) note.textContent = parts.length ? "Searching " + parts.join(" · ") : "Searching all inventory";

      var p = new URLSearchParams();
      if (make) p.set("make", make);
      if (model) p.set("keyword", model);
      if (body) p.set("body_type", body);
      if (price) {
        if (/under/i.test(price)) p.set("price_max", "100000");
        else if (/250k\+/i.test(price)) p.set("price_min", "250000");
        else if (/100k/i.test(price) && /250k/i.test(price)) { p.set("price_min", "100000"); p.set("price_max", "250000"); }
      }
      var qs = p.toString();
      window.location.href = "search.html" + (qs ? "?" + qs : "");
    });
  }

  /* ---------- Explore: rows drive the sticky preview ---------- */
  function initExplore() {
    var root = document.querySelector("[data-c3-explore]");
    if (!root) return;
    var rows = [].slice.call(root.querySelectorAll("[data-c3-row]"));
    var panes = [].slice.call(root.querySelectorAll("[data-c3-pane]"));
    var idxEl = root.querySelector("[data-c3-pidx]");
    var nameEl = root.querySelector("[data-c3-pname]");

    rows.forEach(function (row, i) {
      row.addEventListener("mouseenter", function () {
        rows.forEach(function (r) { r.classList.remove("is-active"); });
        row.classList.add("is-active");
        panes.forEach(function (p, n) { p.classList.toggle("is-active", n === i); });
        if (idxEl) idxEl.textContent = pad(i + 1);
        if (nameEl) nameEl.textContent = CAT_NAMES[i] || "";
      });
    });
  }

  /* ---------- Search dock: the hero search clips under the nav ---------- */
  function initSearchDock() {
    var dock = document.querySelector("[data-c3-searchdock]");
    if (!dock) return;
    var form = dock.querySelector(".c3-search");
    var nav = document.querySelector(".c3-nav");
    if (!form || !nav) return;

    var docked = false;
    var restH = 0;     // the form's height in its resting (hero) state
    var restTop = 0;   // its document offset, measured while undocked
    var ticking = false;

    function measure() {
      if (docked) return;
      restH = form.offsetHeight;
      restTop = dock.getBoundingClientRect().top + window.pageYOffset;
      dock.style.setProperty("--c3-dock-h", restH + "px");
    }

    function update() {
      ticking = false;
      var navH = nav.offsetHeight;
      // Dock once the resting position would slide up under the nav; undock a
      // little later so the two states can't fight over a single pixel.
      var shouldDock = window.pageYOffset > restTop - navH + (docked ? -2 : 0);
      if (shouldDock === docked) return;
      docked = shouldDock;
      dock.classList.toggle("is-docked", docked);
      document.body.classList.toggle("is-search-docked", docked);
      // Publish the docked bar's height so sticky elements can clear it.
      document.documentElement.style.setProperty(
        "--c3-dock-bar-h", (docked ? form.offsetHeight : 0) + "px"
      );
      if (!docked) measure();
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      if (docked) {
        // Re-measure from the resting state, then re-apply.
        dock.classList.remove("is-docked");
        docked = false;
        measure();
      }
      update();
    });
  }

  /* ---------- Favourites ---------- */
  function initFavorites() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".c3-car__fav");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle("is-active");
    });
  }

  /* ---------- Newsletter ---------- */
  function initSignup() {
    var form = document.querySelector("[data-c3-signup]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var done = document.createElement("p");
      done.className = "c3-cta__done";
      done.textContent = "Thanks — you're on the list. We'll only email about new arrivals.";
      form.replaceWith(done);
    });
  }

  function init() {
    initHero();
    initFields();
    initFilterForm();
    initExplore();
    initSearchDock();
    initFavorites();
    initSignup();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
