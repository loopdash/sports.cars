<?php
/**
 * Reproducible vehicle importer.
 *
 * Recreates the launch catalog (the ~50 highest-search sports-car models) from
 * the version-controlled seed file, so the CMS is rebuildable from the repo —
 * not just whatever was hand-loaded into a database. Idempotent: matches by
 * title, updates in place, never duplicates.
 *
 * Run on the WP install (WP Engine gate intercepts CLI, so skip its plugin):
 *   wp --skip-plugins=wp-password eval-file tools/vehicles/import.php
 *
 * Requires ACF (specs/citations) and, for images, network access to the
 * Wikimedia URLs in the seed. Re-run any time; only changed fields are written.
 *
 * @package sportscars
 */

if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) { fwrite( STDERR, "Run via wp eval-file.\n" ); return; }
if ( ! function_exists( 'update_field' ) ) { WP_CLI::error( 'ACF not active — activate it before importing.' ); }

require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$seed_path = __DIR__ . '/seed-50.json';
$seed = json_decode( file_get_contents( $seed_path ), true );
if ( ! is_array( $seed ) ) { WP_CLI::error( "Cannot read $seed_path" ); }

$created = 0; $updated = 0; $images = 0;
foreach ( $seed as $v ) {
	$post = get_page_by_title( $v['title'], OBJECT, 'vehicle' );
	if ( $post ) {
		$id = $post->ID; $updated++;
	} else {
		$id = wp_insert_post( array(
			'post_type'   => 'vehicle',
			'post_status' => 'publish',
			'post_title'  => $v['title'],
			'post_excerpt'=> $v['excerpt'] ?? '',
		) );
		if ( is_wp_error( $id ) ) { WP_CLI::warning( "insert failed: {$v['title']}" ); continue; }
		$created++;
	}

	if ( ! empty( $v['make'] ) )       { wp_set_object_terms( $id, $v['make'], 'make' ); }
	if ( ! empty( $v['model'] ) )      { wp_set_object_terms( $id, $v['model'], 'sc_model' ); }
	if ( ! empty( $v['generation'] ) ) { wp_set_object_terms( $id, $v['generation'], 'generation' ); }
	if ( ! empty( $v['category'] ) )   { wp_set_object_terms( $id, $v['category'], 'vehicle_category' ); }

	if ( ! empty( $v['years'] ) ) { update_field( 'years', $v['years'], $id ); }
	update_field( 'rarity', 'Standard', $id );
	foreach ( (array) ( $v['specs'] ?? array() ) as $k => $val ) { update_field( $k, $val, $id ); }

	if ( ! empty( $v['source_url'] ) ) {
		update_field( 'source_url', $v['source_url'], $id );
		update_field( 'citations', array( array(
			'url'  => $v['source_url'],
			'tier' => 'Tier 2',
			'note' => ( $v['wiki_title'] ?: $v['title'] ) . ', Wikipedia',
		) ), $id );
	}
	update_field( 'confidence', 'Medium', $id );
	update_field( 'last_verified', gmdate( 'Ymd' ), $id );
	update_post_meta( $id, 'sc_search_volume', (int) ( $v['search_volume'] ?? 0 ) );

	if ( ! empty( $v['image'] ) && ! has_post_thumbnail( $id ) ) {
		$att = media_sideload_image( $v['image'], $id, $v['title'], 'id' );
		if ( ! is_wp_error( $att ) ) { set_post_thumbnail( $id, $att ); $images++; }
	}
}
WP_CLI::success( "Vehicles — created: $created, updated: $updated, images sideloaded: $images." );
