(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.bar');
  const scrollFill = document.getElementById('scroll-fill');
  const sections = document.querySelectorAll('[data-section]');
  const navLinks = document.querySelectorAll('[data-nav]');

  function updateScrollProgress() {
    if (!scrollFill) return;
    if (reduce) {
      scrollFill.style.height = '';
      return;
    }
    const doc = document.documentElement;
    const h = doc.scrollHeight - window.innerHeight;
    const p = h <= 0 ? 0 : window.scrollY / h;
    scrollFill.style.height = `${Math.min(100, Math.max(0, p * 100))}%`;
  }

  function updateActiveSection() {
    if (!sections.length || !navLinks.length) return;
    const mid = window.innerHeight * 0.36;
    let best = null;
    let bestDist = Infinity;
    sections.forEach(s => {
      const r = s.getBoundingClientRect();
      if (r.bottom < 80 || r.top > window.innerHeight - 60) return;
      const c = (r.top + r.bottom) / 2;
      const d = Math.abs(c - mid);
      if (d < bestDist) {
        bestDist = d;
        best = s;
      }
    });
    if (!best) return;
    const id = best.dataset.section;
    navLinks.forEach(a => {
      a.classList.toggle('is-active', a.dataset.nav === id);
    });
    sections.forEach(s => {
      s.classList.toggle('is-active-section', s === best);
    });
  }

  let scrollTicking = false;
  function onScrollFrame() {
    if (header) header.classList.toggle('bar--scrolled', window.scrollY > 40);
    updateScrollProgress();
    updateActiveSection();
    scrollTicking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(onScrollFrame);
      }
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    updateScrollProgress();
    updateActiveSection();
  });

  onScrollFrame();

  const toggle = document.querySelector('.bar__toggle');
  const menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        history.replaceState(null, '', id);
        requestAnimationFrame(() => {
          updateActiveSection();
          updateScrollProgress();
        });
      }
    });
  });

  function triggerRules(container) {
    if (reduce) {
      container.querySelectorAll('.js-rule').forEach(r => r.classList.add('is-drawn'));
      return;
    }
    container.querySelectorAll('.js-rule').forEach((r, i) => {
      setTimeout(() => r.classList.add('is-drawn'), 120 + i * 70);
    });
  }

  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add('is-visible');
          triggerRules(el);
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => {
      el.classList.add('is-visible');
      triggerRules(el);
    });
  }

  document.querySelectorAll('.rule--v').forEach(v => {
    if (reduce) v.classList.add('is-drawn');
  });

  if (!reduce && 'IntersectionObserver' in window) {
    const vRules = document.querySelectorAll('.rule--v:not(.is-drawn)');
    const vio = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-drawn');
            vio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    vRules.forEach(r => vio.observe(r));
  } else {
    document.querySelectorAll('.rule--v').forEach(r => r.classList.add('is-drawn'));
  }

  document.querySelectorAll('.js-panel-bridge').forEach(panel => {
    if (reduce) {
      panel.classList.add('is-bridge-open');
      return;
    }
    if (!('IntersectionObserver' in window)) {
      panel.classList.add('is-bridge-open');
      return;
    }
    const bio = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) panel.classList.add('is-bridge-open');
        });
      },
      { threshold: 0.06, rootMargin: '-10% 0px -50% 0px' }
    );
    bio.observe(panel);
  });
})();
