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
          '<button class="nav__icon-btn" aria-label="Saved cars"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>' +
          '<a href="#" class="nav__login">Log in</a>' +
          '<a href="sell.html" class="nav__cta">List Your Car</a>' +
          '<button class="nav__toggle" aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>' +
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
        '<div class="footer__press"><span>TopGear</span><span>duPont REGISTRY</span><span>HAGERTY</span><span>Forbes</span><span>ROAD&amp;TRACK</span><span>CAR and DRIVER</span></div>' +
        '<div class="footer__top">' +
          '<div class="footer__brand">' +
            '<div class="footer__brand-logo"><b>SPORTS</b><span>.CARS</span></div>' +
            '<p class="footer__tagline">The world\'s premier marketplace for exotics and sports cars.</p>' +
            '<div class="footer__social">' +
              '<a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>' +
              '<a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/></svg></a>' +
              '<a href="#" aria-label="X"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2h3.3l-7.2 8.3L23.5 22h-6.6l-5.2-6.8L5.8 22H2.5l7.7-8.9L2 2h6.8l4.7 6.2L18.9 2zm-1.2 18h1.8L7.4 3.9H5.5z"/></svg></a>' +
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
    initFavorites();
    initFilters();
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
