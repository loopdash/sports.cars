<?php
/**
 * Sports.Cars theme — setup, asset enqueue, and the MarketCheck proxy.
 *
 * Design assets (the Concept #3 CSS/JS) live in /assets and are ported
 * verbatim from the static build so the WordPress site is pixel-identical.
 * The MarketCheck API key is read server-side (never exposed) from a WP
 * option or an environment variable — see sc_marketcheck_key().
 *
 * @package sportscars
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'SC_VER', '0.1.0' );
define( 'SC_URI', get_template_directory_uri() );

/* Cache-bust assets by file mtime so every deploy serves fresh CSS/JS
   (a fixed ?ver would let WP Engine / the browser keep stale files). */
function sc_asset_ver( $rel ) {
	$f = get_template_directory() . $rel;
	return file_exists( $f ) ? (string) filemtime( $f ) : SC_VER;
}

/* MarketCheck proxy (REST routes + key resolver) and its admin settings. */
require get_template_directory() . '/inc/marketcheck.php';
require get_template_directory() . '/inc/settings.php';
/* Content model: vehicle/article post types, taxonomies, ACF fields, roles. */
require get_template_directory() . '/inc/cms.php';

/* -------------------------------------------------------------------------
 * Theme setup
 * ---------------------------------------------------------------------- */
add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
	register_nav_menus( array( 'primary' => 'Primary Navigation' ) );
} );

/* Concept #3 markup keys off <body class="c3">. */
add_filter( 'body_class', function ( $classes ) {
	$classes[] = 'c3';
	return $classes;
} );

/* Load the Saira webfont without blocking render (system/local fonts show
   immediately, Saira swaps in) — a Lighthouse render-blocking win. */
add_filter( 'style_loader_tag', function ( $tag, $handle ) {
	if ( 'sc-saira' === $handle ) {
		$tag = str_replace(
			"rel='stylesheet'",
			"rel='preload' as='style' onload=\"this.onload=null;this.rel='stylesheet'\"",
			$tag
		);
		$tag .= "<noscript><link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Saira:wdth,wght@50..125,400..800&display=swap'></noscript>";
	}
	return $tag;
}, 10, 2 );

/* Legacy static URLs → WordPress permalinks. The prototype used *.html URLs
   (search.html, listing.html?id=…); redirect them 301 so old links, bookmarks,
   and stale-cached pages resolve instead of 404ing. Query string preserved. */
add_action( 'template_redirect', function () {
	$uri  = isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '';
	$path = strtok( $uri, '?' );
	if ( ! preg_match( '#^/([a-z0-9-]+)\.html$#', $path, $m ) ) { return; }
	$slug   = $m[1];
	$target = ( 'index' === $slug ) ? home_url( '/' ) : home_url( '/' . $slug . '/' );
	$qs     = wp_parse_url( $uri, PHP_URL_QUERY );
	if ( $qs ) { $target .= '?' . $qs; }
	wp_safe_redirect( $target, 301 );
	exit;
} );

/* Vehicle structured data on the listing page. Yoast covers WebPage/Article/
   Organization schema; it does not emit a Vehicle graph, so we output a base
   node here and marketcheck.js rewrites it (#vehicle-jsonld) from the live
   MarketCheck listing so the schema always matches the vehicle shown. */
add_action( 'wp_head', function () {
	if ( 'listing' !== sc_current_slug() ) { return; }
	$base = array(
		'@context' => 'https://schema.org',
		'@type'    => 'Vehicle',
		'name'     => 'Vehicle listing',
	);
	echo "\n" . '<script type="application/ld+json" id="vehicle-jsonld">' . wp_json_encode( $base ) . '</script>' . "\n";
} );

/* -------------------------------------------------------------------------
 * Assets. concept3 core loads everywhere; page-specific CSS/JS load only
 * where needed, mirroring the static build's per-page <link>/<script> set.
 * ---------------------------------------------------------------------- */
add_action( 'wp_enqueue_scripts', function () {
	$css = SC_URI . '/assets/css';
	$js  = SC_URI . '/assets/js';

	// Fonts (matches the static <head>).
	wp_enqueue_style( 'sc-saira', 'https://fonts.googleapis.com/css2?family=Saira:wdth,wght@50..125,400..800&display=swap', array(), null );

	// Core design system — every page.
	wp_enqueue_style( 'sc-concept3', "$css/concept3.css", array(), sc_asset_ver( '/assets/css/concept3.css' ) );
	wp_enqueue_script( 'sc-concept3', "$js/concept3.js", array(), sc_asset_ver( '/assets/js/concept3.js' ), true );

	// Expose the theme asset base + REST API base so the ported front-end JS
	// resolves assets absolutely and calls the WordPress proxy (not /api/*).
	wp_add_inline_script(
		'sc-concept3',
		'window.SC_ASSETS=' . wp_json_encode( SC_URI . '/assets' ) . ';' .
		'window.SC_API_BASE=' . wp_json_encode( esc_url_raw( rest_url( 'sportscars/v1' ) ) ) . ';' .
		'window.SC_SEARCH_URL=' . wp_json_encode( esc_url_raw( home_url( '/search/' ) ) ) . ';' .
		'window.SC_LISTING_URL=' . wp_json_encode( esc_url_raw( home_url( '/listing/' ) ) ) . ';' .
		'window.SC_GA4_ID=' . wp_json_encode( (string) get_option( 'sc_ga4_id', '' ) ) . ';',
		'before'
	);

	$slug = sc_current_slug();

	// Vehicle CPT (single + archive): spec-table + pages components.
	if ( is_singular( 'vehicle' ) || is_post_type_archive( 'vehicle' ) || is_tax( array( 'make', 'sc_model', 'generation', 'vehicle_category' ) ) ) {
		wp_enqueue_style( 'sc-listing', "$css/concept3-listing.css", array( 'sc-concept3' ), sc_asset_ver( '/assets/css/concept3-listing.css' ) );
		wp_enqueue_style( 'sc-pages', "$css/concept3-pages.css", array( 'sc-concept3' ), sc_asset_ver( '/assets/css/concept3-pages.css' ) );
		return;
	}

	if ( 'search' === $slug ) {
		wp_enqueue_style( 'sc-search', "$css/concept3-search.css", array( 'sc-concept3' ), sc_asset_ver( '/assets/css/concept3-search.css' ) );
		sc_enqueue_inventory( $js );
	} elseif ( 'listing' === $slug ) {
		wp_enqueue_style( 'sc-listing', "$css/concept3-listing.css", array( 'sc-concept3' ), sc_asset_ver( '/assets/css/concept3-listing.css' ) );
		sc_enqueue_inventory( $js );
	} elseif ( is_page_template( 'template-dealer.php' ) ) {
		// Dealer profile: pages stylesheet + live inventory (initDealerPage).
		wp_enqueue_style( 'sc-pages', "$css/concept3-pages.css", array( 'sc-concept3' ), sc_asset_ver( '/assets/css/concept3-pages.css' ) );
		sc_enqueue_inventory( $js );
	} else {
		// company / dealers / resources / sell / about / contact / privacy /
		// article share the "pages" stylesheet (subhero, feature/stat grids,
		// article layout).
		if ( in_array( $slug, array( 'company', 'dealers', 'resources', 'sell', 'about', 'contact', 'privacy', 'article' ), true ) ) {
			wp_enqueue_style( 'sc-pages', "$css/concept3-pages.css", array( 'sc-concept3' ), sc_asset_ver( '/assets/css/concept3-pages.css' ) );
		}
		if ( in_array( $slug, array( 'dealers', 'resources', 'sell' ), true ) ) {
			wp_enqueue_script( 'sc-main', "$js/main.js", array(), sc_asset_ver( '/assets/js/main.js' ), true );
		}
	}
} );

/* taxonomy → marketcheck (demo fallback needs the taxonomy first) + main.js. */
function sc_enqueue_inventory( $js ) {
	wp_enqueue_script( 'sc-taxonomy', SC_URI . '/assets/data/taxonomy.js', array(), sc_asset_ver( '/assets/data/taxonomy.js' ), true );
	wp_enqueue_script( 'sc-main', "$js/main.js", array(), sc_asset_ver( '/assets/js/main.js' ), true );
	wp_enqueue_script( 'sc-marketcheck', "$js/marketcheck.js", array( 'sc-taxonomy' ), sc_asset_ver( '/assets/js/marketcheck.js' ), true );
}

/* Resolve the current page slug (front page → "home"). */
function sc_current_slug() {
	if ( is_front_page() ) { return 'home'; }
	$obj = get_queried_object();
	if ( $obj instanceof WP_Post ) { return $obj->post_name; }
	return '';
}

