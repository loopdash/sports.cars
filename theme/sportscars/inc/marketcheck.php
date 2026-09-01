<?php
/**
 * MarketCheck proxy — WordPress REST port of server/marketcheck-proxy.js.
 *
 * Exposes the same contract the front-end (assets/js/marketcheck.js) expects,
 * under /wp-json/sportscars/v1: search, listing/<id>, dealer, health.
 * The API key stays server-side (wp-config constant / env / option) and is
 * never sent to the browser. Live inventory is enriched with the generation +
 * horsepower from the shared taxonomy (assets/data/taxonomy.json).
 *
 * @package sportscars
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'SC_MC_BASE', defined( 'MARKETCHECK_BASE' ) ? MARKETCHECK_BASE : 'https://mc-api.marketcheck.com/v2' );
define( 'SC_MC_DEFAULT_MAKES', 'Ferrari,Porsche,Lamborghini,McLaren,Aston Martin,Maserati,Lotus' );
define( 'SC_MC_TTL', 60 );        // transient cache seconds
define( 'SC_MC_POOL_CAP', 200 );  // max rows pulled when hp/generation filtering

/* ---------- key resolver ----------
 * The admin option wins so the key is changeable from wp-admin without a
 * deploy (Settings → Sports.Cars). A constant or env var acts as a fallback
 * default / locked-down override for environments that prefer that.
 */
function sc_marketcheck_key() {
	$opt = trim( (string) get_option( 'sc_marketcheck_api_key', '' ) );
	if ( '' !== $opt ) { return $opt; }
	if ( defined( 'MARKETCHECK_API_KEY' ) && MARKETCHECK_API_KEY ) { return MARKETCHECK_API_KEY; }
	$env = getenv( 'MARKETCHECK_API_KEY' );
	return $env ? $env : '';
}

/* ---------- taxonomy (shared JSON, flattened + cached in-process) ---------- */
function sc_tax() {
	static $cache = null;
	if ( null !== $cache ) { return $cache; }
	$path = get_template_directory() . '/assets/data/taxonomy.json';
	$data = file_exists( $path ) ? json_decode( file_get_contents( $path ), true ) : array();
	$cur  = isset( $data['currentYear'] ) ? (int) $data['currentYear'] : (int) gmdate( 'Y' );
	$rows = array();
	foreach ( ( $data['makes'] ?? array() ) as $mk ) {
		foreach ( ( $mk['models'] ?? array() ) as $md ) {
			foreach ( ( $md['generations'] ?? array() ) as $g ) {
				$rows[] = array(
					'make'  => $mk['make'],
					'model' => $md['model'],
					'gen'   => $g['gen'],
					'yStart'=> (int) $g['years'][0],
					'yEnd'  => ( null === $g['years'][1] ) ? $cur : (int) $g['years'][1],
					'hpMin' => (int) $g['hp'][0],
					'hpMax' => (int) $g['hp'][1],
				);
			}
		}
	}
	$cache = array( 'rows' => $rows, 'currentYear' => $cur );
	return $cache;
}

/* Year-gated generation match — mirrors the fixed JS logic. Only tags a
   generation when the year lands inside its window; never guesses. */
function sc_match_generation( $rows, $make, $model, $year ) {
	if ( ! $make || ! $model ) { return null; }
	$mk = strtolower( $make );
	$md = strtolower( $model );
	$cands = array();
	foreach ( $rows as $r ) {
		$rmk = strtolower( $r['make'] );
		$rmd = strtolower( $r['model'] );
		$make_ok  = ( $rmk === $mk || strpos( $mk, $rmk ) === 0 || strpos( $rmk, $mk ) === 0 );
		$model_ok = ( $md === $rmd || strpos( $md, $rmd ) === 0 || strpos( $rmd, $md ) === 0 );
		if ( $make_ok && $model_ok ) { $cands[] = $r; }
	}
	if ( ! $cands ) { return null; }
	$y = (int) $year;
	if ( ! $y ) { return null; }
	$in = array();
	foreach ( $cands as $r ) { if ( $y >= $r['yStart'] && $y <= $r['yEnd'] ) { $in[] = $r; } }
	if ( ! $in ) { return null; }
	usort( $in, function ( $a, $b ) { return ( $a['yEnd'] - $a['yStart'] ) - ( $b['yEnd'] - $b['yStart'] ); } );
	return $in[0];
}

function sc_generation_years( $rows, $make, $model, $gen ) {
	foreach ( $rows as $r ) {
		if ( $r['make'] === $make && $r['model'] === $model && $r['gen'] === $gen ) {
			return array( $r['yStart'], $r['yEnd'] );
		}
	}
	return null;
}

/* ---------- normalize a MarketCheck listing to the front-end shape ---------- */
function sc_normalize_listing( $l, $max_photos = 12 ) {
	$b      = $l['build'] ?? array();
	$media  = $l['media'] ?? array();
	$photos = $media['photo_links'] ?? ( $media['photo_links_cached'] ?? array() );
	$dealer = $l['dealer'] ?? array();
	$city   = $dealer['city'] ?? ( $l['build_city'] ?? null );
	$state  = $dealer['state'] ?? null;
	$num    = function ( $v ) { return is_numeric( $v ) ? $v + 0 : null; };
	return array(
		'id'           => $l['id'] ?? null,
		'vin'          => $l['vin'] ?? null,
		'year'         => $b['year'] ?? null,
		'make'         => $b['make'] ?? null,
		'model'        => $b['model'] ?? null,
		'trim'         => $b['trim'] ?? null,
		'title'        => trim( implode( ' ', array_filter( array( $b['year'] ?? '', $b['make'] ?? '', $b['model'] ?? '' ) ) ) ),
		'price'        => $num( $l['price'] ?? null ),
		'miles'        => $num( $l['miles'] ?? null ),
		'body_type'    => $b['body_type'] ?? null,
		'transmission' => $b['transmission'] ?? null,
		'drivetrain'   => $b['drivetrain'] ?? null,
		'engine'       => $b['engine'] ?? ( isset( $b['engine_size'] ) ? $b['engine_size'] . 'L' : null ),
		'doors'        => $b['doors'] ?? null,
		'exterior'     => $l['exterior_color'] ?? null,
		'interior'     => $l['interior_color'] ?? null,
		'city'         => $city,
		'state'        => $state,
		'location'     => trim( implode( ', ', array_filter( array( $city, $state ) ) ) ),
		'dealer'       => $dealer['name'] ?? null,
		'dealer_id'    => $dealer['id'] ?? ( $dealer['dealer_id'] ?? null ),
		'dealer_phone' => $dealer['phone'] ?? null,
		'seller_type'  => $l['seller_type'] ?? null,
		'dom'          => $l['dom'] ?? null,
		'photo'        => $photos[0] ?? null,
		'photos'       => array_slice( $photos, 0, max( 1, $max_photos ) ),
		'vdp_url'      => $l['vdp_url'] ?? null,
		'generation'   => null,
		'hp'           => null,
		'hp_min'       => null,
		'hp_max'       => null,
	);
}

function sc_merge_spec( $rows, $listing ) {
	$g = sc_match_generation( $rows, $listing['make'], $listing['model'], $listing['year'] );
	if ( ! $g ) { return $listing; }
	$listing['generation'] = $g['gen'];
	$listing['hp_min']     = $g['hpMin'];
	$listing['hp_max']     = $g['hpMax'];
	$listing['hp']         = ( $g['hpMin'] === $g['hpMax'] ) ? $g['hpMin'] : ( $g['hpMin'] . '–' . $g['hpMax'] );
	return $listing;
}

/* ---------- clamp + query building ---------- */
function sc_clamp_int( $v, $def, $min, $max ) {
	if ( ! is_numeric( $v ) ) { return $def; }
	return max( $min, min( $max, (int) $v ) );
}

function sc_build_search_query( $p, $rows_override = null ) {
	$q = array( 'car_type' => 'used' );
	$q['rows']  = null !== $rows_override ? $rows_override : sc_clamp_int( $p['rows'] ?? null, 12, 1, 50 );
	$q['start'] = sc_clamp_int( $p['start'] ?? null, 0, 0, 5000 );

	$make = $p['make'] ?? '';
	$model = $p['model'] ?? '';
	$keyword = $p['keyword'] ?? '';
	$gen = $p['generation'] ?? '';

	if ( $make ) { $q['make'] = $make; }
	elseif ( ! $model && ! $keyword ) { $q['make'] = SC_MC_DEFAULT_MAKES; }
	if ( $model ) { $q['model'] = $model; }
	foreach ( array( 'body_type', 'transmission', 'drivetrain' ) as $f ) {
		if ( ! empty( $p[ $f ] ) ) { $q[ $f ] = $p[ $f ]; }
	}
	if ( $keyword ) { $q['keyword'] = $keyword; }

	$pmin = $p['price_min'] ?? ''; $pmax = $p['price_max'] ?? '';
	if ( $pmin || $pmax ) { $q['price_range'] = ( $pmin ?: 0 ) . '-' . ( $pmax ?: 100000000 ); }
	$mmin = $p['miles_min'] ?? ''; $mmax = $p['miles_max'] ?? '';
	if ( $mmin || $mmax ) { $q['miles_range'] = ( $mmin ?: 0 ) . '-' . ( $mmax ?: 100000000 ); }

	$tax  = sc_tax();
	$ymin = $p['year_min'] ?? ''; $ymax = $p['year_max'] ?? '';
	if ( ! $ymin && ! $ymax && $gen && $make && $model ) {
		$win = sc_generation_years( $tax['rows'], $make, $model, $gen );
		if ( $win ) { $ymin = (string) $win[0]; $ymax = (string) $win[1]; }
	}
	if ( $ymin || $ymax ) { $q['year_range'] = ( $ymin ?: 1900 ) . '-' . ( $ymax ?: $tax['currentYear'] ); }

	$sort_map = array(
		'newest'     => array( 'dom', 'asc' ),
		'oldest'     => array( 'dom', 'desc' ),
		'price_asc'  => array( 'price', 'asc' ),
		'price_desc' => array( 'price', 'desc' ),
		'miles_asc'  => array( 'miles', 'asc' ),
		'miles_desc' => array( 'miles', 'desc' ),
	);
	$s = $sort_map[ $p['sort'] ?? 'newest' ] ?? $sort_map['newest'];
	$q['sort_by']    = $s[0];
	$q['sort_order'] = $s[1];

	return '/search/car/active?' . http_build_query( $q );
}

function sc_diversify_by_make( $listings ) {
	$by = array();
	foreach ( $listings as $v ) { $by[ $v['make'] ?? '?' ][] = $v; }
	$out = array();
	$added = true;
	while ( $added ) {
		$added = false;
		foreach ( $by as $mk => $bucket ) {
			if ( ! empty( $by[ $mk ] ) ) { $out[] = array_shift( $by[ $mk ] ); $added = true; }
		}
	}
	return $out;
}

/* ---------- upstream fetch (cached) ---------- */
function sc_mc_fetch( $path ) {
	$key = sc_marketcheck_key();
	if ( ! $key ) { return new WP_Error( 'api_key_missing', 'MarketCheck key not configured', array( 'status' => 503 ) ); }
	$url = SC_MC_BASE . $path . ( strpos( $path, '?' ) !== false ? '&' : '?' ) . 'api_key=' . rawurlencode( $key );
	$ck  = 'sc_mc_' . md5( $path );
	$hit = get_transient( $ck );
	if ( false !== $hit ) { return $hit; }
	$res = wp_remote_get( $url, array( 'timeout' => 15 ) );
	if ( is_wp_error( $res ) ) { return $res; }
	$code = wp_remote_retrieve_response_code( $res );
	if ( $code < 200 || $code >= 300 ) { return new WP_Error( 'upstream_error', 'MarketCheck ' . $code, array( 'status' => 502 ) ); }
	$data = json_decode( wp_remote_retrieve_body( $res ), true );
	if ( ! is_array( $data ) ) { return new WP_Error( 'bad_json', 'Malformed upstream response', array( 'status' => 502 ) ); }
	set_transient( $ck, $data, SC_MC_TTL );
	return $data;
}

/* ---------- curated-catalog guardrails ---------- */
function sc_norm( $s ) { return preg_replace( '/[^a-z0-9]/', '', strtolower( (string) $s ) ); }

/* True when a live listing is a make+model in our sports-car taxonomy, so
   SUVs/pickups from curated makes (Cayenne, Macan, Avalanche…) are excluded. */
function sc_is_curated( $l, $rows ) {
	if ( empty( $l['make'] ) || empty( $l['model'] ) ) { return false; }
	$mk = strtolower( $l['make'] ); $md = strtolower( $l['model'] );
	foreach ( $rows as $r ) {
		$rmk = strtolower( $r['make'] ); $rmd = strtolower( $r['model'] );
		$make_ok  = ( $rmk === $mk || strpos( $mk, $rmk ) === 0 || strpos( $rmk, $mk ) === 0 );
		$model_ok = ( $md === $rmd || strpos( $md, $rmd ) === 0 || strpos( $rmd, $md ) === 0 );
		if ( $make_ok && $model_ok ) { return true; }
	}
	return false;
}

/* Resolve a free-text keyword to a curated make+model when it names a model,
   so keyword=911 becomes make=Porsche&model=911 (a precise query) instead of a
   broad full-text match that also hits "911 Assist" on unrelated vehicles. */
function sc_resolve_keyword( $kw, $rows ) {
	$n = sc_norm( $kw );
	if ( strlen( $n ) < 2 ) { return null; }
	foreach ( $rows as $r ) {
		$rm = sc_norm( $r['model'] );
		$mk = sc_norm( $r['make'] );
		if ( $rm && ( $rm === $n || $n === $mk . $rm ) ) { return array( $r['make'], $r['model'] ); }
	}
	return null;
}

/* ---------- REST handlers ---------- */
function sc_rest_search( WP_REST_Request $req ) {
	$p    = $req->get_params();
	$tax  = sc_tax();
	$rows = sc_clamp_int( $p['rows'] ?? null, 12, 1, 50 );
	$start = sc_clamp_int( $p['start'] ?? null, 0, 0, 5000 );

	$hp_min = isset( $p['hp_min'] ) && $p['hp_min'] !== '' ? (int) $p['hp_min'] : null;
	$hp_max = isset( $p['hp_max'] ) && $p['hp_max'] !== '' ? (int) $p['hp_max'] : null;
	$gen    = $p['generation'] ?? '';

	// Resolve a model keyword ("911") to a precise make+model so it doesn't
	// broad-match unrelated vehicles ("911 Assist" etc.).
	if ( ! empty( $p['keyword'] ) && empty( $p['model'] ) ) {
		$res = sc_resolve_keyword( $p['keyword'], $tax['rows'] );
		if ( $res ) { $p['make'] = $res[0]; $p['model'] = $res[1]; unset( $p['keyword'] ); }
	}

	$is_default = empty( $p['make'] ) && empty( $p['model'] ) && empty( $p['keyword'] ) && ! $gen;
	$precise    = ! empty( $p['make'] ) && ! empty( $p['model'] );

	// Broad searches — and any hp/generation filter — run through pool-then-filter,
	// which enforces the curated catalog (only taxonomy sports models appear) and
	// keeps count + pagination honest.
	if ( ! $precise || null !== $hp_min || null !== $hp_max || $gen ) {
		$pool = array();
		$num_found_upstream = 0;
		for ( $s = 0; $s < SC_MC_POOL_CAP; $s += 50 ) {
			$pp = $p; $pp['start'] = $s;
			$data = sc_mc_fetch( sc_build_search_query( $pp, 50 ) );
			if ( is_wp_error( $data ) ) { return $data; }
			$num_found_upstream = $data['num_found'] ?? $num_found_upstream;
			$batch = $data['listings'] ?? array();
			foreach ( $batch as $l ) { $pool[] = sc_merge_spec( $tax['rows'], sc_normalize_listing( $l ) ); }
			if ( count( $batch ) < 50 ) { break; }
		}
		$filtered = array();
		foreach ( $pool as $l ) {
			if ( ! sc_is_curated( $l, $tax['rows'] ) ) { continue; } // sports cars only — no SUVs/pickups
			if ( $gen && $l['generation'] !== $gen ) { continue; }
			if ( null !== $hp_min || null !== $hp_max ) {
				if ( null === $l['hp_min'] ) { continue; }
				if ( null !== $hp_min && $l['hp_max'] < $hp_min ) { continue; }
				if ( null !== $hp_max && $l['hp_min'] > $hp_max ) { continue; }
			}
			$filtered[] = $l;
		}
		if ( $is_default ) { $filtered = sc_diversify_by_make( $filtered ); }
		$capped = ( $num_found_upstream > SC_MC_POOL_CAP );
		return rest_ensure_response( array(
			'num_found' => count( $filtered ),
			'capped'    => $capped,
			'listings'  => array_slice( $filtered, $start, $rows ),
		) );
	}

	// Precise make+model: upstream is model-scoped and already curated.
	$data = sc_mc_fetch( sc_build_search_query( $p, $rows ) );
	if ( is_wp_error( $data ) ) { return $data; }
	$listings = array();
	foreach ( ( $data['listings'] ?? array() ) as $l ) {
		$listings[] = sc_merge_spec( $tax['rows'], sc_normalize_listing( $l ) );
	}
	return rest_ensure_response( array(
		'num_found' => $data['num_found'] ?? 0,
		'listings'  => array_values( array_slice( $listings, 0, $rows ) ),
	) );
}

function sc_rest_listing( WP_REST_Request $req ) {
	$id   = $req->get_param( 'id' );
	$data = sc_mc_fetch( '/listing/car/' . rawurlencode( $id ) );
	if ( is_wp_error( $data ) ) { return $data; }
	$tax = sc_tax();
	return rest_ensure_response( sc_merge_spec( $tax['rows'], sc_normalize_listing( $data, 24 ) ) );
}

function sc_rest_dealer( WP_REST_Request $req ) {
	$id = $req->get_param( 'dealer_id' );
	if ( ! $id ) { return new WP_Error( 'dealer_id_required', 'dealer_id required', array( 'status' => 400 ) ); }
	$rows = sc_clamp_int( $req->get_param( 'rows' ), 9, 1, 24 );
	$tax  = sc_tax();

	// 1) Direct dealer-scoped search: authoritative count and, on plans that
	//    return dealer-scoped bodies, the listings too.
	$data      = sc_mc_fetch( '/search/car/active?dealer_id=' . rawurlencode( $id ) . '&rows=' . $rows );
	if ( is_wp_error( $data ) ) { return $data; }
	$num_found = $data['num_found'] ?? 0;
	$raw       = $data['listings'] ?? array();

	// 2) Fallback: some plans return the count but not the bodies when filtered
	//    by dealer_id. Recover this dealer's cars by scanning curated makes and
	//    keeping only listings whose dealer id matches. Bounded + cached.
	if ( ! $raw && $num_found > 0 ) {
		$acc = array();
		foreach ( explode( ',', SC_MC_DEFAULT_MAKES ) as $mk ) {
			if ( count( $acc ) >= $rows ) { break; }
			$j = sc_mc_fetch( '/search/car/active?make=' . rawurlencode( $mk ) . '&rows=50' );
			if ( is_wp_error( $j ) ) { continue; }
			foreach ( ( $j['listings'] ?? array() ) as $l ) {
				if ( isset( $l['dealer']['id'] ) && (string) $l['dealer']['id'] === (string) $id ) { $acc[] = $l; }
			}
		}
		$raw = $acc;
	}

	$listings = array();
	foreach ( $raw as $l ) { $listings[] = sc_merge_spec( $tax['rows'], sc_normalize_listing( $l ) ); }
	usort( $listings, function ( $a, $b ) { return ( $a['dom'] ?? 9999 ) - ( $b['dom'] ?? 9999 ); } );
	$listings = array_slice( $listings, 0, $rows );

	$dealer = array( 'id' => $id, 'name' => null, 'location' => null, 'phone' => null );
	if ( isset( $listings[0] ) ) {
		$dealer['name']     = $listings[0]['dealer'];
		$dealer['location'] = $listings[0]['location'];
		$dealer['phone']    = $listings[0]['dealer_phone'];
	}
	return rest_ensure_response( array(
		'dealer'    => $dealer,
		'num_found' => $num_found ?: count( $listings ),
		'listings'  => $listings,
	) );
}

add_action( 'rest_api_init', function () {
	$ns = 'sportscars/v1';
	register_rest_route( $ns, '/search', array( 'methods' => 'GET', 'permission_callback' => '__return_true', 'callback' => 'sc_rest_search' ) );
	register_rest_route( $ns, '/listing/(?P<id>[^/]+)', array( 'methods' => 'GET', 'permission_callback' => '__return_true', 'callback' => 'sc_rest_listing' ) );
	register_rest_route( $ns, '/dealer', array( 'methods' => 'GET', 'permission_callback' => '__return_true', 'callback' => 'sc_rest_dealer' ) );
	register_rest_route( $ns, '/health', array( 'methods' => 'GET', 'permission_callback' => '__return_true', 'callback' => function () {
		return array( 'ok' => true, 'key' => (bool) sc_marketcheck_key() );
	} ) );
} );
