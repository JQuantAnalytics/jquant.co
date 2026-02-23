/* ============================================
   Jason T. Arnold — Landing Page Scripts
   Animations, nav, counters, grid, theme
   ============================================ */

(function () {
  'use strict';

  // --- Theme toggle ---
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  function getStoredTheme() {
    return localStorage.getItem('theme');
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      themeBtn.querySelector('.theme-icon-sun').style.display = theme === 'dark' ? 'block' : 'none';
      themeBtn.querySelector('.theme-icon-moon').style.display = theme === 'dark' ? 'none' : 'block';
    }
  }

  const initialTheme = getStoredTheme() || (prefersDark.matches ? 'dark' : 'dark');
  applyTheme(initialTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

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

  // ============================================================
  // --- Interactive Canvas Grid ---
  // Lightweight dot-grid with mouse ripple + click explosion
  // ============================================================
  (function initGrid() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const SPACING = isMobile ? 48 : 40;
    const DOT_RADIUS = 1;
    const RIPPLE_RADIUS = isMobile ? 90 : 130;
    const RIPPLE_STRENGTH = isMobile ? 6 : 10;
    const EXPLODE_RADIUS = isMobile ? 110 : 160;
    const EXPLODE_STRENGTH = isMobile ? 22 : 36;
    const EXPLODE_DURATION = 600;
    const DRAG_RADIUS = isMobile ? 70 : 100;
    const DRAG_STRENGTH = isMobile ? 9 : 14;

    let cols, rows, dots;
    let mouse = { x: -9999, y: -9999 };
    let explosions = [];
    let isDragging = false;
    let rafId = null;
    let heroRect;

    function resize() {
      const hero = canvas.parentElement;
      heroRect = hero.getBoundingClientRect();
      canvas.width = heroRect.width;
      canvas.height = heroRect.height;
      buildGrid();
    }

    function buildGrid() {
      cols = Math.ceil(canvas.width / SPACING) + 2;
      rows = Math.ceil(canvas.height / SPACING) + 2;
      const offsetX = (canvas.width % SPACING) / 2;
      const offsetY = (canvas.height % SPACING) / 2;

      dots = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            ox: offsetX + c * SPACING,
            oy: offsetY + r * SPACING,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
          });
        }
      }
    }

    function getThemeColors() {
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'light') {
        return { dot: 'rgba(80, 60, 20, 0.18)', ripple: 'rgba(180, 140, 60, 0.55)' };
      }
      return { dot: 'rgba(255, 255, 255, 0.09)', ripple: 'rgba(201, 169, 110, 0.7)' };
    }

    function draw(ts) {
      rafId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const colors = getThemeColors();
      const now = ts || performance.now();

      explosions = explosions.filter(e => now - e.t < EXPLODE_DURATION);

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];

        let fx = 0, fy = 0;

        const dx = d.ox - mouse.x;
        const dy = d.ox !== undefined ? d.oy - mouse.y : 0;
        const distSq = dx * dx + dy * dy;
        const ripR = isDragging ? DRAG_RADIUS : RIPPLE_RADIUS;
        const ripS = isDragging ? DRAG_STRENGTH : RIPPLE_STRENGTH;

        if (distSq < ripR * ripR) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / ripR) * ripS;
          fx -= (dx / (dist + 0.001)) * force;
          fy -= (dy / (dist + 0.001)) * force;
        }

        for (let j = 0; j < explosions.length; j++) {
          const ex = explosions[j];
          const edx = d.ox - ex.x;
          const edy = d.oy - ex.y;
          const edistSq = edx * edx + edy * edy;
          if (edistSq < EXPLODE_RADIUS * EXPLODE_RADIUS) {
            const edist = Math.sqrt(edistSq);
            const progress = (now - ex.t) / EXPLODE_DURATION;
            const wave = Math.sin(progress * Math.PI);
            const force = wave * (1 - edist / EXPLODE_RADIUS) * EXPLODE_STRENGTH;
            fx += (edx / (edist + 0.001)) * force;
            fy += (edy / (edist + 0.001)) * force;
          }
        }

        d.vx = (d.vx + fx) * 0.78;
        d.vy = (d.vy + fy) * 0.78;
        d.x = d.ox + d.vx;
        d.y = d.oy + d.vy;

        const displacement = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
        const alpha = Math.min(1, displacement * 0.12 + 0.001);
        const r = DOT_RADIUS + Math.min(displacement * 0.12, 1.8);

        if (displacement > 0.5) {
          const t = Math.min(displacement / (ripS * 0.9), 1);
          const lerped = `rgba(${lerpColor([255, 255, 255, 0.09], [201, 169, 110, 0.85], t)})`;
          ctx.fillStyle = lerped;
        } else {
          ctx.fillStyle = colors.dot;
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function lerpColor(from, to, t) {
      const r = from[0] + (to[0] - from[0]) * t;
      const g = from[1] + (to[1] - from[1]) * t;
      const b = from[2] + (to[2] - from[2]) * t;
      const a = from[3] + (to[3] - from[3]) * t;
      return `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(2)}`;
    }

    function toCanvasCoords(clientX, clientY) {
      heroRect = canvas.parentElement.getBoundingClientRect();
      return {
        x: clientX - heroRect.left,
        y: clientY - heroRect.top,
      };
    }

    canvas.addEventListener('mousemove', (e) => {
      const p = toCanvasCoords(e.clientX, e.clientY);
      mouse.x = p.x;
      mouse.y = p.y;
    }, { passive: true });

    canvas.addEventListener('mouseleave', () => {
      mouse.x = -9999;
      mouse.y = -9999;
      isDragging = false;
    });

    canvas.addEventListener('mousedown', () => { isDragging = true; });
    canvas.addEventListener('mouseup', (e) => {
      isDragging = false;
      const p = toCanvasCoords(e.clientX, e.clientY);
      explosions.push({ x: p.x, y: p.y, t: performance.now() });
    });

    canvas.addEventListener('click', (e) => {
      const p = toCanvasCoords(e.clientX, e.clientY);
      explosions.push({ x: p.x, y: p.y, t: performance.now() });
    });

    canvas.addEventListener('touchstart', (e) => {
      isDragging = false;
      const t = e.touches[0];
      const p = toCanvasCoords(t.clientX, t.clientY);
      mouse.x = p.x;
      mouse.y = p.y;
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      isDragging = true;
      const t = e.touches[0];
      const p = toCanvasCoords(t.clientX, t.clientY);
      mouse.x = p.x;
      mouse.y = p.y;
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
      isDragging = false;
      if (e.changedTouches.length) {
        const t = e.changedTouches[0];
        const p = toCanvasCoords(t.clientX, t.clientY);
        explosions.push({ x: p.x, y: p.y, t: performance.now() });
      }
      mouse.x = -9999;
      mouse.y = -9999;
    }, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    }, { passive: true });

    resize();
    draw();
  })();
})();
