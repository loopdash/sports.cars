<?php
/**
 * Template Name: Contact
 * @package sportscars
 *
 * Contact methods render from real details. When a Gravity Form titled
 * "Contact" exists, its shortcode is embedded automatically; until then a
 * mailto CTA is shown (no fake/non-submitting form).
 */
get_header();

$gf_id = 0;
if ( class_exists( 'GFAPI' ) ) {
	foreach ( GFAPI::get_forms() as $f ) {
		if ( isset( $f['title'] ) && strcasecmp( $f['title'], 'Contact' ) === 0 ) { $gf_id = (int) $f['id']; break; }
	}
}
?>
  <section class="c3-subhero">
    <div class="c3-subhero__media"><img src="https://images.unsplash.com/photo-1600712242805-5f78671b24da?auto=format&fit=crop&w=2000&q=75" alt="" /></div>
    <div class="c3-subhero__scrim"></div>
    <div class="c3-subhero__inner">
      <div class="c3__container">
        <p class="c3-kicker c3-eyebrow" style="color:#fff">Contact</p>
        <h1 class="c3-subhero__title">How can we help?</h1>
        <p class="c3-subhero__sub">We usually respond within one business day. Choose the fastest route below.</p>
      </div>
    </div>
  </section>

  <section class="c3-section">
    <div class="c3__container c3__container--wide">
      <div class="c3-feature-grid c3-feature-grid--4">
        <div class="c3-feature"><div class="c3-feature__num">01</div><div class="c3-feature__title">General &amp; support</div><p class="c3-feature__text"><a href="mailto:hello@sports.cars">hello@sports.cars</a></p></div>
        <div class="c3-feature"><div class="c3-feature__num">02</div><div class="c3-feature__title">Sales &amp; dealers</div><p class="c3-feature__text">(800) 555-0142</p></div>
        <div class="c3-feature"><div class="c3-feature__num">03</div><div class="c3-feature__title">Press &amp; media</div><p class="c3-feature__text"><a href="mailto:press@sports.cars">press@sports.cars</a></p></div>
        <div class="c3-feature"><div class="c3-feature__num">04</div><div class="c3-feature__title">Sports.Cars HQ</div><p class="c3-feature__text">1 Performance Way, Cleveland, OH 44113</p></div>
      </div>

      <div style="margin-top:56px;max-width:640px">
        <?php if ( $gf_id ) : ?>
          <h2 class="c3-h3" style="margin-bottom:24px">Send us a message</h2>
          <?php echo do_shortcode( '[gravityform id="' . $gf_id . '" title="false" description="false" ajax="true"]' ); ?>
        <?php else : ?>
          <h2 class="c3-h3" style="margin-bottom:14px">Send us a message</h2>
          <p class="c3-std__text" style="max-width:none;margin-bottom:22px">Email the team and the right person will follow up.</p>
          <a href="mailto:hello@sports.cars" class="btn btn--primary btn--lg">Email hello@sports.cars</a>
        <?php endif; ?>
      </div>
    </div>
  </section>
<?php get_footer();
