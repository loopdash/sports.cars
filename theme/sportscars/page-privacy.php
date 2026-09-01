<?php
/**
 * Template Name: Privacy
 * @package sportscars
 */
get_header();
?>
  <section class="c3-subhero">
    <div class="c3-subhero__media"><img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=75" alt="" /></div>
    <div class="c3-subhero__scrim"></div>
    <div class="c3-subhero__inner">
      <div class="c3__container">
        <p class="c3-kicker c3-eyebrow" style="color:#fff">Legal</p>
        <h1 class="c3-subhero__title">Privacy Policy</h1>
        <p class="c3-subhero__sub">Last updated: July 29, 2026</p>
      </div>
    </div>
  </section>

  <section class="c3-section">
    <div class="c3__container" style="max-width:760px">
      <p class="c3-std__text" style="max-width:none;margin-bottom:40px">This Privacy Policy explains how Sports.Cars (&ldquo;we,&rdquo; &ldquo;us&rdquo;) collects, uses, and safeguards information when you use our marketplace and related services.</p>

      <?php
      $sections = array(
        array( 'Information we collect', 'We collect information you provide directly — such as your name, email, and messages — as well as information collected automatically as you browse, including pages viewed, searches, and device details.' ),
        array( 'How we use information', 'We use information to operate and improve the marketplace, connect buyers with sellers, personalize your experience, communicate with you, and keep the platform secure and trustworthy.' ),
        array( 'Sharing', 'We share information with dealers and sellers when you contact them, with service providers who support our operations, and where required by law. We do not sell your personal information.' ),
        array( 'Cookies', 'We use cookies and similar technologies to remember preferences, measure performance, and understand how the marketplace is used. You can control cookies through your browser settings.' ),
        array( 'Your choices', 'You may access, update, or request deletion of your information, and opt out of marketing communications at any time by contacting us.' ),
        array( 'Contact', 'Questions about this policy? Reach us at privacy@sports.cars or through our contact page.' ),
      );
      foreach ( $sections as $s ) : ?>
        <div class="c3-std">
          <span class="c3-std__num"></span>
          <div>
            <h2 class="c3-std__title"><?php echo esc_html( $s[0] ); ?></h2>
            <p class="c3-std__text" style="max-width:none"><?php echo esc_html( $s[1] ); ?></p>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </section>
<?php get_footer();
