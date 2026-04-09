/* ============================================================
   ZAREE STUDIO — main.js
   Shared across all pages
   ============================================================ */

(function () {
  'use strict';

  /* ===== SECURITY UTIL ===== */
  // Coerces a value to a finite number; returns fallback if not.
  // Prevents any non-numeric value from reaching style/attribute sinks.
  const safeNum = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : (fallback !== undefined ? fallback : 0);
  };

  /* ===== CURSOR ===== */
  const initCursor = () => {
    const cursor = document.querySelector('.cursor');
    const ring = document.querySelector('.cursor-ring');
    if (!cursor || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let animFrame;

    document.addEventListener('mousemove', (e) => {
      mouseX = safeNum(e.clientX);
      mouseY = safeNum(e.clientY);
      cursor.style.left = mouseX + 'px';
      cursor.style.top  = mouseY + 'px';
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = safeNum(ringX) + 'px';
      ring.style.top  = safeNum(ringY) + 'px';
      animFrame = requestAnimationFrame(animateRing);
    };
    animateRing();

    const hoverEls = document.querySelectorAll('a, button, [role="button"], .card, input, textarea, select, label');
    hoverEls.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor--hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor--hover'));
    });
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

    // Inject logo clone into mobile overlay (DRY — avoids editing every HTML file)
    const logoEl = document.querySelector('.site-nav__logo');
    if (logoEl) {
      const mobileLogoLink = logoEl.cloneNode(true);
      mobileLogoLink.classList.add('site-nav__links-logo');
      links.insertBefore(mobileLogoLink, links.firstChild);
    }

    // Close on link click
    links.querySelectorAll('a').forEach((link) => {
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
  // Letters animate via wheel/touch delta — scroll is locked until all 5 light up.
  // This replaces the old scroll-driver (400vh) approach; the driver is now 100vh.
  const initHeroScroll = () => {
    const pin = document.querySelector('.hero-scroll-pin');
    if (!pin) return;

    const letters         = pin.querySelectorAll('.hero-letter');
    const captions        = pin.querySelectorAll('.hero-caption');
    const scrollIndicator = pin.querySelector('.hero__scroll-indicator');
    const numLetters      = letters.length;
    if (!numLetters) return;

    let progress   = 0;
    let accumDelta = 0;
    let touchLastY = 0;
    const DELTA_TOTAL = 450; // total scroll-delta (px) to complete all letters

    const getDeltaY = (e) => {
      if (e.deltaMode === 1) return safeNum(e.deltaY) * 16;  // line mode
      if (e.deltaMode === 2) return safeNum(e.deltaY) * 100; // page mode
      return safeNum(e.deltaY);
    };

    const applyProgress = (p) => {
      progress = Math.max(0, Math.min(1, p));

      if (scrollIndicator) {
        scrollIndicator.style.opacity = progress > 0.04 ? '0' : '1';
      }

      for (let i = 0; i < numLetters; i++) {
        const lo      = i / numLetters;
        const hi      = (i + 1) / numLetters;
        const active  = progress >= lo && progress < hi;
        const past    = progress >= hi;
        const letter  = letters[i];
        const caption = captions[i];

        letter.classList.toggle('hero-letter--active', active);
        letter.classList.toggle('hero-letter--past',   past && !active);

        if (active) {
          const band       = Math.max(0, Math.min(1, (progress - lo) / (hi - lo)));
          const shadowY    = Math.round(safeNum(band) * 24);
          const shadowBlur = Math.round(safeNum(band) * 50);
          const alpha      = Math.min(0.45, Math.max(0, 0.15 + safeNum(band) * 0.3)).toFixed(2);
          const ty         = Math.min(0, -(safeNum(band) * 6));
          letter.style.textShadow = `0 ${shadowY}px ${shadowBlur}px rgba(0,201,167,${alpha}), 0 0 40px rgba(0,201,167,0.45)`;
          letter.style.transform  = `translateY(${ty}px)`;
        } else {
          letter.style.textShadow = '';
          letter.style.transform  = '';
        }

        if (caption) caption.classList.toggle('hero-caption--visible', active);
      }

      // Past all letters — reset styling
      if (progress >= 1) {
        letters.forEach((l) => {
          l.classList.remove('hero-letter--active', 'hero-letter--past');
          l.style.textShadow = '';
          l.style.transform  = '';
        });
        captions.forEach((c) => c.classList.remove('hero-caption--visible'));
      }
    };

    const onWheel = (e) => {
      if (window.scrollY > 0 || progress >= 1) return; // not at top, or already done
      e.preventDefault();
      accumDelta = Math.max(0, accumDelta + getDeltaY(e));
      applyProgress(accumDelta / DELTA_TOTAL);
    };

    const onTouchStart = (e) => {
      touchLastY = safeNum(e.touches[0]?.clientY);
    };

    const onTouchMove = (e) => {
      if (window.scrollY > 0 || progress >= 1) return;
      e.preventDefault();
      const dy   = touchLastY - safeNum(e.touches[0]?.clientY);
      touchLastY = safeNum(e.touches[0]?.clientY);
      accumDelta = Math.max(0, accumDelta + dy);
      applyProgress(accumDelta / DELTA_TOTAL);
    };

    window.addEventListener('wheel',      onWheel,      { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true  });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });

    applyProgress(0);
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
          body.style.maxHeight = safeNum(body.scrollHeight) + 'px';
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

    // Allowlist of valid filter values derived from the actual buttons in the DOM.
    // Any dataset value not in this set is treated as non-matching.
    const validFilters = new Set(['all']);
    filters.forEach((btn) => {
      const v = btn.dataset.filter;
      if (typeof v === 'string' && v.trim()) validFilters.add(v.trim());
    });

    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        const raw = btn.dataset.filter;
        const cat = (typeof raw === 'string' && validFilters.has(raw.trim())) ? raw.trim() : 'all';

        filters.forEach((b) => {
          b.classList.remove('work-filter__btn--active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('work-filter__btn--active');
        btn.setAttribute('aria-pressed', 'true');

        cards.forEach((card) => {
          const cardCat = typeof card.dataset.category === 'string' ? card.dataset.category.trim() : '';
          const show = cat === 'all' || cardCat === cat;
          card.style.opacity   = show ? '1' : '0.25';
          card.style.transform = show ? 'scale(1)' : 'scale(0.97)';
          card.style.pointerEvents = show ? 'auto' : 'none';
          card.setAttribute('aria-hidden', show ? 'false' : 'true');
        });

        // Update visible count label
        const countEl = document.querySelector('.filter-bar__count');
        if (countEl) {
          const visible = cat === 'all'
            ? cards.length
            : [...cards].filter((c) => c.dataset.category === cat).length;
          countEl.textContent = visible + (visible === 1 ? ' project' : ' projects');
        }
      });
    });

    // Init count
    const initCount = document.querySelector('.filter-bar__count');
    if (initCount) initCount.textContent = cards.length + ' projects';
  };

  /* ===== FORM VALIDATION (contact/start page) ===== */
  const initFormValidation = () => {
    const form = document.querySelector('.project-form');
    if (!form) return;

    // Hardcoded error messages — never derived from user input
    const MSG_REQUIRED = 'This field is required.';
    const MSG_EMAIL    = 'Please enter a valid email.';

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
      // textContent is safe — never innerHTML
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
          showError(input, MSG_REQUIRED);
          valid = false;
        } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
          showError(input, MSG_EMAIL);
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

  /* ===== PROJECT FORM (start.html multi-step) ===== */
  const initProjectForm = () => {
    const formEl = document.getElementById('project-form');
    if (!formEl) return;

    const TOTAL_STEPS = 3;
    let currentStep = 1;

    const screens = [null,
      document.getElementById('screen-1'),
      document.getElementById('screen-2'),
      document.getElementById('screen-3'),
    ];
    const indicators = [null,
      document.getElementById('step-ind-1'),
      document.getElementById('step-ind-2'),
      document.getElementById('step-ind-3'),
    ];
    const progressFill = document.getElementById('form-progress-fill');
    const progressBar  = progressFill?.parentElement;
    const stepNumEl    = document.getElementById('current-step-num');
    const successEl    = document.getElementById('form-success');

    const goToStep = (step) => {
      screens.slice(1).forEach((s) => { if (s) s.classList.remove('is-active'); });

      indicators.slice(1).forEach((ind, i) => {
        if (!ind) return;
        const n = i + 1;
        ind.classList.remove('is-active', 'is-done');
        if (n < step)  ind.classList.add('is-done');
        if (n === step) ind.classList.add('is-active');
        const dot = ind.querySelector('.form-step-indicator__dot');
        if (dot) {
          dot.textContent = n < step ? '✓' : String(n);
          dot.setAttribute('aria-current', n === step ? 'step' : 'false');
        }
      });

      if (screens[step]) {
        screens[step].classList.add('is-active');
        const firstInput = screens[step].querySelector('input, textarea, select');
        if (firstInput) setTimeout(() => firstInput.focus(), 80);
      }

      const pct = Math.round((step / TOTAL_STEPS) * 100);
      if (progressFill) progressFill.style.width = pct + '%';
      if (progressBar)  progressBar.setAttribute('aria-valuenow', pct);
      if (stepNumEl)    stepNumEl.textContent = step;
      currentStep = step;
    };

    const validateScreen = (step) => {
      let valid = true;

      if (step === 1) {
        screens[1].querySelectorAll('[required]').forEach((input) => {
          const err = input.parentElement.querySelector('.form-field__error');
          if (!input.value.trim()) {
            if (err) err.textContent = 'This field is required.';
            input.setAttribute('aria-invalid', 'true');
            valid = false;
          } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
            if (err) err.textContent = 'Please enter a valid email.';
            input.setAttribute('aria-invalid', 'true');
            valid = false;
          } else {
            if (err) err.textContent = '';
            input.setAttribute('aria-invalid', 'false');
          }
        });
      }

      if (step === 2) {
        const nicheSelected = screens[2].querySelector('input[name="niche"]:checked');
        const nicheErr      = document.getElementById('niche-error');
        const descInput     = document.getElementById('project-desc');
        const descErr       = descInput?.parentElement.querySelector('.form-field__error');

        if (!nicheSelected) {
          if (nicheErr) nicheErr.textContent = 'Please select one option.';
          valid = false;
        } else {
          if (nicheErr) nicheErr.textContent = '';
        }

        if (descInput && !descInput.value.trim()) {
          if (descErr) descErr.textContent = 'This field is required.';
          descInput.setAttribute('aria-invalid', 'true');
          valid = false;
        } else if (descInput) {
          if (descErr) descErr.textContent = '';
          descInput.setAttribute('aria-invalid', 'false');
        }
      }

      if (step === 3) {
        const budgetSelected = screens[3].querySelector('input[name="budget"]:checked');
        const budgetErr      = document.getElementById('budget-error');
        if (!budgetSelected) {
          if (budgetErr) budgetErr.textContent = 'Please select a budget range.';
          valid = false;
        } else {
          if (budgetErr) budgetErr.textContent = '';
        }
      }

      return valid;
    };

    const next1 = document.getElementById('next-1');
    const next2 = document.getElementById('next-2');
    const back2 = document.getElementById('back-2');
    const back3 = document.getElementById('back-3');

    next1?.addEventListener('click', () => { if (validateScreen(1)) goToStep(2); });
    next2?.addEventListener('click', () => { if (validateScreen(2)) goToStep(3); });
    back2?.addEventListener('click', () => goToStep(1));
    back3?.addEventListener('click', () => goToStep(2));

    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateScreen(3)) return;

      const submitBtn = document.getElementById('submit-btn');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      try {
        const response = await fetch('https://formspree.io/f/mwvwabwq', {
          method: 'POST',
          body: new FormData(formEl),
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) throw new Error('Network response was not ok');

        if (formEl)    formEl.style.display = 'none';
        if (successEl) successEl.classList.add('is-visible');
        const stepCountEl = document.querySelector('.start-form-panel__heading');
        if (stepCountEl) stepCountEl.style.display = 'none';
        const stepsEl = document.querySelector('.form-steps');
        if (stepsEl)   stepsEl.style.display = 'none';
        const progressEl = document.querySelector('.form-progress');
        if (progressEl) progressEl.style.display = 'none';
        const successHead = successEl?.querySelector('.form-success__heading');
        if (successHead) setTimeout(() => successHead.focus(), 100);

      } catch (err) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send brief →'; }
        const budgetErr = document.getElementById('budget-error');
        if (budgetErr) budgetErr.textContent = 'Something went wrong. Please try again or email us directly.';
      }
    });

    // Init to step 1
    goToStep(1);
  };

  /* ===== INIT ALL ===== */
  const init = () => {
    initCursor();
    initMobileNav();
    initScrollReveal();
    initHeroScroll();
    initAccordion();
    initWorkFilter();
    initFormValidation();
    initProjectForm();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();