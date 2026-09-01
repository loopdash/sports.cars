<?php
/**
 * Fallback template.
 * @package sportscars
 */
get_header();
?>
<main class="c3-section"><div class="c3__container"><h1 class="c3-h2"><?php echo esc_html( get_the_title() ?: 'Sports.Cars' ); ?></h1></div></main>
<?php get_footer();
