/* Gargi Portfolio Interactions */

const THEME_KEY = 'gargi-portfolio-theme';

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function setStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  setStoredTheme(theme);

  const meta = document.getElementById('theme-color-meta');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#0c0b0a' : '#fff3eb');
  }

  const btn = document.getElementById('theme-toggle');
  if (btn) {
    const dark = theme === 'dark';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

function resolveInitialTheme() {
  const saved = getStoredTheme();
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

applyTheme(resolveInitialTheme());

const THEME_FLASH_MS = 780;

function playThemeFlash() {
  const el = document.getElementById('theme-flash');
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  el.classList.remove('is-active');
  void el.offsetWidth;
  el.classList.add('is-active');
  window.clearTimeout(playThemeFlash._t);
  playThemeFlash._t = window.setTimeout(() => el.classList.remove('is-active'), THEME_FLASH_MS);
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    applyTheme(next);
    return;
  }
  playThemeFlash();
  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(() => applyTheme(next));
  } else {
    applyTheme(next);
  }
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (getStoredTheme()) return;
  applyTheme(e.matches ? 'dark' : 'light');
});

const header = document.querySelector('.site-header');
function updateHeaderScroll() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}
updateHeaderScroll();
window.addEventListener('scroll', updateHeaderScroll, { passive: true });

// Highlight nav for current section (Home + in-page links)
function initNavScrollSpy() {
  const home = document.querySelector('.nav-home');
  const navEl = document.querySelector('#primary-nav');
  if (!navEl) return;

  const sectionLinks = [...navEl.querySelectorAll('a[href^="#"]')].filter(a => {
    const h = a.getAttribute('href');
    return h && h.length > 1;
  });

  const orderedSectionIds = ['about', 'experience', 'education', 'skills', 'projects', 'contact'];
  const heroEl = document.querySelector('.hero');

  function headerOffset() {
    const h = document.querySelector('.site-header');
    return h ? Math.round(h.getBoundingClientRect().height) : 72;
  }

  function getActiveSlug() {
    const offset = headerOffset() + 20;
    const y = window.scrollY + offset;

    if (heroEl) {
      const heroRect = heroEl.getBoundingClientRect();
      const heroBottomAbs = heroRect.bottom + window.scrollY;
      if (y < heroBottomAbs - 40) {
        return 'home';
      }
    }

    let activeSlug = null;
    for (const id of orderedSectionIds) {
      const section = document.getElementById(id);
      if (!section) continue;
      const top = section.getBoundingClientRect().top + window.scrollY;
      if (top <= y) activeSlug = id;
    }

    if (activeSlug === null) {
      return orderedSectionIds[0];
    }
    return activeSlug;
  }

  function paint() {
    const slug = getActiveSlug();
    const all = [home, ...sectionLinks].filter(Boolean);
    all.forEach(el => {
      el.classList.remove('is-active');
      el.removeAttribute('aria-current');
    });

    if (slug === 'home' && home) {
      home.classList.add('is-active');
      home.setAttribute('aria-current', 'page');
      return;
    }

    const activeLink = sectionLinks.find(a => a.getAttribute('href') === `#${slug}`);
    if (activeLink) {
      activeLink.classList.add('is-active');
      activeLink.setAttribute('aria-current', 'location');
    }
  }

  let ticking = false;
  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      paint();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  paint();
}

initNavScrollSpy();

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#primary-nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

// Close mobile nav when link chosen
nav?.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

// Smooth scroll for in-page anchors (fallback for browsers ignoring CSS smooth)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', id); // update hash without jump
    }
  });
});

// Intersection Observer scroll reveal
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach(el => io.observe(el));
} else {
  // Fallback: show all
  reveals.forEach(el => el.classList.add('reveal-visible'));
}

// Hero: type / delete cycle — UI/UX Designer → Think → Design → Build → repeat
function initHeroTypewriter() {
  const out = document.getElementById('hero-type-text');
  if (!out) return;

  const words = ['UI/UX Designer', 'Think', 'Design', 'Build'];
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    out.textContent = 'UI/UX Designer · Think · Design · Build';
    return;
  }

  let wi = 0;
  let ch = 0;
  let deleting = false;
  let tid;

  const typeMs = 72;
  const deleteMs = 48;
  const pauseFullShort = 1900;
  const pauseFullLong = 2800;
  const pauseEmpty = 400;

  function clearT() {
    if (tid !== undefined) {
      window.clearTimeout(tid);
      tid = undefined;
    }
  }

  function pauseAfterWord(w) {
    return w.length > 10 ? pauseFullLong : pauseFullShort;
  }

  function step() {
    const w = words[wi];
    if (!deleting) {
      if (ch < w.length) {
        ch += 1;
        out.textContent = w.slice(0, ch);
        tid = window.setTimeout(step, typeMs);
        return;
      }
      deleting = true;
      tid = window.setTimeout(step, pauseAfterWord(w));
      return;
    }
    if (ch > 0) {
      ch -= 1;
      out.textContent = w.slice(0, ch);
      tid = window.setTimeout(step, deleteMs);
      return;
    }
    deleting = false;
    wi = (wi + 1) % words.length;
    tid = window.setTimeout(step, pauseEmpty);
  }

  step();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearT();
      return;
    }
    wi = 0;
    ch = 0;
    deleting = false;
    out.textContent = '';
    clearT();
    step();
  });
}

initHeroTypewriter();
