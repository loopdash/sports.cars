<?php
/**
 * Template Name: Dealers
 * @package sportscars
 */
get_header();
?>
<!-- ============ HERO ============ -->
  <section class="c3-subhero c3-subhero--tall">
    <div class="c3-subhero__media"><img src="https://images.unsplash.com/photo-1600712242805-5f78671b24da?auto=format&fit=crop&w=2000&q=75" alt="Showroom of exotic cars" /></div>
    <div class="c3-subhero__scrim"></div>
    <div class="c3-subhero__inner">
      <div class="c3__container">
        <h1 class="c3-subhero__title">Grow your business with Sports.Cars.</h1>
        <p class="c3-subhero__sub">Partner with us as we build the world's premier marketplace for exotics and sports cars. Showcase your inventory to buyers who are looking for it.</p>
        <div class="c3-subhero__actions">
          <a href="<?php echo esc_url( home_url( '/dealer-signup/' ) ); ?>" class="btn btn--primary btn--lg">Apply to become a dealer</a>
          <a href="#" class="btn btn--ghost-light btn--lg">Contact sales</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ BENEFITS ============ -->
  <section class="c3-section">
    <div class="c3__container">
      <div class="c3-section-head reveal">
        <p class="c3-kicker c3-eyebrow">Dealer benefits</p>
        <h2 class="c3-h2">Everything you need to sell more.</h2>
      </div>
      <div class="c3-feature-grid c3-feature-grid--4 reveal">
        <div class="c3-feature">
          <div class="c3-feature__num">01</div>
          <div class="c3-feature__title">Premium exposure</div>
          <p class="c3-feature__text">Showcase your inventory to a global audience of passionate, qualified buyers.</p>
        </div>
        <div class="c3-feature">
          <div class="c3-feature__num">02</div>
          <div class="c3-feature__title">Quality leads</div>
          <p class="c3-feature__text">Connect with buyers who are actively searching for cars like yours.</p>
        </div>
        <div class="c3-feature">
          <div class="c3-feature__num">03</div>
          <div class="c3-feature__title">Inventory tools</div>
          <p class="c3-feature__text">Powerful tools to manage, promote, and analyze your inventory performance.</p>
        </div>
        <div class="c3-feature">
          <div class="c3-feature__num">04</div>
          <div class="c3-feature__title">Built for transparency</div>
          <p class="c3-feature__text">A professional environment built for transparency and performance.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ DEALER LEVELS ============ -->
  <section class="c3-section c3-section--alt" id="levels">
    <div class="c3__container">
      <div class="c3-section-head c3-section-head--center reveal">
        <p class="c3-kicker c3-eyebrow">Dealer levels</p>
        <h2 class="c3-h2">Pick the plan that fits your lot.</h2>
      </div>
      <div class="c3-tiers reveal">
        <div class="c3-tier">
          <div class="c3-tier__name">Basic</div>
          <div class="c3-tier__tagline">Great for new dealers getting started.</div>
          <div class="c3-tier__price">$99<span> /mo</span></div>
          <div class="c3-tier__note">Billed monthly</div>
          <ul class="c3-tier__list">
            <li>Up to 25 active listings</li><li>Standard dealer profile</li>
            <li>Basic analytics</li><li>Email support</li>
          </ul>
          <a href="<?php echo esc_url( home_url( '/dealer-basic/' ) ); ?>" class="btn btn--ghost btn--block btn--lg">Choose Basic</a>
        </div>
        <div class="c3-tier c3-tier--featured" data-badge="Most popular">
          <div class="c3-tier__name">Premium</div>
          <div class="c3-tier__tagline">More inventory. More tools. More results.</div>
          <div class="c3-tier__price">$299<span> /mo</span></div>
          <div class="c3-tier__note">Billed monthly</div>
          <ul class="c3-tier__list">
            <li>Up to 100 active listings</li><li>Featured dealer profile</li>
            <li>Advanced analytics</li><li>Lead management tools</li><li>Priority support</li>
          </ul>
          <a href="<?php echo esc_url( home_url( '/dealer-premium/' ) ); ?>" class="btn btn--primary btn--block btn--lg">Choose Premium</a>
        </div>
        <div class="c3-tier">
          <div class="c3-tier__name">Premier</div>
          <div class="c3-tier__tagline">Maximum exposure and dedicated support.</div>
          <div class="c3-tier__price">$599<span> /mo</span></div>
          <div class="c3-tier__note">Billed monthly</div>
          <ul class="c3-tier__list">
            <li>Unlimited active listings</li><li>Premium dealer profile</li>
            <li>Advanced analytics &amp; insights</li><li>Dedicated account manager</li><li>Priority support</li>
          </ul>
          <a href="<?php echo esc_url( home_url( '/dealer-premier/' ) ); ?>" class="btn btn--ghost btn--block btn--lg">Choose Premier</a>
        </div>
      </div>
    </div>
  </section>

<!-- ============ INTEGRATION ============ -->
  <section class="c3-section c3-section--alt">
    <div class="c3__container">
      <div class="c3-section-head reveal">
        <p class="c3-kicker c3-eyebrow">Inventory integration</p>
        <h2 class="c3-h2">Get your inventory live, fast.</h2>
      </div>
      <div class="c3-feature-grid c3-feature-grid--4 reveal">
        <div class="c3-feature"><div class="c3-feature__num">01</div><div class="c3-feature__title">API feed</div><p class="c3-feature__text">Seamless real-time integration with our API.</p></div>
        <div class="c3-feature"><div class="c3-feature__num">02</div><div class="c3-feature__title">CSV upload</div><p class="c3-feature__text">Quick and easy bulk uploads via CSV file.</p></div>
        <div class="c3-feature"><div class="c3-feature__num">03</div><div class="c3-feature__title">Website feed</div><p class="c3-feature__text">Auto-import inventory from your website.</p></div>
        <div class="c3-feature"><div class="c3-feature__num">04</div><div class="c3-feature__title">Dedicated support</div><p class="c3-feature__text">Our team helps you every step of the way.</p></div>
      </div>
    </div>
  </section>

  <!-- ============ CLOSING CTA ============ -->
  <section class="c3-cta">
    <div class="c3-cta__media"><img src="https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=2000&q=75" alt="" /></div>
    <div class="c3-cta__scrim"></div>
    <div class="c3__container">
      <div class="c3-cta__inner c3-cta__inner--close">
        <div>
          <h2 class="c3-h3">Start reaching serious buyers.</h2>
          <p class="c3-cta__text">Apply today and join dealers growing their business with Sports.Cars.</p>
        </div>
        <div class="close-cta__actions">
          <a href="<?php echo esc_url( home_url( '/dealer-signup/' ) ); ?>" class="btn btn--primary btn--lg">Apply to become a dealer</a>
          <a href="#" class="btn btn--ghost-light btn--lg">Contact sales</a>
        </div>
      </div>
    </div>
  </section>
<?php get_footer();
