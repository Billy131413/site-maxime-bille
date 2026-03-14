/**
 * main.js
 * -------
 * Core site functionality for Maxime BILLE - Webdesigner Freelance
 *
 * Modules:
 *   1. Header scroll effect
 *   2. Mobile menu (toggle, overlay, keyboard)
 *   3. Active navigation link highlight
 *   4. FAQ accordion
 *   5. Smooth scroll for anchor links
 *   6. Lazy-load images (IntersectionObserver + fallback)
 *   7. Counter animation for hero stats
 *   8. URL parameter helper (pack pre-selection)
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. HEADER SCROLL EFFECT
     Add "scrolled" class to .site-header after 50 px of vertical scroll.
     ========================================================================== */

  const initHeaderScroll = () => {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const SCROLL_THRESHOLD = 50;

    const onScroll = () => {
      if (window.scrollY > SCROLL_THRESHOLD) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', onScroll, { passive: true });

    // Run once on load in case the page is already scrolled
    onScroll();
  };

  /* ==========================================================================
     2. MOBILE MENU
     Toggle menu open / close. Close on overlay click, nav-link click, Escape.
     Prevent body scroll while the menu is open.
     ========================================================================== */

  const initMobileMenu = () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks   = document.querySelector('.nav-links');
    const navOverlay = document.querySelector('.nav-overlay');

    if (!menuToggle || !navLinks) return;

    const openMenu = () => {
      menuToggle.classList.add('active');
      navLinks.classList.add('open');
      navOverlay?.classList.add('visible');
      document.body.style.overflow = 'hidden';
      menuToggle.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('open');
      navOverlay?.classList.remove('visible');
      document.body.style.overflow = '';
      menuToggle.setAttribute('aria-expanded', 'false');
    };

    const isMenuOpen = () => navLinks.classList.contains('open');

    // Toggle button
    menuToggle.addEventListener('click', () => {
      isMenuOpen() ? closeMenu() : openMenu();
    });

    // Close when clicking the overlay
    navOverlay?.addEventListener('click', closeMenu);

    // Close when clicking any nav link (useful for single-page anchor nav)
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen()) {
        closeMenu();
      }
    });
  };

  /* ==========================================================================
     3. ACTIVE NAV LINK
     Highlight the navigation link that matches the current page URL.
     ========================================================================== */

  const initActiveNavLink = () => {
    const navLinks = document.querySelectorAll('.nav-links a');
    if (!navLinks.length) return;

    // Get the current page filename (e.g. "contact.html") or "/" for index
    const currentPath = window.location.pathname;
    const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Extract the filename portion of the href
      const linkPage = href.substring(href.lastIndexOf('/') + 1).split('#')[0] || 'index.html';

      if (linkPage === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  /* ==========================================================================
     4. FAQ ACCORDION
     Click a .faq-item__question to toggle its parent .faq-item "active" class.
     Only one item can be open at a time.
     ========================================================================== */

  const initFaqAccordion = () => {
    const questions = document.querySelectorAll('.faq-item__question');
    if (!questions.length) return;

    questions.forEach((question) => {
      question.addEventListener('click', () => {
        const parentItem = question.closest('.faq-item');
        if (!parentItem) return;

        const isAlreadyActive = parentItem.classList.contains('active');

        // Close every other open item first
        document.querySelectorAll('.faq-item.active').forEach((openItem) => {
          openItem.classList.remove('active');
          const btn = openItem.querySelector('.faq-item__question');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });

        // If it wasn't open, open it now (otherwise it stays closed)
        if (!isAlreadyActive) {
          parentItem.classList.add('active');
          question.setAttribute('aria-expanded', 'true');
        }
      });
    });
  };

  /* ==========================================================================
     5. SMOOTH SCROLL FOR ANCHOR LINKS
     Intercept clicks on anchors that point to an ID on the same page.
     ========================================================================== */

  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        e.preventDefault();

        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

        // Update URL hash without jumping
        history.pushState(null, '', targetId);
      });
    });
  };

  /* ==========================================================================
     6. LAZY-LOAD IMAGES
     Use IntersectionObserver to load images when they enter the viewport.
     Falls back to adding the native loading="lazy" attribute.
     ========================================================================== */

  const initLazyLoad = () => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (!lazyImages.length) return;

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const img = entry.target;
            img.src = img.dataset.src;

            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }

            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
            img.classList.add('loaded');

            observer.unobserve(img);
          });
        },
        {
          rootMargin: '200px 0px', // Start loading slightly before visible
        }
      );

      lazyImages.forEach((img) => imageObserver.observe(img));
    } else {
      // Fallback: set native lazy loading and load immediately
      lazyImages.forEach((img) => {
        img.setAttribute('loading', 'lazy');
        img.src = img.dataset.src;

        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }

        img.removeAttribute('data-src');
        img.removeAttribute('data-srcset');
      });
    }
  };

  /* ==========================================================================
     7. COUNTER ANIMATION — handled by animations.js (GSAP version)
     ========================================================================== */

  /* ==========================================================================
     8. URL PARAMETER HELPER
     Read query-string parameters. Used on contact.html to pre-select a pack.
     Exposed on window so other scripts or inline code can call it.
     ========================================================================== */

  const getUrlParam = (key) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  };

  // Expose globally for use in inline scripts or other modules
  window.getUrlParam = getUrlParam;

  /* Pack pre-selection — handled by form.js on contact page */

  /* ==========================================================================
     9. DARK MODE TOGGLE
     Toggle data-theme on <html>. Saves preference to localStorage.
     Respects prefers-color-scheme if no preference saved.
     ========================================================================== */

  const initThemeToggle = () => {
    const toggles = document.querySelectorAll('.theme-toggle');
    if (!toggles.length) return;

    const root = document.documentElement;
    const STORAGE_KEY = 'theme';

    const getSystemTheme = () =>
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    const applyTheme = (theme) => {
      root.setAttribute('data-theme', theme);
    };

    // Apply saved preference or system default
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      applyTheme(saved);
    }
    // If no saved preference, don't set data-theme — let CSS media query handle it

    toggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const current = root.getAttribute('data-theme') || getSystemTheme();
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
      });
    });
  };

  /* ==========================================================================
     10. BACK TO TOP BUTTON
     Show a fixed button after scrolling 300px. Smooth scroll to top on click.
     ========================================================================== */

  const initBackToTop = () => {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    const THRESHOLD = 300;

    const onScroll = () => {
      if (window.scrollY > THRESHOLD) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  /* ==========================================================================
     INITIALISE EVERYTHING
     ========================================================================== */

  initHeaderScroll();
  initMobileMenu();
  initActiveNavLink();
  initFaqAccordion();
  initSmoothScroll();
  initLazyLoad();
  initThemeToggle();
  initBackToTop();
});
