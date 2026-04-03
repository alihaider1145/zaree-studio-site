(function () {
  'use strict';
 /* ===== SCROLL PROGRESS INDICATOR ===== */
  const initScrollProgress = () => {
  const bar = document.querySelector('#scroll-progress');
  const projects = document.querySelector('.projects-preview');
  if (!bar || !projects) return;

  const updateProgress = () => {
    const sectionTop = projects.offsetTop;
    const sectionHeight = projects.offsetHeight;
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;

    const scrolledIntoSection = scrollTop - sectionTop;
    const scrollableDistance = sectionHeight - windowHeight;
    const pct = Math.min(Math.max((scrolledIntoSection / scrollableDistance) * 100, 0), 100);

    if (scrollTop < sectionTop || scrollTop > sectionTop + sectionHeight) {
      bar.style.height = '0%';
    } else {
      bar.style.height = pct + '%';
    }
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
};

  /* ===== STICKY NAV ===== */
  const initStickyNav = () => {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  };

  /* ===== MOBILE NAV TOGGLE ===== */
  const initMobileNav = () => {
    const hamburger = document.querySelector('.nav-hamburger');
    const mobileMenu = document.querySelector('.nav-mobile');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', false);
      });
    });
  };

  /* ===== SERVICES ACCORDION ===== */
  const initAccordion = () => {
    const items = document.querySelectorAll('.accordion-item');
    if (!items.length) return;

    items.forEach(item => {
      const trigger = item.querySelector('.accordion-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all
        items.forEach(i => i.classList.remove('open'));

        // Open clicked if it was closed
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });
  };

  /* ===== TESTIMONIAL CAROUSEL ===== */
  const initCarousel = () => {
    const track = document.querySelector('.testimonial-track');
    const dots = document.querySelectorAll('.carousel-dot');
    const btnPrev = document.querySelector('.carousel-prev');
    const btnNext = document.querySelector('.carousel-next');
    if (!track) return;

    let current = 0;
    const cards = track.querySelectorAll('.testimonial-card');
    const total = cards.length;

    const goTo = (index) => {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    };

    btnPrev?.addEventListener('click', () => goTo(current - 1));
    btnNext?.addEventListener('click', () => goTo(current + 1));

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });

    // Auto-advance every 5s
    let timer = setInterval(() => goTo(current + 1), 5000);

    track.parentElement.addEventListener('mouseenter', () => clearInterval(timer));
    track.parentElement.addEventListener('mouseleave', () => {
      timer = setInterval(() => goTo(current + 1), 5000);
    });

    // Touch swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    });

    goTo(0);
  };

  /* ===== CONTACT FORM ===== */
  const initContactForm = () => {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('.btn-submit');

    const setStatus = (msg, type) => {
      statusEl.textContent = msg;
      statusEl.className = `form-status ${type}`;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      setStatus('Sending…', '');

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          setStatus("Message sent! I'll be in touch soon.", 'success');
          form.reset();
        } else {
          setStatus('Something went wrong — please try again.', 'error');
        }
      } catch {
        setStatus('Network error — please try again.', 'error');
      } finally {
        submitBtn.disabled = false;
      }
    });
  };

  /* ===== INIT ===== */
  document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initStickyNav();
    initMobileNav();
    initAccordion();
    initCarousel();
    initContactForm();
  });

})();