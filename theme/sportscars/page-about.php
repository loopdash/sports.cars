<?php
/**
 * Template Name: About
 * @package sportscars
 */
get_header();
?>
  <section class="c3-subhero c3-subhero--tall">
    <div class="c3-subhero__media"><img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=75" alt="A performance car on the open road" /></div>
    <div class="c3-subhero__scrim"></div>
    <div class="c3-subhero__inner">
      <div class="c3__container">
        <h1 class="c3-subhero__title">About.</h1>
        <p class="c3-subhero__sub">More than a listings site — live dealer inventory paired with a verified, citation-backed reference database.</p>
      </div>
    </div>
  </section>

  <section class="c3-section c3-section--light">
    <div class="c3__container">
      <div class="c3-section__bar">
        <div>
          <p class="c3-kicker c3-eyebrow">Our mission</p>
          <h2 class="c3-h2" style="max-width:20ch">We're building the home for sports car culture.</h2>
        </div>
      </div>
      <p class="c3-std__text" style="max-width:60ch;font-size:16px">Unlike general automotive sites, we combine live inventory with structured, human-verified specifications, history, and editorial context — so every decision is grounded in truth, not guesswork.</p>
    </div>
  </section>

  <section class="c3-section">
    <div class="c3__container c3__container--wide">
      <div class="c3-section__bar">
        <div>
          <p class="c3-kicker c3-eyebrow">How it works</p>
          <h2 class="c3-h2">Discovery you can trust.</h2>
        </div>
      </div>
      <div class="c3-feature-grid c3-feature-grid--4">
        <div class="c3-feature"><div class="c3-feature__num">01</div><div class="c3-feature__title">Live inventory</div><p class="c3-feature__text">Real dealer listings, normalized and refreshed, powered by MarketCheck.</p></div>
        <div class="c3-feature"><div class="c3-feature__num">02</div><div class="c3-feature__title">Verified data</div><p class="c3-feature__text">Specs and history checked against Tier 1 and Tier 2 sources — never a single unverified claim.</p></div>
        <div class="c3-feature"><div class="c3-feature__num">03</div><div class="c3-feature__title">Editorial context</div><p class="c3-feature__text">Guides and long-form articles that connect every car to its story.</p></div>
        <div class="c3-feature"><div class="c3-feature__num">04</div><div class="c3-feature__title">Confidence scoring</div><p class="c3-feature__text">Each record carries a confidence score and a last-verified date, in the open.</p></div>
      </div>
    </div>
  </section>

  <section class="c3-split" id="get-started">
    <div class="c3__container c3-split__grid">
      <div class="c3-half">
        <h3 class="c3-h3 c3-half__title">Find your next great drive</h3>
        <p class="c3-half__text">Chasing horsepower, heritage, or the perfect weekend car — start here.</p>
        <a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="c3-half__cta">Browse inventory →</a>
      </div>
      <div class="c3-half">
        <h3 class="c3-h3 c3-half__title">Partner with us</h3>
        <p class="c3-half__text">Put your inventory in front of buyers who came here to shop.</p>
        <a href="<?php echo esc_url( home_url( '/dealers/' ) ); ?>" class="c3-half__cta">For dealers →</a>
      </div>
    </div>
  </section>
<?php get_footer();
