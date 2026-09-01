<?php
/**
 * Single vehicle — renders the database record (ACF fields + taxonomy +
 * citations + confidence + last-verified). No mock data: every value comes
 * from the vehicle post. Links to live MarketCheck inventory for the model.
 *
 * @package sportscars
 */
get_header();
if ( have_posts() ) : the_post();

$get   = function ( $k ) { return function_exists( 'get_field' ) ? get_field( $k ) : get_post_meta( get_the_ID(), $k, true ); };
$make  = get_the_terms( get_the_ID(), 'make' );
$model = get_the_terms( get_the_ID(), 'sc_model' );
$make  = ( $make && ! is_wp_error( $make ) ) ? $make[0]->name : '';
$model = ( $model && ! is_wp_error( $model ) ) ? $model[0]->name : '';

$specs = array(
	'Engine'        => $get( 'engine_type' ),
	'Horsepower'    => $get( 'horsepower' ),
	'Torque'        => $get( 'torque' ),
	'0–60 mph'      => $get( 'zero_to_sixty' ),
	'Top speed'     => $get( 'top_speed' ),
	'Transmission'  => $get( 'transmission' ),
	'Drivetrain'    => $get( 'drivetrain' ),
	'Body style'    => $get( 'body_style' ),
	'Years'         => $get( 'years' ),
	'Chassis code'  => $get( 'chassis_code' ),
	'Wheelbase'     => $get( 'wheelbase' ),
	'Length'        => $get( 'length' ),
	'Width'         => $get( 'width' ),
	'Height'        => $get( 'height' ),
	'Curb weight'   => $get( 'curb_weight' ),
	'Seating'       => $get( 'seating_capacity' ),
	'Fuel'          => $get( 'fuel_type' ),
);
$prod      = $get( 'production_count' );
$citations = $get( 'citations' );
$confidence = $get( 'confidence' );
$verified  = $get( 'last_verified' );
$source    = $get( 'source_url' );
?>
  <section class="c3-subhero">
    <div class="c3-subhero__media"><?php if ( has_post_thumbnail() ) { the_post_thumbnail( 'full' ); } else { echo '<img src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=2000&q=75" alt="" />'; } ?></div>
    <div class="c3-subhero__scrim"></div>
    <div class="c3-subhero__inner">
      <div class="c3__container">
        <p class="c3-kicker c3-eyebrow" style="color:#fff"><?php echo esc_html( trim( "$make $model" ) ?: 'Vehicle' ); ?></p>
        <h1 class="c3-subhero__title"><?php the_title(); ?></h1>
        <?php if ( has_excerpt() ) : ?><p class="c3-subhero__sub"><?php echo esc_html( get_the_excerpt() ); ?></p><?php endif; ?>
      </div>
    </div>
  </section>

  <section class="c3-section">
    <div class="c3__container">
      <div class="c3-article__layout">
        <div>
          <?php if ( get_the_content() ) : ?>
            <div class="prose" style="margin-bottom:36px"><?php the_content(); ?></div>
          <?php endif; ?>

          <div class="info-card__title" style="margin-bottom:8px">Specifications</div>
          <div class="spec-table">
            <?php foreach ( $specs as $label => $val ) : if ( ! $val ) { continue; } ?>
              <div class="spec-table__row"><span><?php echo esc_html( $label ); ?></span><span><?php echo esc_html( $val ); ?></span></div>
            <?php endforeach; ?>
            <?php if ( $prod ) : ?>
              <div class="spec-table__row"><span>Production count</span><span><?php echo esc_html( number_format( (int) $prod ) ); ?></span></div>
            <?php endif; ?>
          </div>

          <?php if ( $citations ) : ?>
            <div class="c3-citations">
              <h3>Citations</h3>
              <ol>
                <?php foreach ( $citations as $c ) : ?>
                  <li>
                    <?php if ( ! empty( $c['url'] ) ) : ?>
                      <a href="<?php echo esc_url( $c['url'] ); ?>" target="_blank" rel="noopener" style="color:var(--c3-lift)"><?php echo esc_html( $c['note'] ?: $c['url'] ); ?></a>
                    <?php else : ?>
                      <?php echo esc_html( $c['note'] ); ?>
                    <?php endif; ?>
                    <?php if ( ! empty( $c['tier'] ) ) : ?><span class="c3-verified"><?php echo esc_html( $c['tier'] ); ?> verified</span><?php endif; ?>
                  </li>
                <?php endforeach; ?>
              </ol>
            </div>
          <?php endif; ?>
        </div>

        <aside class="c3-article__side">
          <div class="c3-factbox">
            <h3>Record</h3>
            <?php if ( $confidence ) : ?><div class="c3-factbox__row"><span>Confidence</span><span><?php echo esc_html( $confidence ); ?></span></div><?php endif; ?>
            <?php if ( $verified ) : ?><div class="c3-factbox__row"><span>Last verified</span><span><?php echo esc_html( $verified ); ?></span></div><?php endif; ?>
            <?php if ( $prod ) : ?><div class="c3-factbox__row"><span>Built</span><span><?php echo esc_html( number_format( (int) $prod ) ); ?></span></div><?php endif; ?>
            <?php if ( $source ) : ?><div class="c3-factbox__row"><span>Source</span><span><a href="<?php echo esc_url( $source ); ?>" target="_blank" rel="noopener" style="color:var(--c3-lift)">Reference</a></span></div><?php endif; ?>
          </div>
          <div class="c3-factbox">
            <h3>Find one for sale</h3>
            <p class="c3-std__text" style="max-width:none;margin-bottom:16px">Search live inventory for this model.</p>
            <a class="btn btn--primary btn--block" href="<?php echo esc_url( add_query_arg( array_filter( array( 'make' => $make, 'keyword' => $model ) ), home_url( '/search/' ) ) ); ?>">Browse listings</a>
          </div>
        </aside>
      </div>
    </div>
  </section>
<?php endif; get_footer();
