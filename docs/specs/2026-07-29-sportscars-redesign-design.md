# Sports.Cars — Phase 2/3 Redesign Design Spec

**Date:** 2026-07-29
**Status:** Approved (design language)
**Owner:** Loopdash

## Goal

Redesign the Sports.Cars marketplace from the existing dark/red/dense prototypes
into a cleaner, high-end, "Apple-caliber" aesthetic. Deliverable is a set of
**high-fidelity, clickable static HTML/CSS/JS prototypes** structured as reusable
components, so they drop cleanly into WordPress templates later.

## Constraints

- **Stack:** Plain HTML, CSS, and vanilla JS / jQuery (only where genuinely
  needed). No framework, no build step required. Target platform is WordPress.
- **Component-oriented:** shared header/footer and repeated UI (car cards, CTAs,
  feature rows) authored once and reused, mapping to WP `header.php`,
  `footer.php`, and template parts.
- Existing logo and brand (red wordmark) used as-is.

## Design Language (approved)

**Direction:** Hybrid of "refined dark" + "light & airy" — Apple product-page
model. Light, airy chrome and content sections, punctuated by dark cinematic
full-bleed moments (hero, gallery) where the car takes over the screen.

### Palette (CSS tokens)
- Light surfaces: `--bg` `#ffffff`, `--bg-alt` `#f5f5f7`
- Dark surfaces: `--bg-dark` `#0a0a0a`, `--bg-dark-alt` `#111113`
- Text: `--text` `#1d1d1f`, `--text-muted` `#6e6e73`, on-dark `#f5f5f7`
- Hairline: `--line` `#d2d2d7`
- Accent (restrained): `--red` `#e8071f`, used ONLY for primary CTAs and rare
  key links. No red icons/borders/eyebrows.

### Typography
- System stack: `-apple-system, "SF Pro Display", "Inter", system-ui, sans-serif`
  (real San Francisco on Apple devices; Inter fallback).
- Sentence-case, large, tight, semibold headlines. No uppercase condensed
  headers. Uppercase only for small letter-spaced eyebrow labels.
- Type scale (approx): display 56–80px, h1 40–48, h2 28–32, body 17, small 13–14.

### Layout & components
- 8pt spacing grid, max content width ~1120–1200px, tall section padding.
- Frosted translucent sticky nav (backdrop-blur).
- Borderless, image-forward car cards: image + clean text, subtle hover lift +
  shadow. No boxes.
- Buttons: filled red primary, quiet gray/ghost secondary; soft/pill radius.
- Motion: subtle scroll-in fade/slide, hover lifts. Nothing flashy.

## File structure

```
/assets/css/styles.css      # tokens + all component/page styles
/assets/js/main.js          # nav, includes, scroll motion, sliders
/partials/header.html       # shared nav
/partials/footer.html       # shared footer
/index.html                 # Buy a Car (home/landing) — FLAGSHIP
/listing.html               # Buy a Car listing detail
/sell.html                  # Sell a Car
/dealers.html               # Dealer signup / levels
/dealer-basic.html          # Basic dealer profile
/dealer-premium.html        # Premium dealer profile
/dealer-premier.html        # Premier dealer profile
/resources.html             # Resources hub
/company.html               # Company / about
```

Header/footer injected client-side via a tiny fetch include in `main.js`
(`data-include="partials/header.html"`), keeping them single-sourced.

## Pages (from prototypes, re-designed)

1. **Buy a Car (home)** — cinematic dark hero + search bar; light "browse by
   category"; featured cars; trust row; find by brand; closing CTA. FLAGSHIP.
2. **Listing detail** — gallery, key specs, seller card, highlights, history &
   confidence, financing estimate, similar listings.
3. **Sell a Car** — hero, selling process, why-sell, listing option tiers,
   success stories, closing CTA.
4. **Dealers** — hero, benefits, dealer level tiers, trusted-by, integration,
   closing CTA.
5. **Dealer profiles** — Basic, Premium, Premier (increasing richness).
6. **Resources** — hero + search, browse by topic, featured articles, popular
   guides, market snapshot.
7. **Company** — hero, mission/story, stats, community, leadership, values, CTA.

## Approach

Build the flagship **Buy a Car** page first to lock the language (nav, hero,
cards, buttons, footer, motion). Get sign-off, then roll the established system
across the remaining pages.

## Out of scope (per Phase 2/3 contract)

Backend, MarketCheck integration, real search, dealer dashboards, payments,
credit metering. These are static prototypes only.
