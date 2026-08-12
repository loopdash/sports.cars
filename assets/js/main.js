/* ============================================================
   Sports.Cars — main.js
   Component includes, nav, scroll motion, sliders, favorites.
   Vanilla JS. No dependencies.
   ============================================================ */

(function () {
  "use strict";

  /* Failed images degrade to the branded gradient behind them.
     Capture-phase so it catches errors before init runs. */
  document.addEventListener(
    "error",
    function (e) {
      var t = e.target;
      if (t && t.tagName === "IMG") t.classList.add("img-failed");
    },
    true
  );

  /* ---------- Shared components (single source) ----------
     Header + footer live here as strings and get injected into
     [data-include="header"] / [data-include="footer"] placeholders.
     Kept in JS (not fetched) so the prototype works from file:// with
     no server. Maps 1:1 to WP header.php / footer.php later. */
  var PARTIALS = {
    header:
      '<header class="nav"><div class="nav__inner">' +
        '<a href="index.html" class="nav__logo" aria-label="Sports.Cars home"><b>SPORTS</b><span>.CARS</span></a>' +
        '<nav class="nav__links" aria-label="Primary">' +
          '<a href="index.html" class="nav__link" data-nav="buy">Buy a Car</a>' +
          '<a href="sell.html" class="nav__link" data-nav="sell">Sell a Car</a>' +
          '<a href="dealers.html" class="nav__link" data-nav="dealers">Dealers</a>' +
          '<a href="resources.html" class="nav__link" data-nav="resources">Resources</a>' +
          '<a href="company.html" class="nav__link" data-nav="company">Company</a>' +
        '</nav>' +
        '<div class="nav__actions">' +
          '<button class="nav__saved" aria-label="Saved cars">Saved</button>' +
          '<a href="#" class="nav__login">Log in</a>' +
          '<a href="sell.html" class="nav__cta">List Your Car</a>' +
          '<button class="nav__toggle" aria-label="Menu">Menu</button>' +
        '</div>' +
      '</div></header>' +
      '<div class="mobile-menu">' +
        '<a href="index.html">Buy a Car</a><a href="sell.html">Sell a Car</a>' +
        '<a href="dealers.html">Dealers</a><a href="resources.html">Resources</a>' +
        '<a href="company.html">Company</a><a href="#">Log in</a>' +
        '<a href="sell.html" class="btn btn--primary btn--block btn--lg">List Your Car</a>' +
      '</div>',
    footer:
      '<footer class="footer"><div class="container">' +
        '<div class="footer__top">' +
          '<div class="footer__brand">' +
            '<div class="footer__brand-logo"><b>SPORTS</b><span>.CARS</span></div>' +
            '<p class="footer__tagline">The world\'s premier marketplace for exotics and sports cars.</p>' +
            '<div class="footer__social">' +
              '<a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg></a>' +
              '<a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>' +
              '<a href="#" aria-label="X"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/></svg></a>' +
              '<a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8h4V24h-4zM8 8h3.8v2.2h.05c.53-1 1.83-2.2 3.77-2.2 4 0 4.75 2.65 4.75 6.1V24h-4v-6.9c0-1.65-.03-3.77-2.3-3.77-2.3 0-2.65 1.8-2.65 3.65V24H8z"/></svg></a>' +
            '</div>' +
          '</div>' +
          '<div class="footer__col"><h4>Marketplace</h4><a href="index.html">Buy a Car</a><a href="search.html">Search Results</a><a href="sell.html">Sell a Car</a><a href="dealers.html">Dealers</a><a href="dealer-signup.html">Become a Dealer</a></div>' +
          '<div class="footer__col"><h4>Resources</h4><a href="resources.html">Car Guides</a><a href="article.html">Articles</a><a href="resources.html">Market Insights</a><a href="resources.html">Buying Tips</a><a href="resources.html">Selling Tips</a></div>' +
          '<div class="footer__col"><h4>Company</h4><a href="about.html">About Us</a><a href="company.html">Our Team</a><a href="contact.html">Contact Us</a><a href="#">Careers</a><a href="#">Press</a></div>' +
          '<div class="footer__col"><h4>Support</h4><a href="contact.html">Help Center</a><a href="#">Trust &amp; Safety</a><a href="#">Terms of Service</a><a href="privacy.html">Privacy Policy</a><a href="sitemap.html">Sitemap</a></div>' +
        '</div>' +
        '<div class="footer__bottom"><span>© 2026 Sports.Cars. All rights reserved.</span><span><a href="privacy.html">Privacy Policy</a> · <a href="#">Terms of Service</a> · <a href="sitemap.html">Sitemap</a></span></div>' +
      '</div></footer>'
  };

  function loadIncludes() {
    document.querySelectorAll("[data-include]").forEach(function (el) {
      var key = el.getAttribute("data-include");
      if (PARTIALS[key]) el.outerHTML = PARTIALS[key];
    });
    init();
  }

  /* ---------- Init everything after includes land ---------- */
  function init() {
    markActiveNav();
    initMobileMenu();
    initReveal();
    initSliders();
    initHero();
    initCarCta();
    initFavorites();
    initFilters();
    initSearchReveal();
    initSignup();
    initGallery();
    initTabs();
    initSearchUI();
  }

  /* ---------- Search results: filter drawer + chip removal ---------- */
  function initSearchUI() {
    var toggle = document.getElementById("filterToggle");
    var filters = document.getElementById("filters");
    if (toggle && filters) {
      toggle.addEventListener("click", function () { filters.classList.toggle("is-open"); });
    }
    document.querySelectorAll(".chip button").forEach(function (btn) {
      btn.addEventListener("click", function () { btn.closest(".chip").remove(); });
    });
  }

  /* ---------- Listing gallery carousel ----------
     Arrows + thumbnails + keyboard + swipe + gentle autoplay.
     Cycles through ALL photos. Exposes window.__gallery.load(photos)
     so the MarketCheck layer can feed live images. */
  function initGallery() {
    var main = document.getElementById("galleryMain");
    if (!main) return;
    var mainWrap = main.closest(".gallery__main");
    var root = mainWrap ? mainWrap.parentNode : main.parentNode;
    var thumbsWrap = root.querySelector(".gallery__thumbs");
    var countEl = mainWrap ? mainWrap.querySelector(".gallery__count") : null;

    // Seed from existing thumbnails (static demo), upgrading to large size.
    var photos = [];
    root.querySelectorAll(".gallery__thumb img").forEach(function (img) {
      var src = img.getAttribute("src") || "";
      photos.push(src.replace(/w=300&q=60/, "w=1400&q=80"));
    });
    if (!photos.length && main.getAttribute("src")) photos = [main.getAttribute("src")];

    var idx = 0, timer = null, interacted = false;

    function render() {
      if (!photos.length) return;
      // Fade between photos so advancing is visible.
      main.style.opacity = "0";
      main.onload = function () { main.style.opacity = "1"; };
      main.src = photos[idx];
      setTimeout(function () { main.style.opacity = "1"; }, 400);
      if (countEl) countEl.textContent = idx + 1 + " / " + photos.length;
      var thumbs = thumbsWrap ? thumbsWrap.querySelectorAll(".gallery__thumb") : [];
      thumbs.forEach(function (t, i) { t.classList.toggle("is-active", i === idx); });
      var active = thumbs[idx];
      if (active && active.scrollIntoView) {
        active.scrollIntoView({ inline: "nearest", block: "nearest" });
      }
    }
    function go(i) { idx = (i + photos.length) % photos.length; render(); }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
    function startAuto() {
      stopAuto();
      if (interacted || photos.length < 2) return;
      timer = setInterval(function () { go(idx + 1); }, 4500);
    }
    function nav(fn) {
      return function (e) {
        if (e) e.preventDefault();
        interacted = true;
        stopAuto();
        fn();
      };
    }

    function buildThumbs() {
      if (!thumbsWrap) return;
      thumbsWrap.innerHTML = photos
        .map(function (src, i) {
          return (
            '<div class="gallery__thumb' + (i === 0 ? " is-active" : "") +
            '"><img src="' + src + '" alt="" loading="lazy"></div>'
          );
        })
        .join("");
      thumbsWrap.querySelectorAll(".gallery__thumb").forEach(function (t, i) {
        t.addEventListener("click", nav(function () { go(i); }));
      });
    }

    if (mainWrap) {
      var prevBtn = mainWrap.querySelector(".gallery__nav--prev");
      var nextBtn = mainWrap.querySelector(".gallery__nav--next");
      if (prevBtn) prevBtn.addEventListener("click", nav(function () { go(idx - 1); }));
      if (nextBtn) nextBtn.addEventListener("click", nav(function () { go(idx + 1); }));
      mainWrap.addEventListener("mouseenter", stopAuto);
      mainWrap.addEventListener("mouseleave", function () { if (!interacted) startAuto(); });

      var sx = null;
      mainWrap.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
      mainWrap.addEventListener("touchend", function (e) {
        if (sx == null) return;
        var dx = e.changedTouches[0].clientX - sx;
        sx = null;
        if (Math.abs(dx) > 40) nav(function () { go(dx < 0 ? idx + 1 : idx - 1); })();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (!document.getElementById("galleryMain")) return;
      if (e.key === "ArrowLeft") nav(function () { go(idx - 1); })(e);
      else if (e.key === "ArrowRight") nav(function () { go(idx + 1); })(e);
    });

    // Live loader for the MarketCheck layer.
    window.__gallery = {
      load: function (list) {
        if (!list || !list.length) return;
        photos = list.slice();
        idx = 0;
        interacted = false;
        buildThumbs();
        render();
        startAuto();
      },
    };

    buildThumbs();
    render();
    startAuto();
  }

  /* ---------- Tabs (dealer premier) ---------- */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      var tabs = group.querySelectorAll(".tab");
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var target = tab.getAttribute("data-tab");
          tabs.forEach(function (t) { t.classList.remove("is-active"); });
          tab.classList.add("is-active");
          group.querySelectorAll(".tab-panel").forEach(function (p) {
            p.classList.toggle("is-active", p.getAttribute("data-panel") === target);
          });
        });
      });
    });
  }

  /* ---------- Active nav state ---------- */
  function markActiveNav() {
    var page = document.body.getAttribute("data-page");
    if (!page) return;
    document.querySelectorAll(".nav__link[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === page) a.classList.add("is-active");
    });
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var toggle = document.querySelector(".nav__toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      document.body.style.overflow = menu.classList.contains("is-open") ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Scroll-in reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Featured sliders (dots) ---------- */
  function initSliders() {
    document.querySelectorAll("[data-slider]").forEach(function (slider) {
      var track = slider.querySelector("[data-slider-track]");
      var dots = slider.querySelectorAll("[data-slider-dot]");
      if (!track || !dots.length) return;

      function pageCount() {
        return Math.max(1, Math.round(track.scrollWidth / track.clientWidth));
      }
      function setActive() {
        var idx = Math.round(track.scrollLeft / track.clientWidth);
        dots.forEach(function (d, i) { d.classList.toggle("is-active", i === idx); });
      }
      dots.forEach(function (d, i) {
        d.addEventListener("click", function () {
          track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
        });
      });
      track.addEventListener("scroll", function () {
        window.requestAnimationFrame(setActive);
      });
      setActive();
    });
  }

  /* ---------- Car cards: inject the hover "Buy Now" button ----------
     Added via JS so it isn't a nested <a> inside the card link; the
     whole card already links to the listing. */
  function initCarCta() {
    document.querySelectorAll(".car-card__overlay").forEach(function (ov) {
      if (ov.querySelector(".car-card__cta")) return;
      var cta = document.createElement("span");
      cta.className = "car-card__cta";
      cta.textContent = "Buy Now";
      ov.appendChild(cta);
    });
  }

  /* ---------- Favorite toggles ---------- */
  function initFavorites() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".car-card__fav");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle("is-active");
    });
  }

  /* ---------- Hero carousel (homepage) ----------
     Full-bleed crossfading showcase. Auto-advances, pauses on hover
     and when the tab is hidden, honors reduced-motion. Line indicators
     + slide counter — no icon controls. */
  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero__slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var curEl = hero.querySelector("[data-hero-current]");
    if (slides.length < 2) return;

    var idx = 0, timer = null, DELAY = 5500;
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle("is-active", n === idx); });
      dots.forEach(function (d, n) { d.classList.toggle("is-active", n === idx); });
      if (curEl) curEl.textContent = pad(idx + 1);
    }
    function next() { show(idx + 1); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      stop();
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      timer = setInterval(next, DELAY);
    }

    dots.forEach(function (d, n) {
      d.addEventListener("click", function () { show(n); start(); });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    show(0);
    start();
  }

  /* ---------- Hero search: reveal Location once the user engages ----------
     Starts as a 2x2 (Make/Model, Price/Body); the full-width Location
     field slides open on the first field change. */
  function initSearchReveal() {
    var form = document.querySelector(".searchbar");
    if (!form) return;
    var loc = form.querySelector(".searchbar__field--wide");
    if (!loc) return;
    function open() { loc.classList.add("is-open"); }
    form.querySelectorAll(".searchbar__fields select").forEach(function (sel) {
      sel.addEventListener("change", open);
    });
  }

  /* ---------- Newsletter signup (demo) ---------- */
  function initSignup() {
    var form = document.querySelector("[data-signup]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("[type=submit]");
      var input = form.querySelector("input");
      if (btn) btn.textContent = "Joined";
      if (input) { input.value = ""; input.placeholder = "You're on the list"; input.blur(); }
    });
  }

  /* ---------- Buy-a-car filter demo (client-side, prototype only) ---------- */
  function initFilters() {
    var form = document.querySelector("[data-filter-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("[type=submit]");
      if (btn) {
        var original = btn.textContent;
        btn.textContent = "Searching…";
        setTimeout(function () { btn.textContent = original; }, 900);
      }
    });
  }

  /* ---------- Boot ---------- */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadIncludes);
  } else {
    loadIncludes();
  }
})();
