<?php
/**
 * Footer — the Concept #3 footer + wp_footer().
 * @package sportscars
 */
?>
	<footer class="c3-footer">
		<div class="c3__container">
			<div class="c3-footer__top">
				<div>
					<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="c3-wordmark"><span>SPORTS</span><span class="c3-wordmark__dot">.</span><span>CARS</span></a>
					<p class="c3-footer__tagline">A marketplace and journal for people who love extraordinary cars.</p>
				</div>
				<div class="c3-footer__col"><h4>Buy</h4><a href="<?php echo esc_url( home_url( '/search/' ) ); ?>">All inventory</a><a href="<?php echo esc_url( home_url( '/#explore' ) ); ?>">By category</a><a href="<?php echo esc_url( home_url( '/search/' ) ); ?>">By brand</a><a href="<?php echo esc_url( home_url( '/search/' ) ); ?>">Search</a></div>
				<div class="c3-footer__col"><h4>Sell</h4><a href="<?php echo esc_url( home_url( '/sell/' ) ); ?>">Sell a car</a><a href="<?php echo esc_url( home_url( '/sell/' ) ); ?>">How it works</a><a href="<?php echo esc_url( home_url( '/dealers/' ) ); ?>">Become a dealer</a></div>
				<div class="c3-footer__col"><h4>Explore</h4><a href="<?php echo esc_url( home_url( '/#explore' ) ); ?>">Categories</a><a href="<?php echo esc_url( home_url( '/resources/' ) ); ?>">The Journal</a><a href="<?php echo esc_url( home_url( '/resources/' ) ); ?>">Buying guides</a><a href="<?php echo esc_url( home_url( '/resources/' ) ); ?>">Comparisons</a></div>
				<div class="c3-footer__col"><h4>Sports.cars</h4><a href="<?php echo esc_url( home_url( '/about/' ) ); ?>">About</a><a href="<?php echo esc_url( home_url( '/company/' ) ); ?>">Company</a><a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">Contact</a></div>
				<div class="c3-footer__col"><h4>Legal</h4><a href="#">Terms</a><a href="<?php echo esc_url( home_url( '/privacy/' ) ); ?>">Privacy</a><a href="#">Trust &amp; Accuracy</a><a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">Report an Error</a></div>
			</div>
			<div class="c3-footer__bottom">
				<span>Paid placement, sponsorship and advertising are labelled wherever they appear.</span>
				<span>&copy; <?php echo esc_html( date( 'Y' ) ); ?> Sports.cars</span>
			</div>
		</div>
	</footer>

	<?php wp_footer(); ?>
</body>
</html>
