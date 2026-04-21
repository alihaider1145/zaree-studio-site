(function () {
  'use strict';

  /* =========================================================
     UTILITIES
  ========================================================= */

  /**
   * Returns scroll progress (0–1) of a tall scroll-driver container.
   * progress = 0 when top of container hits viewport top,
   * progress = 1 when bottom of container hits viewport bottom.
   */
  const getProgress = (container) => {
    const rect = container.getBoundingClientRect();
    const scrolled = -rect.top;
    const total = rect.height - window.innerHeight;
    return Math.min(Math.max(scrolled / total, 0), 1);
  };

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

  /* =========================================================
     NAV — STICKY CLASS + HAMBURGER TOGGLE
  ========================================================= */
  const initNav = () => {
    const nav        = document.getElementById('nav');
    const hamburger  = document.querySelector('.nav__hamburger');
    const mobileMenu = document.getElementById('nav-mobile');

    if (!nav) return;

    // Sticky scroll class
    window.addEventListener('scroll', onScroll(() => {
      if (window.scrollY > 60) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
    })(), { passive: true });

    // Hamburger toggle
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('is-open');
        hamburger.setAttribute('aria-expanded', String(isOpen));
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target)) {
          mobileMenu.classList.remove('is-open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });

      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          mobileMenu.classList.remove('is-open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  };

  /* =========================================================
     SCROLL REVEAL — IntersectionObserver
  ========================================================= */
  const initScrollReveal = () => {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    // Respect prefers-reduced-motion
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
     SEARCH SWAP — index.html Section 02
  ========================================================= */
  const initSearchSwap = () => {
    const container = document.getElementById('search-swap-section');
    if (!container) return;

    const stage0      = document.getElementById('ss-stage-0');
    const stageT      = document.getElementById('ss-stage-transition');
    const stage1      = document.getElementById('ss-stage-1');

    if (!stage0 || !stageT || !stage1) return;

    let currentStage = 'stage0';

    const setStage = (id) => {
      if (currentStage === id) return;
      currentStage = id;

      [stage0, stageT, stage1].forEach(el => el.classList.remove('is-active'));

      if (id === 'stage0')      stage0.classList.add('is-active');
      else if (id === 'transition') stageT.classList.add('is-active');
      else if (id === 'stage1') stage1.classList.add('is-active');
    };

    const update = () => {
      const p = getProgress(container);

      if (p < 0.33)       setStage('stage0');
      else if (p < 0.50)  setStage('transition');
      else                setStage('stage1');
    };

    window.addEventListener('scroll', onScroll(update), { passive: true });
    update();
  };

  /* =========================================================
     DEV LOG — index.html Section 03
  ========================================================= */
  const initDevLog = () => {
    const container = document.getElementById('devlog-section');
    if (!container) return;

    const stages = [
      document.getElementById('dl-stage-0'),
      document.getElementById('dl-stage-1'),
      document.getElementById('dl-stage-2'),
      document.getElementById('dl-stage-3'),
      document.getElementById('dl-stage-4'),
    ];

    if (stages.some(s => !s)) return;

    // Elements that animate when their stage becomes active
    const checkItems    = document.querySelectorAll('#dl-stage-1 .devlog-checklist__item');
    const techBoxMaps   = document.getElementById('tech-box-maps');
    const techBoxDomain = document.getElementById('tech-box-domain');
    const chatBubble    = document.getElementById('chat-bubble');
    const projectDone   = document.getElementById('project-complete');

    let activeStageIndex = 0;

    const activateStage = (index) => {
      if (activeStageIndex === index) return;
      activeStageIndex = index;

      stages.forEach((s, i) => {
        if (i === index) {
          s.classList.add('is-active');
        } else {
          s.classList.remove('is-active');
        }
      });

      // Trigger stage-specific sub-animations
      if (index === 1) triggerChecklist();
      if (index === 3) triggerTechBoxes();
      if (index === 4) triggerHandover();
    };

    const triggerChecklist = () => {
      checkItems.forEach(item => item.classList.add('is-visible'));
    };

    const triggerTechBoxes = () => {
      if (techBoxMaps)   techBoxMaps.classList.add('is-visible');
      if (techBoxDomain) {
        setTimeout(() => techBoxDomain.classList.add('is-visible'), 180);
      }
    };

    const triggerHandover = () => {
      if (chatBubble)  chatBubble.classList.add('is-visible');
      if (projectDone) {
        setTimeout(() => projectDone.classList.add('is-visible'), 350);
      }
    };

    // Map progress ranges to stage indices
    const BREAKPOINTS = [0.15, 0.35, 0.55, 0.75];

    const update = () => {
      const p = getProgress(container);

      let stageIndex = 0;
      if (p >= BREAKPOINTS[3])      stageIndex = 4;
      else if (p >= BREAKPOINTS[2]) stageIndex = 3;
      else if (p >= BREAKPOINTS[1]) stageIndex = 2;
      else if (p >= BREAKPOINTS[0]) stageIndex = 1;

      activateStage(stageIndex);
    };

    window.addEventListener('scroll', onScroll(update), { passive: true });
    update();
  };

  /* =========================================================
     STREET SCENE — food.html Section 02
  ========================================================= */
  const initStreetScene = () => {
    const container = document.getElementById('street-section');
    if (!container) return;

    const stage0 = document.getElementById('st-stage-0');
    const stage1 = document.getElementById('st-stage-1');

    if (!stage0 || !stage1) return;

    let currentStage = 'stage0';

    const setStage = (id) => {
      if (currentStage === id) return;
      currentStage = id;

      [stage0, stage1].forEach(el => el.classList.remove('is-active'));

      if (id === 'stage0') stage0.classList.add('is-active');
      else                 stage1.classList.add('is-active');
    };

    const update = () => {
      const p = getProgress(container);
      setStage(p < 0.5 ? 'stage0' : 'stage1');
    };

    window.addEventListener('scroll', onScroll(update), { passive: true });
    update();
  };

  /* =========================================================
     MULTI-STEP FORM — start.html
  ========================================================= */
  const initMultiStepForm = () => {
    const step1El  = document.getElementById('step-1');
    const step2El  = document.getElementById('step-2');
    const step3El  = document.getElementById('step-3');
    const successEl = document.getElementById('form-success');

    if (!step1El || !step2El || !step3El) return;

    const dots = document.querySelectorAll('.form-step__dot');

    // ── Step tracking ──
    const updateDots = (currentStep) => {
      dots.forEach((dot, i) => {
        dot.classList.remove('is-current', 'is-done');
        const stepNum = i + 1;
        if (stepNum < currentStep)  dot.classList.add('is-done');
        if (stepNum === currentStep) dot.classList.add('is-current');
      });
    };

    const showStep = (stepEl, stepNum) => {
      [step1El, step2El, step3El].forEach(s => s.classList.remove('is-active'));
      stepEl.classList.add('is-active');
      updateDots(stepNum);
      stepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // ── Field validation helpers ──
    const validateField = (inputId, errorId, wrapId) => {
      const input = document.getElementById(inputId);
      const error = document.getElementById(errorId);
      const wrap  = wrapId ? document.getElementById(wrapId) : null;
      if (!input) return true;

      const val = input.value.trim();
      let valid = true;

      if (input.type === 'email') {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      } else {
        valid = val.length > 0;
      }

      if (!valid) {
        if (error)  error.hidden = false;
        if (wrap)   wrap.classList.add('form-field--error');
        input.setAttribute('aria-invalid', 'true');
      } else {
        if (error)  error.hidden = true;
        if (wrap)   wrap.classList.remove('form-field--error');
        input.setAttribute('aria-invalid', 'false');
      }

      return valid;
    };

    // ── Step 1 → 2 ──
    const step1Next = document.getElementById('step1-next');
    if (step1Next) {
      step1Next.addEventListener('click', () => {
        const a = validateField('firstname', 'err-firstname', 'field-firstname');
        const b = validateField('email',     'err-email',     'field-email');
        const c = validateField('business',  'err-business',  'field-business');
        if (a && b && c) showStep(step2El, 2);
      });
    }

    // ── Niche selector ──
    const nicheCards = document.querySelectorAll('.niche-card');
    const nicheValue = document.getElementById('niche-value');
    nicheCards.forEach(card => {
      card.addEventListener('click', () => {
        nicheCards.forEach(c => {
          c.classList.remove('is-selected');
          c.setAttribute('aria-pressed', 'false');
        });
        card.classList.add('is-selected');
        card.setAttribute('aria-pressed', 'true');
        if (nicheValue) nicheValue.value = card.dataset.niche;
      });
    });

    // ── Step 2 ──
    const step2Back = document.getElementById('step2-back');
    const step2Next = document.getElementById('step2-next');
    if (step2Back) step2Back.addEventListener('click', () => showStep(step1El, 1));
    if (step2Next) {
      step2Next.addEventListener('click', () => {
        const a = validateField('description', 'err-description', 'field-description');
        if (a) showStep(step3El, 3);
      });
    }

    // ── Currency pills ──
    const currencyPills = document.querySelectorAll('.currency-pill');
    const currencyValue = document.getElementById('currency-value');
    currencyPills.forEach(pill => {
      pill.addEventListener('click', () => {
        currencyPills.forEach(p => {
          p.classList.remove('is-selected');
          p.setAttribute('aria-pressed', 'false');
        });
        pill.classList.add('is-selected');
        pill.setAttribute('aria-pressed', 'true');
        if (currencyValue) currencyValue.value = pill.dataset.currency;
      });
    });

    // ── Budget cards ──
    const budgetCards = document.querySelectorAll('.budget-card');
    const budgetValue = document.getElementById('budget-value');
    budgetCards.forEach(card => {
      card.addEventListener('click', () => {
        budgetCards.forEach(c => {
          c.classList.remove('is-selected');
          c.setAttribute('aria-pressed', 'false');
        });
        card.classList.add('is-selected');
        card.setAttribute('aria-pressed', 'true');
        if (budgetValue) budgetValue.value = card.dataset.budget;
      });
    });

    // ── Step 3 back ──
    const step3Back = document.getElementById('step3-back');
    if (step3Back) step3Back.addEventListener('click', () => showStep(step2El, 2));

    // ── Submit to Formspree ──
    const submitBtn = document.getElementById('form-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        submitBtn.textContent = 'Sending...';
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.disabled = true;

        // Gather all form data
        const data = {
          firstname:     document.getElementById('firstname')?.value || '',
          lastname:      document.getElementById('lastname')?.value  || '',
          email:         document.getElementById('email')?.value     || '',
          instagram:     document.getElementById('instagram')?.value || '',
          business:      document.getElementById('business')?.value  || '',
          niche:         document.getElementById('niche-value')?.value   || '',
          description:   document.getElementById('description')?.value   || '',
          existing_site: document.getElementById('existing-site')?.value || '',
          currency:      document.getElementById('currency-value')?.value || '',
          budget:        document.getElementById('budget-value')?.value   || '',
          anything_else: document.getElementById('anything-else')?.value  || '',
        };

        try {
          const response = await fetch('https://formspree.io/f/mwvwabwq', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            // Hide form, show success
            const formContainer = document.querySelector('.form-container');
            if (formContainer) formContainer.style.display = 'none';
            if (successEl) successEl.classList.add('is-visible');
            successEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            submitBtn.textContent = 'Try again →';
            submitBtn.setAttribute('aria-busy', 'false');
            submitBtn.disabled = false;
          }
        } catch {
          submitBtn.textContent = 'Try again →';
          submitBtn.setAttribute('aria-busy', 'false');
          submitBtn.disabled = false;
        }
      });
    }
  };

  /* =========================================================
     INIT
  ========================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initScrollReveal();
    initSearchSwap();
    initDevLog();
    initStreetScene();
    initMultiStepForm();
  });

})();
