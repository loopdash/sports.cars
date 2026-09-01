<?php
/**
 * Template Name: Search
 * @package sportscars
 */
get_header();
?>
<!-- ============ BREADCRUMB ============ -->
  <div class="breadcrumb">
    <div class="c3__container breadcrumb__inner">
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="c3-mono-link">← Back to home</a>
    </div>
  </div>

  <section class="c3-section search-section">
    <div class="c3__container c3__container--wide">
      <div class="search-head">
        <p class="c3-kicker c3-eyebrow">Buy a car</p>
        <h1 class="c3-h2">Sports cars for sale</h1>
      </div>

      <div class="search-layout">
        <!-- FILTERS (make/model/generation options are populated from the
             curated taxonomy in assets/data/taxonomy.js on load) -->
        <aside class="filters" id="filters">
          <div class="filters__group">
            <div class="filters__label">Keyword</div>
            <input type="text" id="f-keyword" placeholder="e.g. Pista, GT3…" />
          </div>
          <div class="filters__group">
            <div class="filters__label">Make</div>
            <select id="f-make"><option value="">Any make</option></select>
          </div>
          <div class="filters__group">
            <div class="filters__label">Model</div>
            <select id="f-model" disabled><option value="">Any model</option></select>
          </div>
          <div class="filters__group">
            <div class="filters__label">Generation</div>
            <select id="f-generation" disabled><option value="">Any generation</option></select>
          </div>
          <div class="filters__group">
            <div class="filters__label">Production year</div>
            <div class="range-row"><input type="text" inputmode="numeric" id="f-year-min" placeholder="From"><input type="text" inputmode="numeric" id="f-year-max" placeholder="To"></div>
          </div>
          <div class="filters__group">
            <div class="filters__label">Body style</div>
            <label class="filter-check"><input type="checkbox" class="f-facet" data-facet="body_type" value="Coupe"> Coupe</label>
            <label class="filter-check"><input type="checkbox" class="f-facet" data-facet="body_type" value="Convertible"> Convertible</label>
            <label class="filter-check"><input type="checkbox" class="f-facet" data-facet="body_type" value="Targa"> Targa</label>
            <label class="filter-check"><input type="checkbox" class="f-facet" data-facet="body_type" value="Roadster"> Roadster</label>
          </div>
          <div class="filters__group">
            <div class="filters__label">Transmission</div>
            <label class="filter-check"><input type="checkbox" class="f-facet" data-facet="transmission" value="Automatic"> Automatic / DCT</label>
            <label class="filter-check"><input type="checkbox" class="f-facet" data-facet="transmission" value="Manual"> Manual</label>
          </div>
          <div class="filters__group">
            <div class="filters__label">Drivetrain</div>
            <label class="filter-check"><input type="checkbox" class="f-facet" data-facet="drivetrain" value="RWD"> RWD</label>
            <label class="filter-check"><input type="checkbox" class="f-facet" data-facet="drivetrain" value="4WD"> AWD / 4WD</label>
          </div>
          <div class="filters__group">
            <div class="filters__label">Horsepower</div>
            <div class="range-row"><input type="text" inputmode="numeric" id="f-hp-min" placeholder="Min hp"><input type="text" inputmode="numeric" id="f-hp-max" placeholder="Max hp"></div>
          </div>
          <div class="filters__group">
            <div class="filters__label">Price range</div>
            <div class="range-row"><input type="text" inputmode="numeric" id="f-price-min" placeholder="Min"><input type="text" inputmode="numeric" id="f-price-max" placeholder="Max"></div>
          </div>
          <div class="filters__group">
            <div class="filters__label">Mileage range</div>
            <div class="range-row"><input type="text" inputmode="numeric" id="f-miles-min" placeholder="Min mi"><input type="text" inputmode="numeric" id="f-miles-max" placeholder="Max mi"></div>
          </div>
          <div class="filters__group filters__group--last">
            <button class="filters__clear">Clear all filters</button>
          </div>
        </aside>

        <!-- RESULTS -->
        <div>
          <div class="results-toolbar">
            <button class="btn btn--ghost filter-toggle" id="filterToggle">Filters</button>
            <div class="results-count" id="resultsCount"><b>1,284</b> vehicles found</div>
            <div class="sort-select">Sort by
              <select id="f-sort"><option value="newest">Newest listings</option><option value="oldest">Oldest listings</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="miles_asc">Mileage: low to high</option><option value="miles_desc">Mileage: high to low</option></select>
            </div>
          </div>

          <div class="chips" id="activeChips"></div>

          <div class="results-grid" id="resultsGrid">
            <a href="<?php echo esc_url( home_url( '/listing/' ) ); ?>" class="car-card">
              <div class="car-card__media c3-frame"><span class="c3-frame__mark"></span>
                <img src="<?php echo SC_URI; ?>/assets/img/listing/ferrari-488-1.jpg" alt="2022 Ferrari 488 Pista" />
                <button class="car-card__fav" aria-label="Save this car"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
              </div>
              <div class="car-card__body">
                <span class="car-card__name">2022 Ferrari 488 Pista</span>
                <span class="car-card__meta"><span>1,950 mi</span><span>Miami, FL</span></span>
              </div>
              <div class="car-card__footer">
                <span class="car-card__plabel">Price</span>
                <span class="car-card__price">$449,995</span>
              </div>
            </a>
          </div>

          <div class="pagination" id="pagination"></div>
        </div>
      </div>
    </div>
  </section>

  <div class="c3-split" id="sell">
    <div class="c3__container c3-split__grid">
      <div class="c3-half">
        <h3 class="c3-h3 c3-half__title">Sell your car</h3>
        <p class="c3-half__text">List with the people who already know what your car is worth.</p>
        <a href="<?php echo esc_url( home_url( '/sell/' ) ); ?>" class="c3-half__cta">Start a listing →</a>
      </div>
      <div class="c3-half">
        <h3 class="c3-h3 c3-half__title">For dealers</h3>
        <p class="c3-half__text">Put your inventory in front of buyers who came here to shop.</p>
        <a href="<?php echo esc_url( home_url( '/dealer-signup/' ) ); ?>" class="c3-half__cta">Dealer enquiries →</a>
      </div>
    </div>
  </div>
<?php get_footer();
