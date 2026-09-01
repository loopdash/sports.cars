<?php
/**
 * Settings → Sports.Cars — manage the MarketCheck API key from wp-admin so it
 * can be rotated without a deploy. The key is stored as an option and is never
 * rendered back into the page (only its presence + last 4 chars are shown).
 *
 * @package sportscars
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/* Register the option with a keep-if-blank sanitizer (saving an empty field
   leaves the stored key untouched, so the key is never echoed into a form). */
add_action( 'admin_init', function () {
	register_setting( 'sc_settings', 'sc_marketcheck_api_key', array(
		'type'              => 'string',
		'sanitize_callback' => function ( $new ) {
			$new = trim( (string) $new );
			if ( '' === $new ) { return (string) get_option( 'sc_marketcheck_api_key', '' ); }
			return sanitize_text_field( $new );
		},
		'default'           => '',
		'show_in_rest'      => false,
	) );
} );

add_action( 'admin_menu', function () {
	add_options_page( 'Sports.Cars', 'Sports.Cars', 'manage_options', 'sportscars', 'sc_render_settings_page' );
} );

function sc_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) { return; }

	$key    = sc_marketcheck_key();
	$has    = '' !== $key;
	$last4  = $has ? substr( $key, -4 ) : '';
	$source = '';
	if ( '' !== trim( (string) get_option( 'sc_marketcheck_api_key', '' ) ) ) { $source = 'admin option'; }
	elseif ( defined( 'MARKETCHECK_API_KEY' ) && MARKETCHECK_API_KEY ) { $source = 'wp-config constant'; }
	elseif ( getenv( 'MARKETCHECK_API_KEY' ) ) { $source = 'environment variable'; }

	// Live connection test (real MarketCheck call), triggered by the button.
	$test = null;
	if ( isset( $_GET['sc_test'] ) && check_admin_referer( 'sc_test' ) ) {
		$res  = sc_mc_fetch( '/search/car/active?rows=1&make=Ferrari' );
		$test = is_wp_error( $res )
			? array( false, $res->get_error_message() )
			: array( true, 'Connected — upstream reports ' . number_format( (int) ( $res['num_found'] ?? 0 ) ) . ' active listings.' );
	}
	?>
	<div class="wrap">
		<h1>Sports.Cars</h1>
		<h2 class="title">MarketCheck API</h2>
		<p>
			Status:
			<?php if ( $has ) : ?>
				<strong style="color:#1a7f37">Key set</strong> (ends <code>&hellip;<?php echo esc_html( $last4 ); ?></code>, from <?php echo esc_html( $source ); ?>).
			<?php else : ?>
				<strong style="color:#b32d2e">No key configured</strong> — live inventory falls back to sample data.
			<?php endif; ?>
		</p>

		<form method="post" action="options.php">
			<?php settings_fields( 'sc_settings' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="sc_mc_key">MarketCheck API key</label></th>
					<td>
						<input type="password" id="sc_mc_key" name="sc_marketcheck_api_key" value="" autocomplete="off"
							class="regular-text" placeholder="<?php echo $has ? 'Leave blank to keep the current key' : 'Paste the MarketCheck API key'; ?>" />
						<p class="description">Stored server-side; never exposed to the browser. Leave blank to keep the existing key.</p>
					</td>
				</tr>
			</table>
			<?php submit_button( 'Save key' ); ?>
		</form>

		<hr />
		<h2 class="title">Connection test</h2>
		<?php if ( $test ) : ?>
			<div class="notice notice-<?php echo $test[0] ? 'success' : 'error'; ?> inline"><p><?php echo esc_html( $test[1] ); ?></p></div>
		<?php endif; ?>
		<p>
			<a class="button" href="<?php echo esc_url( wp_nonce_url( admin_url( 'options-general.php?page=sportscars&sc_test=1' ), 'sc_test' ) ); ?>">Test live connection</a>
			<a class="button" href="<?php echo esc_url( rest_url( 'sportscars/v1/health' ) ); ?>" target="_blank" rel="noopener">Health endpoint</a>
		</p>
	</div>
	<?php
}
