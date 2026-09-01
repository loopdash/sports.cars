<?php
/**
 * Template Name: Dealer Profile
 * @package sportscars
 *
 * Meta-driven dealer profile. Reads page meta:
 *   sc_dealer_id       — MarketCheck dealer id (drives live inventory)
 *   sc_dealer_tier     — basic | premium | premier
 *   sc_dealer_location — display location
 *   sc_dealer_blurb    — one-line tagline
 * marketcheck.js (initDealerPage) fills [data-dealer-inventory] with this
 * dealer's live listings and wires the count + view-all link.
 */
get_header();

$dealer_id = get_post_meta( get_the_ID(), 'sc_dealer_id', true );
$tier      = get_post_meta( get_the_ID(), 'sc_dealer_tier', true ) ?: 'basic';
$location  = get_post_meta( get_the_ID(), 'sc_dealer_location', true );
$blurb     = get_post_meta( get_the_ID(), 'sc_dealer_blurb', true );
$name      = get_the_title();

$tier_label = array( 'basic' => '', 'premium' => 'Premium dealer', 'premier' => 'Premier dealer' );
$stats = array(
	'premium' => array( array( '250+', 'Cars sold' ), array( '4.8★', 'Rating' ), array( 'Nationwide', 'Shipping' ) ),
	'premier' => array( array( '500+', 'Exotics sold' ), array( '15+', 'Years' ), array( '4.9★', '128 reviews' ), array( 'Global', 'Shipping' ) ),
);
?>
  <section class="c3-subhero <?php echo ( 'basic' !== $tier ) ? 'c3-subhero--tall' : ''; ?>">
    <div class="c3-subhero__media"><img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=2000&q=75" alt="<?php echo esc_attr( $name ); ?>" /></div>
    <div class="c3-subhero__scrim"></div>
    <div class="c3-subhero__inner">
      <div class="c3__container">
        <?php if ( ! empty( $tier_label[ $tier ] ) ) : ?>
          <p class="c3-kicker c3-eyebrow" style="color:#fff"><?php echo esc_html( $tier_label[ $tier ] ); ?></p>
        <?php endif; ?>
        <h1 class="c3-subhero__title"><?php echo esc_html( $name ); ?></h1>
        <?php if ( $blurb ) : ?><p class="c3-subhero__sub"><?php echo esc_html( $blurb ); ?></p><?php endif; ?>
        <div class="c3-subhero__actions">
          <a href="#inventory" class="btn btn--primary btn--lg">View inventory</a>
          <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="btn btn--ghost-light btn--lg">Contact dealer</a>
        </div>
      </div>
    </div>
  </section>

  <?php if ( isset( $stats[ $tier ] ) ) : ?>
  <section class="c3-section" style="padding-bottom:0">
    <div class="c3__container">
      <div class="c3-stats">
        <?php foreach ( $stats[ $tier ] as $s ) : ?>
          <div class="c3-stat"><div class="c3-stat__num"><?php echo esc_html( $s[0] ); ?></div><div class="c3-stat__label"><?php echo esc_html( $s[1] ); ?></div></div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
  <?php endif; ?>

  <section class="c3-section" id="inventory">
    <div class="c3__container c3__container--wide">
      <div class="c3-section__bar">
        <div>
          <p class="c3-kicker c3-eyebrow">Inventory</p>
          <h2 class="c3-h2" style="color:#fff">Available now<?php echo $location ? ' · ' . esc_html( $location ) : ''; ?></h2>
          <p class="c3-std__text" style="color:var(--c3-dim);margin-top:8px"><span data-dealer-count>—</span> vehicles from this dealer</p>
        </div>
        <a href="#" class="c3-mono-link" data-dealer-viewall>View all inventory →</a>
      </div>
      <div class="c3-cars c3-cars--3" data-dealer-inventory data-dealer-id="<?php echo esc_attr( $dealer_id ); ?>">
        <p class="c3-std__text" style="grid-column:1/-1;color:var(--c3-dim)">Loading live inventory from this dealer&hellip;</p>
      </div>
    </div>
  </section>

  <section class="c3-section c3-section--alt">
    <div class="c3__container c3__container--wide">
      <div class="c3-section__bar"><div><p class="c3-kicker c3-eyebrow">Why buy here</p><h2 class="c3-h2" style="color:#fff">What this dealer offers</h2></div></div>
      <div class="c3-feature-grid c3-feature-grid--4">
        <div class="c3-feature"><div class="c3-feature__num">01</div><div class="c3-feature__title">Live inventory</div><p class="c3-feature__text">Every listing normalized and refreshed from the dealer's live feed.</p></div>
        <div class="c3-feature"><div class="c3-feature__num">02</div><div class="c3-feature__title">Financing</div><p class="c3-feature__text">Financing and pre-qualification available on eligible vehicles.</p></div>
        <div class="c3-feature"><div class="c3-feature__num">03</div><div class="c3-feature__title">Shipping</div><p class="c3-feature__text"><?php echo 'premier' === $tier ? 'Worldwide enclosed shipping and concierge delivery.' : 'Nationwide shipping and trade-ins welcome.'; ?></p></div>
        <div class="c3-feature"><div class="c3-feature__num">04</div><div class="c3-feature__title">Documentation</div><p class="c3-feature__text">Service history and records provided on request.</p></div>
      </div>
    </div>
  </section>
<?php get_footer();
