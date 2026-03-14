/**
 * animations.js
 * -------------
 * GSAP + ScrollTrigger animations for Maxime BILLE - Webdesigner Freelance
 *
 * Sections:
 *   0. Reduced-motion guard
 *   1. Register plugins & shared defaults
 *   2. Generic reveal animations (.reveal, .reveal-left, .reveal-right)
 *   3. Hero section staggered entrance
 *   4. Hero stat counter (GSAP snap)
 *   5. Pricing cards stagger
 *   6. Process steps stagger
 *   7. Trust badges stagger
 *   8. Hero glow parallax
 *
 * Performance notes:
 *   - Only transform and opacity are animated (GPU-composited properties).
 *   - will-change is set via GSAP's internal handling; no manual additions.
 *   - Every ScrollTrigger uses `once: true` where appropriate to free
 *     resources after the animation has played.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     0. REDUCED-MOTION GUARD
     If the user prefers reduced motion, make every .reveal element visible
     immediately and skip all GSAP animations.
     ========================================================================== */

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right'
    ).forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    // Nothing else to do -- bail out entirely
    return;
  }

  /* ==========================================================================
     1. REGISTER PLUGINS & SHARED DEFAULTS
     ========================================================================== */

  // Safety check: make sure GSAP is available
  if (typeof gsap === 'undefined') {
    console.warn('[animations.js] GSAP not found. Skipping animations.');
    return;
  }

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  } else {
    console.warn('[animations.js] ScrollTrigger plugin not found. Skipping scroll-based animations.');
    return;
  }

  // Shared defaults for clean, consistent easing
  const EASE       = 'power3.out';
  const DURATION   = 0.8;
  const STAGGER    = 0.15;
  const TRIGGER_AT = 'top 85%';

  /* ==========================================================================
     2. GENERIC REVEAL ANIMATIONS
     .reveal       -- fade in + slide up
     .reveal-left  -- fade in + slide from left
     .reveal-right -- fade in + slide from right
     ========================================================================== */

  // --- Helper: sépare éléments au-dessus / en-dessous du fold ---
  function splitByFold(elements) {
    const fold = window.innerHeight;
    const above = [];
    const below = [];
    elements.forEach(el => {
      if (el.getBoundingClientRect().top < fold) {
        above.push(el);
      } else {
        below.push(el);
      }
    });
    return { above, below };
  }

  // --- .reveal (fade up) ---
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length) {
    const { above, below } = splitByFold(revealElements);

    // Au-dessus du fold → visible immédiatement, pas d'animation
    above.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });

    // En-dessous du fold → animer au scroll
    if (below.length) {
      gsap.set(below, { opacity: 0, y: 40 });
      ScrollTrigger.batch(below, {
        onEnter: (batch) => {
          gsap.to(batch, { opacity: 1, y: 0, duration: DURATION, ease: EASE, stagger: STAGGER });
        },
        start: TRIGGER_AT,
        once: true,
      });
    }
  }

  // --- .reveal-left (fade from left) ---
  const revealLeftElements = document.querySelectorAll('.reveal-left');
  if (revealLeftElements.length) {
    const { above, below } = splitByFold(revealLeftElements);
    above.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });

    if (below.length) {
      gsap.set(below, { opacity: 0, x: -60 });
      ScrollTrigger.batch(below, {
        onEnter: (batch) => {
          gsap.to(batch, { opacity: 1, x: 0, duration: DURATION, ease: EASE, stagger: STAGGER });
        },
        start: TRIGGER_AT,
        once: true,
      });
    }
  }

  // --- .reveal-right (fade from right) ---
  const revealRightElements = document.querySelectorAll('.reveal-right');
  if (revealRightElements.length) {
    const { above, below } = splitByFold(revealRightElements);
    above.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });

    if (below.length) {
      gsap.set(below, { opacity: 0, x: 60 });
      ScrollTrigger.batch(below, {
        onEnter: (batch) => {
          gsap.to(batch, { opacity: 1, x: 0, duration: DURATION, ease: EASE, stagger: STAGGER });
        },
        start: TRIGGER_AT,
        once: true,
      });
    }
  }

/* ==========================================================================
     4. HERO STAT COUNTER (GSAP + SNAP)
     Uses gsap.to with a proxy object and snap to count up to the target
     integer. The counter only fires once when scrolled into view.
     ========================================================================== */

  const initGsapCounters = () => {
    const statNumbers = document.querySelectorAll('.hero__stat-number');
    if (!statNumbers.length) return;

    statNumbers.forEach((el) => {
      const rawText = el.textContent.trim();
      const match   = rawText.match(/(\d+)/);
      if (!match) return;

      const target = parseInt(match[1], 10);
      if (target === 0) return;

      // Preserve prefix / suffix (e.g. "+" or "%")
      const prefix = rawText.match(/^([^\d]*)/)?.[1] || '';
      const suffix = rawText.match(/(\D*)$/)?.[1] || '';

      // Proxy object that GSAP can tween
      const counter = { value: 0 };

      gsap.to(counter, {
        value: target,
        duration: 2,
        ease: 'power2.out',
        snap: { value: 1 },           // Round to whole numbers each frame
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(counter.value)}${suffix}`;
        },
      });
    });
  };

  initGsapCounters();

  /* ==========================================================================
     5. PRICING CARDS STAGGER
     ========================================================================== */

  const initPricingCards = () => {
    const cards = document.querySelectorAll('.pricing-card');
    if (!cards.length) return;

    const { above, below } = splitByFold(Array.from(cards));
    above.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });

    if (below.length) {
      gsap.set(below, { opacity: 0, y: 50 });
      ScrollTrigger.batch(below, {
        onEnter: (batch) => {
          gsap.to(batch, { opacity: 1, y: 0, duration: DURATION, ease: EASE, stagger: STAGGER });
        },
        start: TRIGGER_AT,
        once: true,
      });
    }
  };

  initPricingCards();

  /* ==========================================================================
     6. PROCESS STEPS STAGGER
     ========================================================================== */

  const initProcessSteps = () => {
    const steps = document.querySelectorAll('.process__step');
    if (!steps.length) return;

    const { above, below } = splitByFold(Array.from(steps));
    above.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });

    if (below.length) {
      gsap.set(below, { opacity: 0, y: 40 });
      ScrollTrigger.batch(below, {
        onEnter: (batch) => {
          gsap.to(batch, { opacity: 1, y: 0, duration: DURATION, ease: EASE, stagger: 0.2 });
        },
        start: TRIGGER_AT,
        once: true,
      });
    }
  };

  initProcessSteps();

  /* ==========================================================================
     7. HERO GLOW PARALLAX
     Slight vertical movement of the decorative glow element as the user
     scrolls, creating a subtle depth/parallax effect.
     ========================================================================== */

  const initHeroParallax = () => {
    const glow = document.querySelector('.hero__glow');
    if (!glow) return;

    gsap.to(glow, {
      y: 80,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,        // Smooth parallax with slight lag for natural feel
      },
    });
  };

  initHeroParallax();
});
