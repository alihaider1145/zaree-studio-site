/* ============================================================
   ZAREE STUDIO — main.js
   All interactivity for index.html, projects.html, contact.html
   Vanilla JS, no dependencies.
   ============================================================ */

(function () {
  'use strict';

  /* ── 2. STICKY NAV ── */
  const header = document.getElementById('siteHeader');

  if (header) {
    function handleNavScroll() {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll(); // run on load
  }

  /* ── 3. MOBILE MENU ── */
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuClose = document.getElementById('mobileMenuClose');

  function openMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    menuClose && menuClose.focus();
  }

  function closeMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger && hamburger.addEventListener('click', openMenu);
  menuClose && menuClose.addEventListener('click', closeMenu);

  // Close on mobile link click
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  /* ── 4. SMOOTH SCROLL for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 5. INTERSECTION OBSERVER — fade in on scroll ── */
  const fadeEls = document.querySelectorAll('.js-fade, .js-slide-left, .js-slide-right');

  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately if IntersectionObserver not supported
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ── 6. CONTACT FORM — async Formspree submit ── */
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');
  const submitBtn = document.getElementById('submitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Basic JS validation
      const name = contactForm.querySelector('[name="name"]');
      const need = contactForm.querySelector('[name="need"]');

      if (!name || !name.value.trim()) {
        showFormMessage('error', 'Please enter your name.');
        name && name.focus();
        return;
      }

      if (!need || !need.value.trim()) {
        showFormMessage('error', 'Please tell us what you need the site to do.');
        need && need.focus();
        return;
      }

      // Disable button during submit
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      try {
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          contactForm.reset();
          showFormMessage('success', 'Sent! I\'ll be in touch within 24 hours.');
        } else {
          const data = await response.json().catch(function () { return {}; });
          const msg =
            data && data.errors
              ? data.errors.map(function (err) { return err.message; }).join(', ')
              : 'Something went wrong — try again or WhatsApp me directly.';
          showFormMessage('error', msg);
        }
      } catch (err) {
        showFormMessage('error', 'Something went wrong — try again or WhatsApp me directly.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send message →';
        }
      }
    });
  }

  function showFormMessage(type, text) {
    if (!formMessage) return;
    formMessage.className = 'form-message ' + type;
    formMessage.textContent = text;
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

})();