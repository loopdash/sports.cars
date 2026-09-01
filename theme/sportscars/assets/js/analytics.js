/* ============================================================
   Sports.Cars — GA4 + event tracking
   ------------------------------------------------------------
   Inert by design: nothing is loaded and no data leaves the
   browser until a REAL GA4 measurement ID is supplied. Set it
   either way:

     <meta name="ga4-id" content="G-XXXXXXXXXX">
   or, before this script runs:
     <script>window.SC_GA4_ID = "G-XXXXXXXXXX";</script>

   With no valid ID, window.scTrack() is a no-op and gtag.js is
   never fetched — so this can ship now and "go live" the moment
   the ID is dropped in (or set as a WordPress theme option).

   Event tracking is wired through document-level delegation, so
   it covers every current and future page with no per-page code:
     search · select_item · view_item · contact_seller ·
     save_item · newsletter_signup
   ============================================================ */
(function () {
  "use strict";

  var PLACEHOLDER = "G-XXXXXXXXXX";

  function resolveId() {
    if (typeof window.SC_GA4_ID === "string" && window.SC_GA4_ID) return window.SC_GA4_ID;
    var meta = document.querySelector('meta[name="ga4-id"]');
    return meta ? meta.getAttribute("content") : "";
  }

  var id = resolveId();
  var valid = /^G-[A-Z0-9]{6,}$/.test(id) && id !== PLACEHOLDER;

  if (!valid) {
    // Stay silent on the wire; expose a no-op so event wiring is safe to call.
    window.scTrack = function () {};
    if (window.console && console.info) {
      console.info("[Sports.Cars] Analytics inert — set a GA4 ID (window.SC_GA4_ID or <meta name=\"ga4-id\">) to enable.");
    }
  } else {
    // Standard gtag.js bootstrap.
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", id, { anonymize_ip: true });

    window.scTrack = function (name, params) {
      try { gtag("event", name, params || {}); } catch (e) { /* never break the UI for analytics */ }
    };
  }

  /* ---------- delegated event tracking (runs regardless of ID) ---------- */
  function txt(el) { return (el && el.textContent || "").trim(); }

  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (form.matches && form.matches("[data-c3-filter]")) {
      window.scTrack("search", { source: "hero" });
    } else if (form.matches && form.matches("[data-c3-signup]")) {
      window.scTrack("newsletter_signup", {});
    }
  }, true);

  document.addEventListener("click", function (e) {
    var card = e.target.closest && e.target.closest("a.car-card, a.c3-car");
    if (card) {
      window.scTrack("select_item", { link: card.getAttribute("href") || "" });
      return;
    }
    var fav = e.target.closest && e.target.closest(".c3-car__fav, .car-card__fav");
    if (fav) { window.scTrack("save_item", {}); return; }
    var btn = e.target.closest && e.target.closest("a.btn--primary, button.btn--primary");
    if (btn && /contact seller/i.test(txt(btn))) {
      window.scTrack("contact_seller", {});
    }
  }, true);

  // view_item on a listing detail page.
  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  onReady(function () {
    if (document.querySelector(".listing-title")) {
      var params = new URLSearchParams(location.search);
      window.scTrack("view_item", { id: params.get("id") || "static" });
    }
  });
})();
