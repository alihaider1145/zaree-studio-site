(function () {
  'use strict';

  /* =========================================================
     UTILITIES
  ========================================================= */

  /** requestAnimationFrame throttle for scroll handlers */
  const onScroll = (callback) => {
    let ticking = false;
    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          callback();
          ticking = false;
        });
        ticking = true;
      }
    };
  };

  const formatGBP = (n) => '£' + Math.round(n).toLocaleString('en-GB');

  /* =========================================================
     NAV — STICKY BACKGROUND ON SCROLL
  ========================================================= */
  const initNav = () => {
    const nav = document.getElementById('nav');
    if (!nav) return;

    window.addEventListener('scroll', onScroll(() => {
      if (window.scrollY > 40) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
    })(), { passive: true });
  };

  /* =========================================================
     SCROLL REVEAL — IntersectionObserver
  ========================================================= */
  const initScrollReveal = () => {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(el => observer.observe(el));
  };

  /* =========================================================
     COMMISSION CALCULATOR
     Two sliders (monthly orders, avg order value) drive:
       — commission bleed (blended aggregator rate vs Zaree flat fee)
       — savings banner
     Present on both index.html (embedded) and calculator.html (full).
  ========================================================= */
  const BLENDED_COMMISSION_RATE = 0.35; // matches the 360-orders x £25 -> £3,150 example in the design
  const ZAREE_FLAT_FEE = 149;

  const initCalculator = () => {
    const root = document.querySelector('[data-calculator]');
    if (!root) return;

    const ordersSlider = root.querySelector('[data-calc="orders-slider"]');
    const ordersValue   = root.querySelector('[data-calc="orders-value"]');
    const aovSlider      = root.querySelector('[data-calc="aov-slider"]');
    const aovValue        = root.querySelector('[data-calc="aov-value"]');
    const bleedFigure     = root.querySelector('[data-calc="bleed-figure"]');
    const savingsBanner   = root.querySelector('[data-calc="savings-banner"]');

    if (!ordersSlider || !aovSlider) return;

    const update = () => {
      const orders = Number(ordersSlider.value);
      const aov = Number(aovSlider.value);
      const monthlyRevenue = orders * aov;
      const bleed = monthlyRevenue * BLENDED_COMMISSION_RATE;
      const savings = bleed - ZAREE_FLAT_FEE;

      if (ordersValue) ordersValue.textContent = `${orders} orders/month`;
      if (aovValue) aovValue.textContent = `£${aov}`;
      if (bleedFigure) bleedFigure.textContent = formatGBP(bleed);
      if (savingsBanner) {
        savingsBanner.textContent = savings > 0
          ? `You would save ${formatGBP(savings)} this month alone`
          : `Zaree Studios still costs less at this order volume`;
      }
    };

    ordersSlider.addEventListener('input', update);
    aovSlider.addEventListener('input', update);
    update();
  };

  /* =========================================================
     FAQ ACCORDION
     One open at a time. Clicking the open question closes it.
  ========================================================= */
  const initFaqAccordion = () => {
    const list = document.querySelector('[data-faq]');
    if (!list) return;

    const items = Array.from(list.querySelectorAll('.faq-item'));

    const closeItem = (item) => {
      const question = item.querySelector('.faq-item__question');
      item.classList.remove('is-open');
      if (question) question.setAttribute('aria-expanded', 'false');
    };

    const openItem = (item) => {
      const question = item.querySelector('.faq-item__question');
      item.classList.add('is-open');
      if (question) question.setAttribute('aria-expanded', 'true');
    };

    items.forEach((item) => {
      const question = item.querySelector('.faq-item__question');
      if (!question) return;

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        items.forEach((other) => {
          if (other !== item) closeItem(other);
        });

        if (isOpen) {
          closeItem(item);
        } else {
          openItem(item);
        }
      });
    });
  };

  /* =========================================================
     INIT
  ========================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initScrollReveal();
    initCalculator();
    initFaqAccordion();
  });

})();