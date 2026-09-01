<?php
/**
 * CMS — content model for Sports.Cars.
 *
 * Post types:   vehicle, sc_article
 * Taxonomies:   make, sc_model, generation, vehicle_category  (on vehicle)
 * Fields:       ACF field group of per-variant specs + citations + confidence
 *               + last-verified, mapped to the taxonomy sheet's columns.
 * Roles:        sc_researcher (content + verification), plus vehicle/article
 *               caps granted to editor + administrator.
 *
 * Field groups are registered in PHP (acf_add_local_field_group) so the schema
 * is version-controlled in the theme, not trapped in the database.
 *
 * @package sportscars
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/* -------------------------------------------------------------------------
 * Post types
 * ---------------------------------------------------------------------- */
add_action( 'init', function () {

	register_post_type( 'vehicle', array(
		'labels'       => array(
			'name'          => 'Vehicles',
			'singular_name' => 'Vehicle',
			'add_new_item'  => 'Add Vehicle',
			'edit_item'     => 'Edit Vehicle',
			'search_items'  => 'Search Vehicles',
		),
		'public'       => true,
		'has_archive'  => 'vehicles',
		'menu_icon'    => 'dashicons-dashboard',
		'menu_position'=> 5,
		'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt', 'revisions' ),
		'rewrite'      => array( 'slug' => 'vehicles', 'with_front' => false ),
		'show_in_rest' => true,
		'capability_type' => 'post',
		'map_meta_cap' => true,
	) );

	register_post_type( 'sc_article', array(
		'labels'       => array(
			'name'          => 'Articles',
			'singular_name' => 'Article',
			'add_new_item'  => 'Add Article',
			'edit_item'     => 'Edit Article',
		),
		'public'       => true,
		'has_archive'  => 'journal',
		'menu_icon'    => 'dashicons-media-document',
		'menu_position'=> 6,
		'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt', 'author', 'revisions' ),
		'rewrite'      => array( 'slug' => 'journal', 'with_front' => false ),
		'show_in_rest' => true,
		'capability_type' => 'post',
		'map_meta_cap' => true,
	) );

	/* Taxonomies on vehicle. make/model/generation are the hierarchy the
	   sheet encodes; vehicle_category is the marketplace grouping. */
	$tax = function ( $slug, $singular, $plural, $rewrite, $hier = false ) {
		register_taxonomy( $slug, 'vehicle', array(
			'labels'            => array( 'name' => $plural, 'singular_name' => $singular ),
			'hierarchical'      => $hier,
			'public'            => true,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rewrite'           => array( 'slug' => $rewrite, 'with_front' => false ),
		) );
	};
	$tax( 'make', 'Make', 'Makes', 'make' );
	$tax( 'sc_model', 'Model', 'Models', 'model' );
	$tax( 'generation', 'Generation', 'Generations', 'generation' );
	$tax( 'vehicle_category', 'Category', 'Categories', 'category-vehicle', true );
} );

/* -------------------------------------------------------------------------
 * ACF field group — per-variant spec + provenance. Columns mirror the
 * taxonomy sheet (identity + spec-enrichment fields) plus the trust fields
 * the brief requires: citations, confidence score, last verified.
 * ---------------------------------------------------------------------- */
add_action( 'acf/init', function () {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) { return; }

	$txt = function ( $key, $label, $instr = '' ) {
		return array( 'key' => 'field_sc_' . $key, 'label' => $label, 'name' => $key, 'type' => 'text', 'instructions' => $instr );
	};

	acf_add_local_field_group( array(
		'key'      => 'group_sc_vehicle',
		'title'    => 'Vehicle record',
		'location' => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'vehicle' ) ) ),
		'menu_order' => 0,
		'position' => 'normal',
		'fields'   => array(
			// Identity (from the sheet)
			array( 'key' => 'field_sc_tab_id', 'label' => 'Identity', 'type' => 'tab' ),
			$txt( 'chassis_code', 'Chassis code', 'Internal platform/chassis code (e.g. 992).' ),
			$txt( 'trim', 'Trim', 'Variant/trim level (e.g. Carrera S).' ),
			$txt( 'body_style', 'Body style', 'e.g. Coupe, Cabriolet, Targa.' ),
			$txt( 'edition', 'Edition', 'Limited/commemorative edition name, if any.' ),
			$txt( 'years', 'Years', 'Production year range (e.g. 2019–2023).' ),
			array( 'key' => 'field_sc_rarity', 'label' => 'Rarity', 'name' => 'rarity', 'type' => 'select', 'choices' => array( 'Standard' => 'Standard', 'Special' => 'Special' ), 'default_value' => 'Standard' ),
			array( 'key' => 'field_sc_production_count', 'label' => 'Production count', 'name' => 'production_count', 'type' => 'number', 'instructions' => 'Only when the source states a number — never estimated.' ),

			// Specs (Pass 1/2 enrichment)
			array( 'key' => 'field_sc_tab_spec', 'label' => 'Specifications', 'type' => 'tab' ),
			$txt( 'horsepower', 'Horsepower', 'e.g. 443 hp' ),
			$txt( 'torque', 'Torque' ),
			$txt( 'zero_to_sixty', '0–60 mph' ),
			$txt( 'top_speed', 'Top speed' ),
			$txt( 'engine_type', 'Engine type' ),
			$txt( 'transmission', 'Transmission' ),
			$txt( 'drivetrain', 'Drivetrain' ),
			$txt( 'wheelbase', 'Wheelbase' ),
			$txt( 'length', 'Length' ),
			$txt( 'width', 'Width' ),
			$txt( 'height', 'Height' ),
			$txt( 'curb_weight', 'Curb weight' ),
			$txt( 'seating_capacity', 'Seating capacity' ),
			$txt( 'fuel_type', 'Fuel type' ),

			// Provenance / trust
			array( 'key' => 'field_sc_tab_trust', 'label' => 'Provenance & trust', 'type' => 'tab' ),
			array(
				'key' => 'field_sc_citations', 'label' => 'Citations', 'name' => 'citations', 'type' => 'repeater',
				'instructions' => 'Every non-obvious fact should trace to a source. No single unverified claim.',
				'button_label' => 'Add citation', 'layout' => 'table',
				'sub_fields' => array(
					array( 'key' => 'field_sc_cite_url', 'label' => 'Source URL', 'name' => 'url', 'type' => 'url' ),
					array( 'key' => 'field_sc_cite_tier', 'label' => 'Tier', 'name' => 'tier', 'type' => 'select', 'choices' => array( 'Tier 1' => 'Tier 1 (primary/manufacturer)', 'Tier 2' => 'Tier 2 (reputable secondary)' ), 'default_value' => 'Tier 2' ),
					array( 'key' => 'field_sc_cite_note', 'label' => 'Note', 'name' => 'note', 'type' => 'text' ),
				),
			),
			array( 'key' => 'field_sc_confidence', 'label' => 'Confidence', 'name' => 'confidence', 'type' => 'select', 'choices' => array( 'High' => 'High', 'Medium' => 'Medium', 'Low' => 'Low' ), 'default_value' => 'Medium' ),
			array( 'key' => 'field_sc_last_verified', 'label' => 'Last verified', 'name' => 'last_verified', 'type' => 'date_picker', 'display_format' => 'M j, Y', 'return_format' => 'M j, Y' ),
			$txt( 'source_url', 'Primary source URL', 'Canonical reference (e.g. the Wikipedia article).' ),
		),
	) );

} );

/* -------------------------------------------------------------------------
 * Roles & capabilities
 * ---------------------------------------------------------------------- */
add_action( 'init', function () {
	// A researcher role: can create/edit vehicles + articles and upload media,
	// but not manage plugins/users/settings.
	if ( ! get_role( 'sc_researcher' ) ) {
		add_role( 'sc_researcher', 'Researcher', array(
			'read'         => true,
			'upload_files' => true,
			'edit_posts'   => true,
			'edit_published_posts' => true,
			'publish_posts'        => true,
			'delete_posts'         => true,
		) );
	}
	// Ensure editors + admins can fully manage the new types (map_meta_cap maps
	// to the primitive post caps these roles already hold).
}, 20 );
