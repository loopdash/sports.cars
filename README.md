# Sports.Cars — Marketplace Prototype

High-fidelity, clickable front-end prototype for **Sports.Cars**, a curated
marketplace for enthusiast and performance vehicles. This is the Phase 2/3
**design** deliverable: a clean, high-end, "Apple-caliber" redesign of the
original prototypes, built as static HTML/CSS/JS so it drops cleanly into
WordPress templates later.

No framework, no build step, no backend — open the files and click through.

## WordPress build (`theme/sportscars/`)

The static build has been ported to a WordPress theme in **`theme/sportscars/`**
and is live on the WP Engine staging install **`sportscars1`**
(`https://sportscars1.wpenginepowered.com`, staging password `ShapeTomorrow`).

- `node build-theme.mjs` ports the concept3 static pages into theme templates
  and emits `assets/data/taxonomy.json` for the PHP proxy.
- MarketCheck runs server-side as a PHP REST proxy
  (`/wp-json/sportscars/v1/*`); the key is admin-editable at
  **Settings → Sports.Cars** (never in this repo).
- CMS: `vehicle` + `sc_article` post types, `make`/`sc_model`/`generation`/
  `vehicle_category` taxonomies, an ACF field group (specs + citations +
  confidence + last-verified), and a `Researcher` role — all in `inc/cms.php`.
- `wp` on the box needs `--skip-plugins=wp-password` (the staging gate
  intercepts CLI).

### Curated search filtering (only sports cars show)

MarketCheck's feed is every car; the marketplace must only surface enthusiast
models. The proxy (`inc/marketcheck.php`) enforces this in two ways:

- **Keyword → make/model resolution.** A model keyword like `911` becomes a
  precise `make=Porsche&model=911` query instead of MarketCheck's broad
  full-text match (which also hit "911 Assist" on unrelated trucks/SUVs).
- **Curated post-filter.** Broad searches (make-only, free browse, hp/generation)
  are filtered to make+model pairs that exist in the taxonomy, so SUVs/pickups
  (Cayenne, Macan, Avalanche, Outlander…) never appear.

MarketCheck query constraints (verified against the live API):

- `model=911` is exact and pushed to the backend (fast, uncapped). ✓
- **Comma-separated models are NOT OR'd** — `model=911,718 Cayman` returns the
  same count as `911` alone, so a make's curated models can't be listed in one
  query (would need one query per model).
- `body_type=Coupe,Convertible,Roadster,Targa` **does** filter server-side
  (Porsche 27,133 → 7,643) — the one clean backend lever to drop most
  SUVs/pickups/sedans at the source. **Recommended next step:** add this as a
  backend pre-filter on broad searches, keeping the taxonomy post-filter on top
  for the few body_type can't exclude (e.g. a Cayenne *Coupe*).

**Direction — the filter belongs on the WordPress backend.** Today the curated
allow-list is the static `assets/data/taxonomy.json`. The intended architecture
is for the **`vehicle` post type + `make`/`sc_model` taxonomies to be the source
of truth**: editors control which make+model pairs are "sports cars" from
wp-admin, and search constrains MarketCheck queries to exactly those pairs
(one query per curated model, merged) — giving exact counts, no capping, and no
hardcoded list. The static taxonomy becomes a seed/fallback.

### GitHub

The full WordPress build (theme, `build-theme.mjs`, SEO files, front-end fixes)
is committed to the **`wordpress`** branch of `github.com/loopdash/sports.cars`.
Next: open a PR and wire a theme-only GitHub Actions deploy to WP Engine
(`sportscars1`), matching the standard Loopdash flow. The theme also stays in
sync on the WPE box via `rsync` over SSH during active development.

## Quick start

**Option A — just open it.** Double-click `index.html` (or any page). The shared
header/footer inject from JavaScript, so it works directly from `file://` with
no server.

**Option B — run a local server** (nicer URLs, matches a real deployment):

```bash
python3 -m http.server 8080
# then visit http://localhost:8080/index.html
```

## Pages

| File | Page |
| --- | --- |
| `index.html` | Buy a Car (home / landing) |
| `search.html` | Search results (filters, sort, pagination) |
| `listing.html` | Listing detail (vehicle page) |
| `sell.html` | Sell a Car |
| `dealers.html` | Dealer overview / levels |
| `dealer-signup.html` | Become a Dealer (application form) |
| `dealer-basic.html` | Basic dealer profile (Prestige Performance Motors) |
| `dealer-premium.html` | Premium dealer profile (Apex Motor Group) |
| `dealer-premier.html` | Premier dealer profile (Rosso Performance) |
| `dashboard.html` | Dealer ROI dashboard — **design concept only** (Founding Partner beta) |
| `resources.html` | Resources hub |
| `article.html` | Editorial article template |
| `company.html` | Company |
| `about.html` | About |
| `contact.html` | Contact |
| `privacy.html` | Privacy Policy |
| `sitemap.html` | Sitemap |

> `dashboard.html` is a **visual concept** to support the Founding Partner
> conversation — it is not a functioning feature, and the underlying billing /
> token / accounts systems are out of the current Phase 2/3 scope.

The top navigation links all pages together, so you can click through the whole
site from the home page.

## Live MarketCheck inventory

The **Search** and **Listing** pages can run on live MarketCheck inventory.

The API key is a secret, so it is **never** placed in client-side code. Instead a
small dependency-free Node proxy (`server/marketcheck-proxy.js`) holds the key
server-side, serves the site same-origin (no CORS), normalizes MarketCheck
responses, and short-lived-caches them. The front end (`assets/js/marketcheck.js`)
calls `/api/search` and `/api/listing/:id`. This is the exact pattern that maps
to WordPress later (a PHP endpoint in place of the Node proxy).

### Run with live data

The key lives in the 1Password **`sports.cars`** vault and is injected at
runtime via `op run` — it never touches disk or git.

```bash
op signin            # once per session, if not already signed in
./run.sh             # starts http://localhost:8080 with live inventory
```

`run.sh` resolves `marketcheck.env.tmpl` (which contains only `op://` references,
no secrets) and launches the proxy. Without the key, the site still runs and the
pages fall back to sample cards.

**Endpoints:**
`GET /api/search?keyword=&make=&model=&generation=&year_min=&year_max=&body_type=&transmission=&drivetrain=&hp_min=&hp_max=&price_min=&price_max=&miles_min=&miles_max=&sort=&rows=&start=`
and `GET /api/listing/:id`. `sort` is one of `newest | oldest | price_asc |
price_desc | miles_asc | miles_desc`. With no make/model/keyword/generation,
search defaults to a curated set of performance marques.

### Taxonomy + spec merge

The curated Phase 1 taxonomy lives in **`assets/data/taxonomy.js`** — makes →
models → generations, each with a production-year range, horsepower range, and
body styles. It is the single source that (1) populates the search page's
make / model / generation dropdowns and (2) is merged into live inventory at
request time by the proxy, which adds the `generation` and `hp` that
MarketCheck's basic feed doesn't carry. `generation` and `hp_min`/`hp_max`
filters are resolved against this layer (generation → year window upstream, hp
as a post-filter on the merged results).

The file is written so it loads in the browser (`window.TAXONOMY`) **and** is
`require`-able by the Node proxy, so both sides share one source and it works
straight from `file://` with no fetch.

> When the proxy/API is unavailable, the search page falls back to a demo
> inventory **generated from this same taxonomy** and runs the identical
> filter / sort / paginate logic client-side — so every filter is demonstrable
> with or without a live key.

## Design language

Hybrid of "refined dark" and "light & airy" — the Apple product-page model:
airy light content sections punctuated by dark, cinematic full-bleed moments
(hero, closing CTA) where the car takes over the screen.

- **Palette:** white / `#f5f5f7` light surfaces, near-black `#0a0a0a` dark
  surfaces, `#1d1d1f` text, hairline `#d2d2d7`. One **restrained red**
  (`#e8071f`) reserved for primary CTAs and a few key links — no red icons,
  borders, or eyebrows.
- **Type:** system stack (`-apple-system` / SF Pro → Inter fallback). Large,
  tight, sentence-case headlines. Uppercase only for small eyebrow labels.
- **Components:** frosted sticky nav, borderless image-forward cards with hover
  lift, pill buttons, generous whitespace on an 8pt grid, subtle scroll-in
  motion.

Full rationale in [`docs/specs/2026-07-29-sportscars-redesign-design.md`](docs/specs/2026-07-29-sportscars-redesign-design.md).

## File structure

```
index.html, listing.html, sell.html, dealers.html,
dealer-basic.html, dealer-premium.html, dealer-premier.html,
resources.html, company.html      # pages
assets/
  css/styles.css                   # design tokens + all component styles
  js/main.js                       # shared header/footer + interactions
docs/specs/                        # design spec
```

### Shared components

The header and footer are single-sourced as strings in `assets/js/main.js` and
injected into `<div data-include="header">` / `<div data-include="footer">`
placeholders on each page. Edit them once in `main.js` and every page updates.

`main.js` also handles: active-nav highlighting, the mobile menu, scroll-in
reveal animation, the listing gallery (thumbnail → main image swap), profile
tabs, favorite (heart) toggles, and demo form submit states.

## WordPress mapping

The prototype is structured to convert directly:

- `data-include="header"` / `data-include="footer"` → `header.php` / `footer.php`
- Repeated UI (car cards, pricing tiers, feature rows) → template parts / ACF
  blocks
- `assets/css/styles.css` and `assets/js/main.js` → enqueued theme assets
- Each `*.html` page → a WordPress page template

## Notes / what's mocked

This is a **design prototype**, not a functioning application:

- **Images** are Unsplash placeholders (real sports cars, not actual inventory).
  Any image that fails to load falls back to a branded gradient rather than a
  broken image.
- **People photos** (team, leadership, testimonials) are placeholder avatars.
- **Search, filters, and forms** are visual only — no backend, no real data.
- Backend, MarketCheck integration, live search, accounts, dealer dashboards,
  and payments are **out of scope** for this design phase per the Phase 2/3
  agreement.

## Responsive

Tested across desktop, tablet, and mobile. The nav collapses to a hamburger
below 900px; grids reflow; the hero search stacks on small screens.
