/**
 * Mobile Parallax Effect
 * 
 * This script provides a true parallax scrolling effect on mobile devices where
 * CSS background-attachment: fixed is not supported (iOS Safari, etc.).
 * 
 * Uses IntersectionObserver for performance and requestAnimationFrame for smooth updates.
 * The background stays fixed while content scrolls over it, matching desktop behavior.
 */

(function() {
	'use strict';

	// Check if we're on a mobile device or small screen
	function isMobileOrSmallScreen() {
		return window.innerWidth <= 736;
	}

	// Check if background-attachment: fixed is properly supported
	function isFixedBackgroundSupported() {
		// iOS Safari doesn't support background-attachment: fixed
		var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
		var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		
		// Also check for other mobile browsers that have issues
		var isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
		
		return !(isIOS || (isMobileDevice && isSafari));
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
	var ticking = false;

	/**
	 * Create the fixed background container
	 */
	function createFixedBackground() {
		var container = document.createElement('div');
		container.id = 'parallax-bg-container';
		container.style.cssText = [
			'position: fixed',
			'top: 0',
			'left: 0',
			'width: 100%',
			'height: 100%',
			'z-index: -1',
			'pointer-events: none',
			'overflow: hidden'
		].join(';');

		// Create background layers for each section
		parallaxSections.forEach(function(config, index) {
			var layer = document.createElement('div');
			layer.className = 'parallax-bg-layer';
			layer.dataset.section = config.id;
			layer.style.cssText = [
				'position: absolute',
				'top: 0',
				'left: 0',
				'width: 100%',
				'height: 100%',
				'opacity: 0',
				'transition: opacity 0.3s ease-out',
				'background-image: url("' + config.overlay + '"), url("' + config.image + '")',
				'background-size: 256px 256px, cover',
				'background-position: top left, ' + config.position,
				'background-repeat: repeat, no-repeat',
				'will-change: opacity'
			].join(';');

			container.appendChild(layer);
			parallaxElements.push({
				element: layer,
				sectionId: config.id
			});
		});

		document.body.insertBefore(container, document.body.firstChild);
		return container;
	}

	/**
	 * Update which background layer is visible based on scroll position
	 */
	function updateVisibleBackground(sectionId) {
		if (currentVisibleSection === sectionId) return;
		
		currentVisibleSection = sectionId;

		parallaxElements.forEach(function(item) {
			if (item.sectionId === sectionId) {
				item.element.style.opacity = '1';
			} else {
				item.element.style.opacity = '0';
			}
		});
	}

	/**
	 * Set up IntersectionObserver to track which section is in view
	 */
	function setupIntersectionObserver() {
		var options = {
			root: null,
			rootMargin: '-30% 0px -30% 0px',
			threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
		};

		var observer = new IntersectionObserver(function(entries) {
			var mostVisibleEntry = null;
			var maxRatio = 0;

			entries.forEach(function(entry) {
				if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
					maxRatio = entry.intersectionRatio;
					mostVisibleEntry = entry;
				}
			});

			if (mostVisibleEntry) {
				updateVisibleBackground(mostVisibleEntry.target.id);
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
	 * Fallback scroll handler for browsers without IntersectionObserver
	 */
	function setupScrollHandler() {
		function findVisibleSection() {
			var viewportHeight = window.innerHeight;
			var viewportCenter = viewportHeight / 2;
			var closestSection = null;
			var closestDistance = Infinity;

			parallaxSections.forEach(function(config) {
				var section = document.getElementById(config.id);
				if (!section) return;

				var rect = section.getBoundingClientRect();
				var sectionCenter = rect.top + rect.height / 2;
				var distance = Math.abs(sectionCenter - viewportCenter);

				// Check if section is at least partially visible
				if (rect.bottom > 0 && rect.top < viewportHeight) {
					if (distance < closestDistance) {
						closestDistance = distance;
						closestSection = config.id;
					}
				}
			});

			return closestSection;
		}

		function onScroll() {
			if (!ticking) {
				requestAnimationFrame(function() {
					var visibleSection = findVisibleSection();
					if (visibleSection) {
						updateVisibleBackground(visibleSection);
					}
					ticking = false;
				});
				ticking = true;
			}
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		
		// Initial check
		onScroll();
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
		if (container) {
			container.parentNode.removeChild(container);
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

		// Use IntersectionObserver if available, otherwise fall back to scroll handler
		if ('IntersectionObserver' in window) {
			setupIntersectionObserver();
		} else {
			setupScrollHandler();
		}

		// Show initial section
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
		var shouldUseMobileParallax = isMobileOrSmallScreen() && !isFixedBackgroundSupported();
		
		if (shouldUseMobileParallax && !isInitialized) {
			initMobileParallax();
		} else if (!shouldUseMobileParallax && isInitialized) {
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
		if (isMobileOrSmallScreen() && !isFixedBackgroundSupported()) {
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
