/* ============================================================
   ZAREE STUDIO — main.js
   Shared across all pages
   ============================================================ */

(function () {
  'use strict';

  /* ===== CURSOR ===== */
  const initCursor = () => {
    const cursor = document.querySelector('.cursor');
    const ring = document.querySelector('.cursor-ring');
    if (!cursor || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let animFrame;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top  = mouseY + 'px';
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      animFrame = requestAnimationFrame(animateRing);
    };
    animateRing();

    const hoverEls = document.querySelectorAll('a, button, [role="button"], .card, input, textarea, select, label');
    hoverEls.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor--hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor--hover'));
    });
  };

  /* ===== SCROLL PROGRESS ===== */
  const initScrollProgress = () => {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;

    const update = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = pct + '%';
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  /* ===== STICKY NAV ===== */
  const initStickyNav = () => {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;

    const update = () => {
      nav.classList.toggle('site-nav--scrolled', window.scrollY > 60);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  /* ===== MOBILE NAV TOGGLE ===== */
  const initMobileNav = () => {
    const toggle = document.querySelector('.site-nav__toggle');
    const links  = document.querySelector('.site-nav__links');
    if (!toggle || !links) return;

    const open = () => {
      links.classList.add('site-nav__links--open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      links.classList.remove('site-nav__links--open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? close() : open();
    });

    // Close on link click
    links.querySelectorAll('.site-nav__link').forEach((link) => {
      link.addEventListener('click', close);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  };

  /* ===== SCROLL REVEAL ===== */
  const initScrollReveal = () => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => observer.observe(el));
  };

  /* ===== HERO STACKED SCROLL EFFECT ===== */
  const initHeroScroll = () => {
    const driver = document.querySelector('.hero-scroll-driver');
    const pin    = document.querySelector('.hero-scroll-pin');
    if (!driver || !pin) return;

    const letters  = pin.querySelectorAll('.hero-letter');
    const captions = pin.querySelectorAll('.hero-caption');
    const scrollIndicator = pin.querySelector('.hero__scroll-indicator');
    const numLetters = letters.length;

    const update = () => {
      const rect    = driver.getBoundingClientRect();
      const total   = driver.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / total));

      // Hide scroll indicator after first nudge
      if (scrollIndicator) {
        scrollIndicator.style.opacity = progress > 0.04 ? '0' : '1';
      }

      // Activate one letter per band
      for (let i = 0; i < numLetters; i++) {
        const lo = (i / numLetters) * 0.88;
        const hi = ((i + 1) / numLetters) * 0.88;

        const letter  = letters[i];
        const caption = captions[i];
        const active  = progress >= lo && progress < hi;
        const past    = progress >= hi;

        letter.classList.toggle('hero-letter--active', active);
        letter.classList.toggle('hero-letter--past',   past && !active);

        if (active) {
          const band = (progress - lo) / (hi - lo);
          const shadowY    = Math.round(band * 24);
          const shadowBlur = Math.round(band * 50);
          const shadowAlpha = (0.15 + band * 0.3).toFixed(2);
          letter.style.textShadow = `0 ${shadowY}px ${shadowBlur}px rgba(0,201,167,${shadowAlpha}), 0 0 40px rgba(0,201,167,0.45)`;
          letter.style.transform  = `translateY(${-band * 6}px)`;
        } else {
          letter.style.textShadow = '';
          letter.style.transform  = '';
        }

        if (caption) {
          caption.classList.toggle('hero-caption--visible', active);
        }
      }

      // Past all letters — reset (winding down)
      if (progress >= 0.9) {
        letters.forEach((l) => {
          l.classList.remove('hero-letter--active', 'hero-letter--past');
          l.style.textShadow = '';
          l.style.transform  = '';
        });
        captions.forEach((c) => c.classList.remove('hero-caption--visible'));
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  /* ===== SERVICES ACCORDION ===== */
  const initAccordion = () => {
    const items = document.querySelectorAll('.accordion__item');
    if (!items.length) return;

    items.forEach((item) => {
      const trigger = item.querySelector('.accordion__trigger');
      const body    = item.querySelector('.accordion__body');
      if (!trigger || !body) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('accordion__item--open');

        // Close all
        items.forEach((i) => {
          i.classList.remove('accordion__item--open');
          i.querySelector('.accordion__trigger')?.setAttribute('aria-expanded', 'false');
          const b = i.querySelector('.accordion__body');
          if (b) b.style.maxHeight = '0';
        });

        // Open clicked if it was closed
        if (!isOpen) {
          item.classList.add('accordion__item--open');
          trigger.setAttribute('aria-expanded', 'true');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });

      // Init closed
      trigger.setAttribute('aria-expanded', 'false');
      body.style.maxHeight = '0';
      body.style.overflow  = 'hidden';
      body.style.transition = 'max-height 0.4s cubic-bezier(0.16,1,0.3,1)';
    });
  };

  /* ===== WORK FILTER (projects page) ===== */
  const initWorkFilter = () => {
    const filters = document.querySelectorAll('.work-filter__btn');
    const cards   = document.querySelectorAll('.work-card');
    if (!filters.length || !cards.length) return;

    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter;

        filters.forEach((b) => {
          b.classList.remove('work-filter__btn--active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('work-filter__btn--active');
        btn.setAttribute('aria-pressed', 'true');

        cards.forEach((card) => {
          const show = cat === 'all' || card.dataset.category === cat;
          card.style.opacity   = show ? '1' : '0.25';
          card.style.transform = show ? 'scale(1)' : 'scale(0.97)';
          card.style.pointerEvents = show ? 'auto' : 'none';
          card.setAttribute('aria-hidden', show ? 'false' : 'true');
        });
      });
    });
  };

  /* ===== FORM VALIDATION (contact/start page) ===== */
  const initFormValidation = () => {
    const form = document.querySelector('.project-form');
    if (!form) return;

    const showError = (input, msg) => {
      const field = input.closest('.form-field');
      if (!field) return;
      let err = field.querySelector('.form-field__error');
      if (!err) {
        err = document.createElement('span');
        err.className = 'form-field__error';
        err.setAttribute('role', 'alert');
        field.appendChild(err);
      }
      err.textContent = msg;
      input.setAttribute('aria-invalid', 'true');
    };

    const clearError = (input) => {
      const field = input.closest('.form-field');
      if (!field) return;
      const err = field.querySelector('.form-field__error');
      if (err) err.textContent = '';
      input.setAttribute('aria-invalid', 'false');
    };

    form.querySelectorAll('input, textarea, select').forEach((input) => {
      input.addEventListener('input', () => clearError(input));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('[required]').forEach((input) => {
        if (!input.value.trim()) {
          showError(input, 'This field is required.');
          valid = false;
        } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
          showError(input, 'Please enter a valid email.');
          valid = false;
        }
      });

      if (valid) {
        const btn = form.querySelector('[type="submit"]');
        if (btn) {
          btn.textContent = 'Sent ✓';
          btn.disabled = true;
        }
        // TODO: wire to Formspree / Netlify forms / email service
      }
    });
  };

  /* ===== INIT ALL ===== */
  const init = () => {
    initCursor();
    initScrollProgress();
    initStickyNav();
    initMobileNav();
    initScrollReveal();
    initHeroScroll();
    initAccordion();
    initWorkFilter();
    initFormValidation();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();