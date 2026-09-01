<?php
/**
 * Header — <head>, opening <body>, and the Concept #3 sticky nav.
 * The nav mirrors the static build; active state is computed from the
 * current page slug and links resolve to WordPress permalinks.
 *
 * @package sportscars
 */
$sc_slug = function_exists( 'sc_current_slug' ) ? sc_current_slug() : '';
$sc_nav  = array(
	'search'    => array( 'Buy a Car', 'search' ),
	'sell'      => array( 'Sell a Car', 'sell' ),
	'dealers'   => array( 'Dealers', 'dealers' ),
	'resources' => array( 'Journal', 'resources' ),
	'company'   => array( 'Company', 'company' ),
);
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?> data-page="<?php echo esc_attr( $sc_slug ); ?>">
<?php wp_body_open(); ?>

	<header class="c3-nav">
		<div class="c3__container c3-nav__inner">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="c3-wordmark" aria-label="Sports.Cars home"><span>SPORTS</span><span class="c3-wordmark__dot">.</span><span>CARS</span></a>
			<nav class="c3-nav__links" aria-label="Primary">
				<?php foreach ( $sc_nav as $key => $item ) :
					$active = ( $key === $sc_slug ) ? ' is-active' : '';
					?>
					<a href="<?php echo esc_url( home_url( '/' . $item[1] . '/' ) ); ?>" class="c3-nav__link<?php echo $active; ?>"><?php echo esc_html( $item[0] ); ?></a>
				<?php endforeach; ?>
			</nav>
			<div class="c3-nav__actions">
				<a href="<?php echo esc_url( home_url( '/search/' ) ); ?>" class="btn btn--primary c3-nav__search"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/></svg><span>Search</span></a>
				<a href="#" class="c3-nav__signin">Sign in</a>
			</div>
		</div>
	</header>
