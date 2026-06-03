/* ═══════════════════════════════════════════════════
   FIST-O Tech — Main Script
   ═══════════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ── Preloader ───────────────────────────────── */
  const PRELOADER_SESSION_KEY = 'fistoPreloaderShown';
  const preloader = document.getElementById('preloader');
  const hasSeenPreloader = sessionStorage.getItem(PRELOADER_SESSION_KEY) === 'true';

  const finishPreload = () => {
    if (!preloader) return;
    document.body.classList.add('is-loaded');
    document.body.classList.remove('is-loading');
    sessionStorage.setItem(PRELOADER_SESSION_KEY, 'true');
    // Allow CSS transition to finish, then remove from DOM
    window.setTimeout(() => preloader.remove(), 550);
  };

  if (hasSeenPreloader) {
    if (preloader) preloader.remove();
    document.body.classList.add('is-loaded');
    document.body.classList.remove('is-loading');
  } else {
    // Hide loader when everything is ready
    window.addEventListener('load', finishPreload, { once: true });
    // Failsafe (in case some external resource hangs)
    window.setTimeout(finishPreload, 5000);
  }

  /* ── Navbar scroll-glass effect ───────────────── */
  const navbar = document.getElementById('navbar');
  const SCROLL_THRESHOLD = 30; // px before glass kicks in

  const handleScroll = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  };

  // Passive listener for performance
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Run once on load in case page is already scrolled
  handleScroll();

  /* ── Scroll Animations (AOS: Animate On Scroll) ──── */
  try {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (!prefersReducedMotion && window.AOS) {
      window.AOS.init({
        duration: 950,
        easing: 'ease-out-cubic',
        offset: 120,
        delay: 0,
        once: false,      // re-animate when scrolling back
        mirror: true,     // animate elements out while scrolling past them
        anchorPlacement: 'top-bottom',
        disableMutationObserver: false
      });

      const refreshAOS = () => {
        try {
          window.AOS.refreshHard();
        } catch (_) {}
      };

      // Ensure AOS recalculates after layout shifts (images/fonts/bfcache)
      window.addEventListener('load', () => {
        refreshAOS();
        window.setTimeout(refreshAOS, 250);
      }, { once: true });

      window.addEventListener('pageshow', () => {
        refreshAOS();
        window.setTimeout(refreshAOS, 250);
      });

      if (document.fonts?.ready) {
        document.fonts.ready.then(() => refreshAOS()).catch(() => {});
      }
    }
  } catch (_) {}

  /* ── 3D Card Hover Effect ───────────────────── */
  const cards = document.querySelectorAll('.solution-card');

  const isHoverEffect = window.innerWidth > 991;

  if (isHoverEffect) {

    cards.forEach($card => {
      let bounds;
    
      const rotateToMouse = (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const leftX = mouseX - bounds.x;
        const topY = mouseY - bounds.y;
        const center = {
          x: leftX - bounds.width / 2,
          y: topY - bounds.height / 2
        };
        
        // Smooth calculation for tilt (adjust 20 for more/less tilt)
        const transitionX = center.y / (bounds.height / 20);
        const transitionY = -center.x / (bounds.width / 20);
    
        $card.style.transform = `
          scale3d(1.07, 1.07, 1.07)
          rotateX(${transitionX}deg)
          rotateY(${transitionY}deg)
        `;
    
        const glow = $card.querySelector('.glow');
        if (glow) {
          glow.style.background = `
            radial-gradient(
              circle at
              ${leftX}px
              ${topY}px,
              #ffffff55,
              #0000000f
            )
          `;
        }
      };
    
      $card.addEventListener('mouseenter', () => {
        bounds = $card.getBoundingClientRect();
        $card.classList.remove('returning'); // Remove snap-back transition
        document.addEventListener('mousemove', rotateToMouse);
      });
    
      $card.addEventListener('mouseleave', () => {
        document.removeEventListener('mousemove', rotateToMouse);
        $card.classList.add('returning'); // Add smooth transition back
        $card.style.transform = '';
        
        const glow = $card.querySelector('.glow');
        if (glow) {
          glow.style.background = '';
        }
      });
    });
    
  }

})();
