# Vehicle catalog — reproducible seed + importer

The launch catalog (the ~50 highest-search sports-car models) is version
controlled here so the CMS can be rebuilt from the repo, not only from whatever
was hand-loaded into a database.

## Files
- **`seed-50.json`** — one record per model: make/model/generation/category,
  production years, Wikipedia source URL, monthly search volume, per-model
  specs, and a lead image URL.
- **`import.php`** — idempotent WP-CLI importer. Matches by title, updates in
  place, sideloads the featured image, and writes ACF fields (specs, a Tier-2
  Wikipedia citation, confidence, last-verified) + `sc_search_volume`.

## Run
```bash
# On the WP install (WP Engine's staging gate intercepts CLI, so skip it):
wp --skip-plugins=wp-password eval-file tools/vehicles/import.php
```
Requires ACF active and network access to the Wikimedia image URLs. Safe to
re-run — only changed fields are written; no duplicates.

## How the seed was built (provenance)
1. Distinct make/model list pulled from the taxonomy sheet.
2. Ranked by US monthly Google search volume via DataForSEO (top 50).
3. Specs + lead image pulled from each model's canonical Wikipedia article
   (validated; only sane values kept). Horsepower ranges come from the curated
   taxonomy. Every fact carries the Wikipedia citation; confidence starts at
   "Medium" pending human verification.

> Specs are a cited first draft. The editorial pass verifies each field and
> raises confidence — that's the intended CMS workflow, not a data dump.
