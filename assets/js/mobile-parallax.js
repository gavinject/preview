/**
 * Mobile Parallax Effect
 * 
 * This script provides a parallax scrolling effect on mobile devices where
 * CSS background-attachment: fixed is not reliably supported.
 * 
 * On small screens (<=736px), this script always activates because:
 * - iOS Safari doesn't support background-attachment: fixed
 * - Many Android browsers have issues with it
 * - Using JS provides consistent behavior across all mobile devices
 * 
 * NO fade, opacity, or transition animations are used.
 * Uses IntersectionObserver ONLY to activate which background is shown.
 * Images switch instantly with no visual transitions.
 */

(function() {
	'use strict';

	// Check if we're on a mobile device or small screen
	function isMobileOrSmallScreen() {
		return window.innerWidth <= 736;
	}

	// Parallax sections configuration
	var parallaxSections = [
		{
			id: 'intro',
			overlay: 'assets/css/images/overlay.png',
			image: 'images/intro.jpg',
			position: 'bottom center'
		},
		{
			id: 'one',
			overlay: 'assets/css/images/overlay.png',
			image: 'images/one.jpg',
			position: 'center center'
		},
		{
			id: 'two',
			overlay: 'assets/css/images/overlay.png',
			image: 'images/two.jpg',
			position: 'center center'
		}
	];

	// Store references to created elements
	var parallaxElements = [];
	var currentVisibleSection = null;
	var isInitialized = false;
	var observer = null;

	/**
	 * Create the fixed background container with separate border wrapper
	 * Border is applied to a dedicated wrapper element, NOT to the background image
	 */
	function createFixedBackground() {
		// Create the main container (fixed position, no border, no transform)
		var container = document.createElement('div');
		container.id = 'parallax-bg-container';
		container.style.cssText = [
			'position: fixed',
			'top: 0',
			'left: 0',
			'width: 100%',
			'height: 100%',
			'z-index: -1',
			'pointer-events: none'
		].join(';');

		// Create background layers for each section (no border on these)
		parallaxSections.forEach(function(config) {
			var layer = document.createElement('div');
			layer.className = 'parallax-bg-layer';
			layer.dataset.section = config.id;
			// No opacity, no transition, no border - just display:none/block
			layer.style.cssText = [
				'position: absolute',
				'top: 0',
				'left: 0',
				'width: 100%',
				'height: 100%',
				'display: none',
				'background-image: url("' + config.overlay + '"), url("' + config.image + '")',
				'background-size: 256px 256px, cover',
				'background-position: top left, ' + config.position,
				'background-repeat: repeat, no-repeat'
			].join(';');

			container.appendChild(layer);
			parallaxElements.push({
				element: layer,
				sectionId: config.id
			});
		});

		document.body.insertBefore(container, document.body.firstChild);

		// Create a separate border overlay element (not fixed, not transformed)
		// This ensures the border is always visible and not affected by transforms
		var borderOverlay = document.createElement('div');
		borderOverlay.id = 'parallax-border-overlay';
		borderOverlay.style.cssText = [
			'position: fixed',
			'top: 0',
			'left: 0',
			'width: 100%',
			'height: 100%',
			'z-index: 1',
			'pointer-events: none',
			'border: solid 2px rgba(255,255,255,0.35)',
			'box-sizing: border-box'
		].join(';');
		document.body.insertBefore(borderOverlay, document.body.firstChild);

		return container;
	}

	/**
	 * Update which background layer is visible based on scroll position
	 * Uses display:none/block for instant switching - NO opacity, NO transitions
	 */
	function updateVisibleBackground(sectionId) {
		if (currentVisibleSection === sectionId) return;
		
		currentVisibleSection = sectionId;

		// Instant switch using display property - no fade, no animation
		parallaxElements.forEach(function(item) {
			item.element.style.display = (item.sectionId === sectionId) ? 'block' : 'none';
		});
	}

	/**
	 * Set up IntersectionObserver to track which section is in view
	 * Used ONLY to determine which background to show, NOT for animations
	 * Uses narrow rootMargin to reduce simultaneous intersections
	 */
	function setupIntersectionObserver() {
		var options = {
			root: null,
			rootMargin: '-40% 0px -40% 0px',
			threshold: 0
		};

		observer = new IntersectionObserver(function(entries) {
			// Find the most appropriate intersecting entry
			// Priority: the one closest to the center of the viewport
			var bestEntry = null;
			entries.forEach(function(entry) {
				if (entry.isIntersecting) {
					if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
						bestEntry = entry;
					}
				}
			});
			
			if (bestEntry) {
				updateVisibleBackground(bestEntry.target.id);
			}
		}, options);

		// Observe each parallax section
		parallaxSections.forEach(function(config) {
			var section = document.getElementById(config.id);
			if (section) {
				observer.observe(section);
			}
		});

		return observer;
	}

	/**
	 * Remove original backgrounds from sections on mobile
	 */
	function hideOriginalBackgrounds() {
		parallaxSections.forEach(function(config) {
			var section = document.getElementById(config.id);
			if (section) {
				section.style.background = 'transparent';
			}
		});
	}

	/**
	 * Restore original backgrounds (for desktop or when resizing)
	 */
	function restoreOriginalBackgrounds() {
		parallaxSections.forEach(function(config) {
			var section = document.getElementById(config.id);
			if (section) {
				section.style.background = '';
			}
		});
	}

	/**
	 * Remove parallax elements
	 */
	function removeParallaxElements() {
		var container = document.getElementById('parallax-bg-container');
		if (container && container.parentNode) {
			container.parentNode.removeChild(container);
		}
		var borderOverlay = document.getElementById('parallax-border-overlay');
		if (borderOverlay && borderOverlay.parentNode) {
			borderOverlay.parentNode.removeChild(borderOverlay);
		}
		if (observer) {
			observer.disconnect();
			observer = null;
		}
		parallaxElements = [];
		currentVisibleSection = null;
	}

	/**
	 * Initialize mobile parallax
	 */
	function initMobileParallax() {
		if (isInitialized) return;
		
		createFixedBackground();
		hideOriginalBackgrounds();
		setupIntersectionObserver();

		// Show initial section immediately
		updateVisibleBackground('intro');
		isInitialized = true;
	}

	/**
	 * Cleanup mobile parallax
	 */
	function cleanupMobileParallax() {
		if (!isInitialized) return;
		
		removeParallaxElements();
		restoreOriginalBackgrounds();
		isInitialized = false;
	}

	/**
	 * Handle resize events
	 */
	function handleResize() {
		var useMobileParallax = isMobileOrSmallScreen();
		
		if (useMobileParallax && !isInitialized) {
			initMobileParallax();
		} else if (!useMobileParallax && isInitialized) {
			cleanupMobileParallax();
		}
	}

	// Debounce resize handler
	var resizeTimeout;
	function debouncedResize() {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(handleResize, 150);
	}

	/**
	 * Initialize on DOM ready
	 */
	function init() {
		// Check if we need mobile parallax
		if (isMobileOrSmallScreen()) {
			initMobileParallax();
		}

		// Listen for resize to toggle between mobile/desktop modes
		window.addEventListener('resize', debouncedResize, { passive: true });
	}

	// Start initialization when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

})();
