<?php
/**
 * Vehicle archive — the model database, ordered by search demand.
 * Also handles the make/model/generation/category taxonomy archives.
 *
 * @package sportscars
 */
get_header();

$is_tax = is_tax();
$heading = 'Sports car database';
$sub     = 'Documented models — specs, history, and where to buy one.';
if ( $is_tax ) {
	$term    = get_queried_object();
	$heading = $term->name;
	$sub     = 'Documented ' . $term->name . ' models.';
}

// Order the model list by stored search volume (desc), then title.
$q = new WP_Query( array(
	'post_type'      => 'vehicle',
	'posts_per_page' => 60,
	'meta_key'       => 'sc_search_volume',
	'orderby'        => array( 'meta_value_num' => 'DESC', 'title' => 'ASC' ),
	'tax_query'      => $is_tax ? array( array( 'taxonomy' => $term->taxonomy, 'field' => 'term_id', 'terms' => $term->term_id ) ) : array(),
) );
?>
  <section class="c3-subhero">
    <div class="c3-subhero__media"><img src="https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=2000&q=75" alt="" /></div>
    <div class="c3-subhero__scrim"></div>
    <div class="c3-subhero__inner">
      <div class="c3__container">
        <p class="c3-kicker c3-eyebrow" style="color:#fff">The garage</p>
        <h1 class="c3-subhero__title"><?php echo esc_html( $heading ); ?></h1>
        <p class="c3-subhero__sub"><?php echo esc_html( $sub ); ?></p>
      </div>
    </div>
  </section>

  <section class="c3-section">
    <div class="c3__container c3__container--wide">
      <?php if ( $q->have_posts() ) : ?>
        <div class="c3-cars c3-cars--3">
          <?php while ( $q->have_posts() ) : $q->the_post();
            $make = get_the_terms( get_the_ID(), 'make' );
            $cat  = get_the_terms( get_the_ID(), 'vehicle_category' );
            $years = function_exists( 'get_field' ) ? get_field( 'years' ) : '';
            $meta = array();
            if ( $cat && ! is_wp_error( $cat ) ) { $meta[] = $cat[0]->name; }
            if ( $years ) { $meta[] = $years; }
            ?>
            <a href="<?php the_permalink(); ?>" class="c3-car">
              <div class="c3-frame c3-car__frame"><span class="c3-frame__mark"></span>
                <?php if ( has_post_thumbnail() ) { the_post_thumbnail( 'large', array( 'class' => 'c3-car__img' ) ); }
                else { echo '<img class="c3-car__img" src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=72" alt="" />'; } ?>
              </div>
              <div class="c3-car__body">
                <span class="c3-car__name"><?php the_title(); ?></span>
                <span class="c3-car__meta"><?php echo esc_html( implode( ' · ', $meta ) ); ?></span>
              </div>
            </a>
          <?php endwhile; ?>
        </div>
      <?php else : ?>
        <p class="c3-std__text">No vehicles yet.</p>
      <?php endif; wp_reset_postdata(); ?>
    </div>
  </section>
<?php get_footer();
