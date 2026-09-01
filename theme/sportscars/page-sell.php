<?php
/**
 * Template Name: Sell
 * @package sportscars
 */
get_header();
?>
<!-- ============ HERO ============ -->
  <section class="c3-subhero c3-subhero--tall">
    <div class="c3-subhero__media"><img src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=2000&q=75" alt="Silver sports car" /></div>
    <div class="c3-subhero__scrim"></div>
    <div class="c3-subhero__inner">
      <div class="c3__container">
        <h1 class="c3-subhero__title">Sell your car.</h1>
        <p class="c3-subhero__sub">Reach serious buyers worldwide and get the offer your car deserves — simple, transparent, rewarding.</p>
        <div class="c3-subhero__actions">
          <a href="#options" class="btn btn--primary btn--lg">List your car</a>
          <a href="#how" class="btn btn--ghost-light btn--lg">See how it works</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ PROCESS ============ -->
  <section class="c3-section" id="how">
    <div class="c3__container">
      <div class="c3-section-head reveal">
        <p class="c3-kicker c3-eyebrow">The process</p>
        <h2 class="c3-h2">Selling made effortless.</h2>
      </div>
      <div class="c3-steps reveal">
        <div class="c3-step"><div class="c3-step__num">Step 01</div><div class="c3-step__title">Tell us about your car</div><p class="c3-step__text">Share your car's details, photos, and history in a few minutes.</p></div>
        <div class="c3-step"><div class="c3-step__num">Step 02</div><div class="c3-step__title">We market it worldwide</div><p class="c3-step__text">Your listing is showcased to serious, qualified buyers globally.</p></div>
        <div class="c3-step"><div class="c3-step__num">Step 03</div><div class="c3-step__title">Get serious offers</div><p class="c3-step__text">Receive offers from interested buyers.</p></div>
        <div class="c3-step"><div class="c3-step__num">Step 04</div><div class="c3-step__title">Close with confidence</div><p class="c3-step__text">We guide you through a safe, secure, and smooth sale.</p></div>
      </div>
    </div>
  </section>

  <!-- ============ WHY SELL (split) ============ -->
  <section class="c3-section c3-section--alt">
    <div class="c3__container">
      <div class="c3-split2">
        <div class="reveal">
          <p class="c3-kicker c3-eyebrow">Why Sports.Cars</p>
          <h2 class="c3-h2">Your passion, on the world's stage.</h2>
          <div class="prose">
            <p>Your car is shown to enthusiasts and dealers, with secure transactions from start to finish.</p>
            <p>Our data-driven marketing and expert positioning help you reach the right buyer — and the best price — while specialists guide every step from listing to close.</p>
          </div>
          <div style="margin-top:28px"><a href="#options" class="btn btn--primary btn--lg">Choose a plan</a></div>
        </div>
        <div class="c3-split2__media reveal">
          <img src="https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1100&q=75" alt="Red sports car" />
          <span class="c3-split2__caption">Your passion. Our platform.</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ LISTING OPTIONS ============ -->
  <section class="c3-section" id="options">
    <div class="c3__container">
      <div class="c3-section-head c3-section-head--center reveal">
        <p class="c3-kicker c3-eyebrow">Listing options</p>
        <h2 class="c3-h2">Choose the package that's right for you.</h2>
      </div>
      <div class="c3-tiers reveal">
        <div class="c3-tier">
          <div class="c3-tier__name">Standard</div>
          <div class="c3-tier__tagline">Great visibility. Solid results.</div>
          <div class="c3-tier__price">$129</div>
          <div class="c3-tier__note">One-time listing fee</div>
          <ul class="c3-tier__list">
            <li>30-day listing duration</li><li>Up to 25 photos</li>
            <li>Basic listing features</li><li>Email support</li>
          </ul>
          <a href="#" class="btn btn--ghost btn--block btn--lg">Choose Standard</a>
        </div>
        <div class="c3-tier c3-tier--featured" data-badge="Most popular">
          <div class="c3-tier__name">Premium</div>
          <div class="c3-tier__tagline">Maximum exposure. More offers.</div>
          <div class="c3-tier__price">$249</div>
          <div class="c3-tier__note">One-time listing fee</div>
          <ul class="c3-tier__list">
            <li>60-day listing duration</li><li>Up to 50 photos</li>
            <li>Featured placement</li><li>Marketing to our network</li><li>Priority support</li>
          </ul>
          <a href="#" class="btn btn--primary btn--block btn--lg">Choose Premium</a>
        </div>
        <div class="c3-tier">
          <div class="c3-tier__name">Concierge</div>
          <div class="c3-tier__tagline">Hands-off selling. Maximum results.</div>
          <div class="c3-tier__price">$499<span> + 2.5%</span></div>
          <div class="c3-tier__note">Success fee on final sale price</div>
          <ul class="c3-tier__list">
            <li>Concierge listing service</li><li>Professional photoshoot</li>
            <li>Market analysis &amp; pricing</li><li>Negotiation assistance</li><li>Transaction management</li>
          </ul>
          <a href="#" class="btn btn--ghost btn--block btn--lg">Choose Concierge</a>
        </div>
      </div>
      <p class="c3-tier__disclaimer">Success fee is calculated on the final sale price. No upfront surprises.</p>
    </div>
  </section>

  <!-- ============ SUCCESS STORIES ============ -->
  <section class="c3-section c3-section--alt">
    <div class="c3__container c3__container--wide">
      <div class="c3-section__bar reveal">
        <div><p class="c3-kicker c3-eyebrow">Proven results</p><h2 class="c3-h2">Recent success stories</h2></div>
        <a href="#" class="c3-link-arrow">View all sold cars →</a>
      </div>
      <div class="c3-cars c3-cars--3 reveal">
        <a href="<?php echo esc_url( home_url( '/listing/' ) ); ?>" class="c3-car">
          <div class="c3-frame c3-car__frame"><span class="c3-frame__mark"></span>
            <span class="c3-car__tag">Sold</span>
            <img class="c3-car__img" src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1400&q=75" alt="2019 BMW M4 Competition" />
            <div class="c3-car__scrim"></div>
            <div class="c3-car__overlay">
              <span class="c3-car__name">2019 BMW M4 Competition</span>
              <span class="c3-car__meta">Los Angeles, CA</span>
            </div>
          </div>
          <div class="c3-car__footer">
            <span class="c3-label">Sold for</span>
            <span class="c3-car__price">$68,995</span>
          </div>
        </a>
        <a href="<?php echo esc_url( home_url( '/listing/' ) ); ?>" class="c3-car">
          <div class="c3-frame c3-car__frame"><span class="c3-frame__mark"></span>
            <span class="c3-car__tag">Sold</span>
            <img class="c3-car__img" src="<?php echo SC_URI; ?>/assets/img/listing/ferrari-488-1.jpg" alt="2022 Ferrari 488 Pista" />
            <div class="c3-car__scrim"></div>
            <div class="c3-car__overlay">
              <span class="c3-car__name">2022 Ferrari 488 Pista</span>
              <span class="c3-car__meta">Miami, FL</span>
            </div>
          </div>
          <div class="c3-car__footer">
            <span class="c3-label">Sold for</span>
            <span class="c3-car__price">$449,000</span>
          </div>
        </a>
        <a href="<?php echo esc_url( home_url( '/listing/' ) ); ?>" class="c3-car">
          <div class="c3-frame c3-car__frame"><span class="c3-frame__mark"></span>
            <span class="c3-car__tag">Sold</span>
            <img class="c3-car__img" src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1400&q=75" alt="2015 Ferrari 458 Speciale" />
            <div class="c3-car__scrim"></div>
            <div class="c3-car__overlay">
              <span class="c3-car__name">2015 Ferrari 458 Speciale</span>
              <span class="c3-car__meta">Atlanta, GA</span>
            </div>
          </div>
          <div class="c3-car__footer">
            <span class="c3-label">Sold for</span>
            <span class="c3-car__price">$412,000</span>
          </div>
        </a>
      </div>
    </div>
  </section>

  <!-- ============ CLOSING CTA ============ -->
  <section class="c3-cta">
    <div class="c3-cta__media"><img src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=2000&q=75" alt="" /></div>
    <div class="c3-cta__scrim"></div>
    <div class="c3__container">
      <div class="c3-cta__inner c3-cta__inner--close">
        <div>
          <h2 class="c3-h3">Ready to sell your car?</h2>
          <p class="c3-cta__text">Join enthusiasts who've sold with confidence on Sports.Cars.</p>
        </div>
        <div class="close-cta__actions">
          <a href="#options" class="btn btn--primary btn--lg">List your car</a>
          <a href="#how" class="btn btn--ghost-light btn--lg">Learn more</a>
        </div>
      </div>
    </div>
  </section>
<?php get_footer();
