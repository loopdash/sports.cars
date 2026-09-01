<?php
/**
 * Home
 * @package sportscars
 */
get_header();
?>
<!-- ============ HERO — carousel + search ============ -->
  <section class="c3-hero" data-c3-hero>
    <div class="c3-hero__slides">
      <div class="c3-hero__slide is-active"><img src="<?php echo SC_URI; ?>/assets/img/hero/porsche-hybrid-wheel-dusk.avif" alt="A hybrid sports car wheel and rear haunch lit by low sun at dusk" /></div>
      <div class="c3-hero__slide"><img src="<?php echo SC_URI; ?>/assets/img/hero/corvette-stingray-city.jpg" alt="A grey Corvette Stingray convertible panning past a city storefront" /></div>
      <div class="c3-hero__slide"><img src="<?php echo SC_URI; ?>/assets/img/hero/acura-nsx-red.avif" alt="A red Acura NSX cornering on a tree-lined road" /></div>
      <div class="c3-hero__slide"><img src="<?php echo SC_URI; ?>/assets/img/hero/porsche-911-targa-coast.avif" alt="A sage green Porsche 911 Targa 4S on a coastal cliff road" /></div>
      <div class="c3-hero__slide"><img src="<?php echo SC_URI; ?>/assets/img/hero/porsche-911-gts-mountain.jpg" alt="A grey Porsche 911 GTS on a mountain road at golden hour" /></div>
      <div class="c3-hero__slide"><img src="<?php echo SC_URI; ?>/assets/img/hero/corvette-zr1-summit.avif" alt="A yellow Corvette ZR1 on a mountain road above the clouds" /></div>
      <div class="c3-hero__slide"><img src="<?php echo SC_URI; ?>/assets/img/hero/mustang-gt-mountain.avif" alt="A blue Ford Mustang GT parked on a mountain road" /></div>
      <div class="c3-hero__slide"><img src="<?php echo SC_URI; ?>/assets/img/hero/mustang-pair-underpass.avif" alt="A green and an orange Ford Mustang running side by side under an overpass" /></div>
      <div class="c3-hero__scrim"></div>
      <div class="c3-hero__scrim c3-hero__scrim--side"></div>
    </div>

    <div class="c3-hero__inner">
      <div class="c3__container">
        <p class="c3-kicker c3-hero__eyebrow">Sports Cars • Exotics • Classics • Modern Performance</p>
        <h1 class="c3-hero__title">Find the sports car you can't stop thinking about.</h1>
        <p class="c3-hero__sub">A curated marketplace of exotics and performance machines — documented, and ready to drive.</p>

        <div class="c3-searchdock" data-c3-searchdock>
        <form class="c3-search" data-c3-filter action="<?php echo esc_url( home_url( '/search/' ) ); ?>">
          <div class="c3-field" data-c3-field="make">
            <span class="c3-label">Make</span>
            <button type="button" class="c3-field__button" data-c3-toggle>
              <span data-c3-value>Any make</span>
              <svg class="c3-field__caret" viewBox="0 0 10 6" width="9" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
            </button>
            <input type="hidden" name="make" value="" />
            <div class="c3-field__panel" role="listbox">
              <button type="button" class="c3-field__opt is-active" data-c3-opt="Any make"><span>Any make</span></button>
              <button type="button" class="c3-field__opt" data-c3-opt="Ferrari"><span>Ferrari</span></button>
              <button type="button" class="c3-field__opt" data-c3-opt="Porsche"><span>Porsche</span></button>
              <button type="button" class="c3-field__opt" data-c3-opt="Lamborghini"><span>Lamborghini</span></button>
              <button type="button" class="c3-field__opt" data-c3-opt="McLaren"><span>McLaren</span></button>
              <button type="button" class="c3-field__opt" data-c3-opt="Aston Martin"><span>Aston Martin</span></button>
            </div>
          </div>
          <div class="c3-field" data-c3-field="model">
            <span class="c3-label">Model</span>
            <button type="button" class="c3-field__button" data-c3-toggle>
              <span data-c3-value>Any model</span>
              <svg class="c3-field__caret" viewBox="0 0 10 6" width="9" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
            </button>
            <input type="hidden" name="model" value="" />
            <div class="c3-field__panel" role="listbox">
              <button type="button" class="c3-field__opt is-active" data-c3-opt="Any model"><span>Any model</span></button>
              <button type="button" class="c3-field__opt" data-c3-opt="488 Pista"><span>488 Pista</span></button>
              <button type="button" class="c3-field__opt" data-c3-opt="911 GT3"><span>911 GT3</span></button>
              <button type="button" class="c3-field__opt" data-c3-opt="720S"><span>720S</span></button>
            </div>
          </div>
          <div class="c3-field" data-c3-field="price">
            <span class="c3-label">Price</span>
            <button type="button" class="c3-field__button" data-c3-toggle>
              <span data-c3-value>Any price</span>
              <svg class="c3-field__caret" viewBox="0 0 10 6" width="9" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
            </button>
            <input type="hidden" name="price" value="" />
            <div class="c3-field__panel" role="listbox">
              <button type="button" class="c3-field__opt is-active" data-c3-opt="Any price"><span>Any price</span></button>
              <button type="button" class="c3-field__opt" data-c3-opt="Under $100k"><span>Under $100k</span></button>
              <button type="button" class="c3-field__opt" data-c3-opt="$100k–$250k"><span>$100k–$250k</span></button>
              <button type="button" class="c3-field__opt" data-c3-opt="$250k+"><span>$250k+</span></button>
            </div>
          </div>
          <div class="c3-field">
            <label class="c3-label" for="f-loc">Location</label>
            <input id="f-loc" class="c3-field__input" type="text" placeholder="Nationwide" />
          </div>
          <button type="submit" class="btn btn--primary btn--lg">Search cars</button>
        </form>
        </div>

        <div class="c3-hero__controls">
          <a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="c3-mono-link" style="border:0;padding:0">Advanced search →</a>
          <p class="c3-hero__note" data-c3-note></p>
          <div class="c3-hero__meta">
            <span class="c3-hero__counter"><span data-c3-current>001</span> / <span data-c3-total>009</span></span>
            <div class="c3-hero__dots">
              <button class="c3-hero__dot is-active" data-c3-dot aria-label="Show slide 1"></button>
              <button class="c3-hero__dot" data-c3-dot aria-label="Show slide 2"></button>
              <button class="c3-hero__dot" data-c3-dot aria-label="Show slide 3"></button>
              <button class="c3-hero__dot" data-c3-dot aria-label="Show slide 4"></button>
              <button class="c3-hero__dot" data-c3-dot aria-label="Show slide 5"></button>
              <button class="c3-hero__dot" data-c3-dot aria-label="Show slide 6"></button>
              <button class="c3-hero__dot" data-c3-dot aria-label="Show slide 7"></button>
              <button class="c3-hero__dot" data-c3-dot aria-label="Show slide 8"></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ EXPLORE — index list + sticky preview ============ -->
  <section class="c3-section c3-section--light" id="explore">
    <div class="c3__container c3__container--wide">
      <div class="c3-section__bar">
        <div>
          <p class="c3-kicker c3-eyebrow">Explore</p>
          <h2 class="c3-h2" style="max-width:20ch">Explore the world of sports cars</h2>
        </div>
        <a href="#" class="c3-mono-link">View all categories →</a>
      </div>

      <div class="c3-explore" data-c3-explore>
        <div>
          <div class="c3-explore__head"><span></span><span>IDX</span><span>CATEGORY</span><span>ACTION</span></div>
          <a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="c3-exprow is-active" data-c3-row="0">
            <span class="c3-exprow__bar"></span>
            <span class="c3-exprow__idx">001</span>
            <span class="c3-exprow__name">Exotics</span>
            <span class="c3-exprow__action">Shop now →</span>
          </a>
          <a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="c3-exprow" data-c3-row="1">
            <span class="c3-exprow__bar"></span>
            <span class="c3-exprow__idx">002</span>
            <span class="c3-exprow__name">Supercars</span>
            <span class="c3-exprow__action">Shop now →</span>
          </a>
          <a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="c3-exprow" data-c3-row="2">
            <span class="c3-exprow__bar"></span>
            <span class="c3-exprow__idx">003</span>
            <span class="c3-exprow__name">Track Cars</span>
            <span class="c3-exprow__action">Shop now →</span>
          </a>
          <a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="c3-exprow" data-c3-row="3">
            <span class="c3-exprow__bar"></span>
            <span class="c3-exprow__idx">004</span>
            <span class="c3-exprow__name">Classic Sports Cars</span>
            <span class="c3-exprow__action">Shop now →</span>
          </a>
          <a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="c3-exprow" data-c3-row="4">
            <span class="c3-exprow__bar"></span>
            <span class="c3-exprow__idx">005</span>
            <span class="c3-exprow__name">Modern Performance</span>
            <span class="c3-exprow__action">Shop now →</span>
          </a>
          <a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="c3-exprow" data-c3-row="5">
            <span class="c3-exprow__bar"></span>
            <span class="c3-exprow__idx">006</span>
            <span class="c3-exprow__name">Rare &amp; Collectible</span>
            <span class="c3-exprow__action">Shop now →</span>
          </a>
        </div>
        <div class="c3-preview">
          <div class="c3-frame c3-preview__frame"><span class="c3-frame__mark"></span>
            <img class="c3-preview__img is-active" data-c3-pane="0" src="https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=72" alt="Exotics" />
            <img class="c3-preview__img" data-c3-pane="1" src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=72" alt="Supercars" />
            <img class="c3-preview__img" data-c3-pane="2" src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=72" alt="Track Cars" />
            <img class="c3-preview__img" data-c3-pane="3" src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=72" alt="Classic Sports Cars" />
            <img class="c3-preview__img" data-c3-pane="4" src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=72" alt="Modern Performance" />
            <img class="c3-preview__img" data-c3-pane="5" src="https://images.unsplash.com/photo-1600712242805-5f78671b24da?auto=format&fit=crop&w=1200&q=72" alt="Rare &amp; Collectible" />
            <div class="c3-preview__scrim"></div>
          </div>
          <div class="c3-preview__readout">
            <span class="c3-preview__idx"><span data-c3-pidx>001</span> / 006</span>
            <span class="c3-preview__name" data-c3-pname>EXOTICS</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ INVENTORY ============ -->
  <section class="c3-section" id="inventory">
    <div class="c3__container c3__container--wide">
      <div class="c3-section__bar">
        <div>
          <p class="c3-kicker c3-eyebrow">Handpicked</p>
          <h2 class="c3-h2">Cars worth discovering</h2>
        </div>
        <a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="c3-mono-link">View all inventory →</a>
      </div>

      <div class="c3-cars">
        <a href="<?php echo esc_url( home_url( '/listing/' ) ); ?>" class="c3-car">
          <div class="c3-frame c3-car__frame"><span class="c3-frame__mark"></span>
            <img class="c3-car__img" src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1400&q=75" alt="2015 Ferrari LaFerrari" />
            <button type="button" class="c3-car__fav" aria-label="Save this car"><svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
          </div>
          <div class="c3-car__body">
            <span class="c3-car__name">2015 Ferrari LaFerrari</span>
            <span class="c3-car__meta">1,200 mi · Chicago, IL</span>
          </div>
          <div class="c3-car__footer">
            <span class="c3-label">Price</span>
            <span class="c3-car__price">$3,495,000</span>
          </div>
        </a>
        <a href="<?php echo esc_url( home_url( '/listing/' ) ); ?>" class="c3-car">
          <div class="c3-frame c3-car__frame"><span class="c3-frame__mark"></span>
            <img class="c3-car__img" src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1400&q=75" alt="2015 Ferrari 458 Speciale" />
            <button type="button" class="c3-car__fav" aria-label="Save this car"><svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
          </div>
          <div class="c3-car__body">
            <span class="c3-car__name">2015 Ferrari 458 Speciale</span>
            <span class="c3-car__meta">2,100 mi · Atlanta, GA</span>
          </div>
          <div class="c3-car__footer">
            <span class="c3-label">Price</span>
            <span class="c3-car__price">$429,995</span>
          </div>
        </a>
        <a href="<?php echo esc_url( home_url( '/listing/' ) ); ?>" class="c3-car">
          <div class="c3-frame c3-car__frame"><span class="c3-frame__mark"></span>
            <img class="c3-car__img" src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1400&q=75" alt="2019 BMW M4 Competition" />
            <button type="button" class="c3-car__fav" aria-label="Save this car"><svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
          </div>
          <div class="c3-car__body">
            <span class="c3-car__name">2019 BMW M4 Competition</span>
            <span class="c3-car__meta">3,100 mi · Dallas, TX</span>
          </div>
          <div class="c3-car__footer">
            <span class="c3-label">Price</span>
            <span class="c3-car__price">$68,995</span>
          </div>
        </a>
        <a href="<?php echo esc_url( home_url( '/listing/' ) ); ?>" class="c3-car">
          <div class="c3-frame c3-car__frame"><span class="c3-frame__mark"></span>
            <img class="c3-car__img" src="https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1400&q=75" alt="2019 Lamborghini Huracán" />
            <button type="button" class="c3-car__fav" aria-label="Save this car"><svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
          </div>
          <div class="c3-car__body">
            <span class="c3-car__name">2019 Lamborghini Huracán</span>
            <span class="c3-car__meta">1,950 mi · Miami, FL</span>
          </div>
          <div class="c3-car__footer">
            <span class="c3-label">Price</span>
            <span class="c3-car__price">$219,995</span>
          </div>
        </a>
      </div>

      <div style="margin-top:92px">
        <hr class="c3-rule" />
        <div class="c3-section__bar" style="margin:34px 0">
          <div>
            <p class="c3-label" style="margin-bottom:12px">Marques</p>
            <h3 class="c3-h3" style="font-size:27px">Find by brand</h3>
          </div>
          <a href="#" class="c3-mono-link">View all brands →</a>
        </div>
        <div class="c3-brands">
          <a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="c3-brand"><img src="<?php echo SC_URI; ?>/assets/img/brands/ferrari.png" alt="Ferrari" /><span class="c3-brand__count">View listings</span></a>
          <a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="c3-brand"><img src="<?php echo SC_URI; ?>/assets/img/brands/porsche.png" alt="Porsche" /><span class="c3-brand__count">View listings</span></a>
          <a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="c3-brand"><img src="<?php echo SC_URI; ?>/assets/img/brands/lamborghini.png" alt="Lamborghini" /><span class="c3-brand__count">View listings</span></a>
          <a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="c3-brand"><img src="<?php echo SC_URI; ?>/assets/img/brands/mclaren.png" alt="McLaren" /><span class="c3-brand__count">View listings</span></a>
          <a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="c3-brand"><img src="<?php echo SC_URI; ?>/assets/img/brands/aston-martin.png" alt="Aston Martin" /><span class="c3-brand__count">View listings</span></a>
          <a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="c3-brand"><img src="<?php echo SC_URI; ?>/assets/img/brands/bugatti.png" alt="Bugatti" /><span class="c3-brand__count">View listings</span></a>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ JOURNAL ============ -->
  <section class="c3-section c3-journal" id="journal">
    <div class="c3__container">
      <div class="c3-section__bar">
        <div>
          <p class="c3-kicker c3-eyebrow">The Journal</p>
          <h2 class="c3-h2" style="color:#fff">The Sports.cars Journal</h2>
        </div>
        <a href="<?php echo esc_url( home_url( '/resources/' ) ); ?>" class="c3-mono-link">All stories →</a>
      </div>
      <div class="c3-posts">
        <a href="<?php echo esc_url( home_url( '/article/' ) ); ?>" class="c3-post">
          <div class="c3-frame c3-post__frame"><span class="c3-frame__mark"></span>
            <img class="c3-post__img" src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=70" alt="" />
            <span class="c3-post__sweep"></span>
          </div>
          <p class="c3-post__kicker">Buyer's guide</p>
          <h3 class="c3-post__title">The honest guide to your first performance coupe</h3>
          <p class="c3-post__dek">Which cars reward a first-time owner, and which ones quietly punish one.</p>
        </a>
        <a href="<?php echo esc_url( home_url( '/article/' ) ); ?>" class="c3-post">
          <div class="c3-frame c3-post__frame"><span class="c3-frame__mark"></span>
            <img class="c3-post__img" src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1000&q=70" alt="" />
            <span class="c3-post__sweep"></span>
          </div>
          <p class="c3-post__kicker">Comparison</p>
          <h3 class="c3-post__title">488 Pista vs 720S: two answers, one question</h3>
          <p class="c3-post__dek">Two mid-engined benchmarks, driven back to back on the same roads.</p>
        </a>
        <a href="<?php echo esc_url( home_url( '/article/' ) ); ?>" class="c3-post">
          <div class="c3-frame c3-post__frame"><span class="c3-frame__mark"></span>
            <img class="c3-post__img" src="https://images.unsplash.com/photo-1600712242805-5f78671b24da?auto=format&fit=crop&w=1000&q=70" alt="" />
            <span class="c3-post__sweep"></span>
          </div>
          <p class="c3-post__kicker">Market insight</p>
          <h3 class="c3-post__title">Why documented cars are pulling away from the rest</h3>
          <p class="c3-post__dek">Paperwork is quietly becoming the most valuable option on the car.</p>
        </a>
      </div>
    </div>
  </section>

  <!-- ============ THE STANDARD — the one light band ============ -->
  <section class="c3-section c3-trust" id="trust">
    <div class="c3__container c3-trust__grid">
      <div class="c3-frame c3-frame--light c3-trust__frame"><span class="c3-frame__mark"></span>
        <img src="<?php echo SC_URI; ?>/assets/img/hero/monaco-bugatti.jpg" alt="A Bugatti on the Monaco waterfront" />
      </div>
      <div>
        <p class="c3-kicker c3-eyebrow">The standard</p>
        <h2 class="c3-trust__title">Built for people who love cars. Built on trust.</h2>
        <div class="c3-std">
          <span class="c3-std__num">001</span>
          <div>
            <h4 class="c3-std__title">Accuracy</h4>
            <p class="c3-std__text">Every listing is reviewed against the seller's own documentation before it goes live, and corrections are reviewed before publication.</p>
          </div>
        </div>
        <div class="c3-std">
          <span class="c3-std__num">002</span>
          <div>
            <h4 class="c3-std__title">Transparency</h4>
            <p class="c3-std__text">Paid placement, sponsorship and advertising are labelled wherever they appear. Photography is never altered in a way that misrepresents a car.</p>
          </div>
        </div>
        <div class="c3-std">
          <span class="c3-std__num">003</span>
          <div>
            <h4 class="c3-std__title">Community knowledge</h4>
            <p class="c3-std__text">Buying guides, comparisons and model histories written by people who own and drive these cars.</p>
          </div>
        </div>
        <div class="c3-trust__links">
          <a href="#">Trust &amp; Accuracy →</a>
          <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">Report an error →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ NEWSLETTER ============ -->
  <section class="c3-cta">
    <div class="c3-cta__media"><img src="<?php echo SC_URI; ?>/assets/img/hero/monaco-sunset.jpg" alt="" /></div>
    <div class="c3-cta__scrim"></div>
    <div class="c3__container">
      <div class="c3-cta__inner">
        <div>
          <h2 class="c3-h3">The best of Sports.cars in your inbox.</h2>
          <p class="c3-cta__text">Be first to see new listings and market moves.</p>
        </div>
        <form class="c3-signup" data-c3-signup>
          <input type="email" class="c3-signup__input" placeholder="Enter your email" aria-label="Email address" />
          <button type="submit" class="c3-signup__btn">Sign Up</button>
        </form>
      </div>
    </div>
  </section>

  <!-- ============ SELL / DEALERS ============ -->
  <section class="c3-split" id="sell">
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
  </section>
<?php get_footer();
