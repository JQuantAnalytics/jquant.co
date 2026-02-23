/* ============================================
   Jason T. Arnold — Landing Page Scripts
   Animations, nav, counters
   ============================================ */

(function () {
  'use strict';

  // --- Scroll-based nav styling ---
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function handleNavScroll() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 50);
    lastScroll = y;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // --- Mobile menu toggle ---
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Intersection Observer for reveal animations ---
  const animatedElements = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(() => el.classList.add('visible'), delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  animatedElements.forEach((el) => observer.observe(el));

  // --- Animated number counters ---
  const statNumbers = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((el) => counterObserver.observe(el));

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const start = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOutExpo(progress) * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // --- Parallax glow on mouse move (hero only, desktop) ---
  if (window.matchMedia('(min-width: 769px)').matches) {
    const hero = document.querySelector('.hero');
    const glow1 = document.querySelector('.hero-glow-1');
    const glow2 = document.querySelector('.hero-glow-2');

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      glow1.style.transform = `translate(${x * 30}px, ${y * 20}px) scale(1.05)`;
      glow2.style.transform = `translate(${x * -20}px, ${y * -15}px) scale(1.02)`;
    });
  }

  // --- Timeline accordion ---
  document.querySelectorAll('.timeline-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const detailsId = btn.getAttribute('aria-controls');
      const details = document.getElementById(detailsId);

      btn.setAttribute('aria-expanded', String(!expanded));
      details.classList.toggle('open', !expanded);
    });
  });

  // --- Active nav link highlighting ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function highlightNav() {
    const scrollY = window.scrollY + 120;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach((link) => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${id}`) {
            link.style.color = 'var(--text)';
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });
})();
