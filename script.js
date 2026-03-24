/* Gargi Portfolio Interactions */

// Hero: hung net (canvas) — ripples like water from cursor, settles when idle
(function initHeroNet() {
  const hero = document.querySelector('.hero');
  const canvas = document.querySelector('.hero-net-canvas');
  if (!hero || !canvas) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cols = 0;
  let rows = 0;
  let points = [];
  let constraints = [];
  let dpr = 1;
  let wCss = 0;
  let hCss = 0;

  let mouseX = -1e6;
  let mouseY = -1e6;
  let prevMX = 0;
  let prevMY = 0;
  let velX = 0;
  let velY = 0;
  let heroVisible = false;
  let rafId = 0;

  const idx = (c, r) => r * cols + c;

  function buildMesh() {
    const rect = hero.getBoundingClientRect();
    wCss = rect.width;
    hCss = rect.height;
    if (wCss < 40 || hCss < 40) return;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(wCss * dpr);
    canvas.height = Math.floor(hCss * dpr);

    cols = Math.round(wCss / 26);
    rows = Math.round(hCss / 22);
    cols = Math.max(10, Math.min(36, cols));
    rows = Math.max(16, Math.min(48, rows));

    const padX = wCss * 0.04;
    const padY = hCss * 0.05;
    const netW = wCss - padX * 2;
    const netH = hCss - padY * 2;

    points = [];
    constraints = [];

    for (let c = 0; c < cols; c++) {
      const t = cols <= 1 ? 0.5 : c / (cols - 1);
      const hang = Math.sin(t * Math.PI) * (hCss * 0.018);
      for (let r = 0; r < rows; r++) {
        const sx = padX + (c / Math.max(1, cols - 1)) * netW;
        const sy = padY + (r / Math.max(1, rows - 1)) * netH + hang * (r / Math.max(1, rows - 1));
        points.push({
          rx: sx,
          ry: sy,
          x: sx,
          y: sy,
          px: sx,
          py: sy,
          pinned: r === 0
        });
      }
    }

    const dist = (i, j) => {
      const A = points[i];
      const B = points[j];
      return Math.hypot(B.rx - A.rx, B.ry - A.ry);
    };

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const i = idx(c, r);
        if (r < rows - 1) constraints.push({ a: i, b: idx(c, r + 1), rest: dist(i, idx(c, r + 1)) });
        if (c < cols - 1) constraints.push({ a: i, b: idx(c + 1, r), rest: dist(i, idx(c + 1, r)) });
        if (c < cols - 1 && r < rows - 1) {
          constraints.push({ a: i, b: idx(c + 1, r + 1), rest: dist(i, idx(c + 1, r + 1)) });
          constraints.push({ a: idx(c + 1, r), b: idx(c, r + 1), rest: dist(idx(c + 1, r), idx(c, r + 1)) });
        }
      }
    }
  }

  function satisfyConstraints(iterations) {
    for (let k = 0; k < iterations; k++) {
      for (let i = 0; i < constraints.length; i++) {
        const con = constraints[i];
        const A = points[con.a];
        const B = points[con.b];
        const dx = B.x - A.x;
        const dy = B.y - A.y;
        const d = Math.hypot(dx, dy) || 1e-6;
        const diff = (d - con.rest) / d;
        const ox = dx * diff * 0.5;
        const oy = dy * diff * 0.5;
        if (!A.pinned && !B.pinned) {
          A.x += ox;
          A.y += oy;
          B.x -= ox;
          B.y -= oy;
        } else if (A.pinned) {
          B.x -= ox * 2;
          B.y -= oy * 2;
        } else {
          A.x += ox * 2;
          A.y += oy * 2;
        }
      }
    }
  }

  const damping = 0.978;
  const stiffness = 0.014;
  const impulse = reduceMotion ? 0 : 1.15;
  const radius = 200;

  function step() {
    velX *= 0.9;
    velY *= 0.9;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p.pinned) {
        p.x = p.rx;
        p.y = p.ry;
        p.px = p.x;
        p.py = p.y;
        continue;
      }

      let ax = (p.rx - p.x) * stiffness;
      let ay = (p.ry - p.y) * stiffness;

      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const d = Math.hypot(dx, dy);
      if (d < radius && d > 2) {
        const w = (1 - d / radius) ** 2;
        ax += velX * w * impulse;
        ay += velY * w * impulse;
        const nx = dx / d;
        const ny = dy / d;
        const sp = Math.hypot(velX, velY);
        ax -= nx * w * sp * 0.06;
        ay -= ny * w * sp * 0.06;
      }

      const vx = (p.x - p.px) * damping + ax;
      const vy = (p.y - p.py) * damping + ay;
      p.px = p.x;
      p.py = p.y;
      p.x += vx;
      p.y += vy;
    }

    satisfyConstraints(reduceMotion ? 2 : 5);
  }

  function draw() {
    if (!points.length) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, wCss, hCss);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < constraints.length; i++) {
      const con = constraints[i];
      const A = points[con.a];
      const B = points[con.b];
      const off = Math.hypot(A.x - A.rx, A.y - A.ry) + Math.hypot(B.x - B.rx, B.y - B.ry);
      const alpha = Math.min(0.52, 0.16 + off * 0.009);
      ctx.strokeStyle = `rgba(110, 95, 185, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    }
  }

  function loop() {
    if (!heroVisible) return;
    if (!reduceMotion) step();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  let mouseWasInside = false;

  function onPointerMove(clientX, clientY) {
    const r = hero.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    if (x < 0 || x > r.width || y < 0 || y > r.height) {
      mouseX = -1e6;
      mouseY = -1e6;
      mouseWasInside = false;
      return;
    }
    if (!mouseWasInside) {
      prevMX = x;
      prevMY = y;
      mouseWasInside = true;
    }
    velX = velX * 0.82 + (x - prevMX) * 0.18;
    velY = velY * 0.82 + (y - prevMY) * 0.18;
    prevMX = x;
    prevMY = y;
    mouseX = x;
    mouseY = y;
  }

  function redrawStatic() {
    buildMesh();
    draw();
  }

  const ro = new ResizeObserver(redrawStatic);
  ro.observe(hero);

  if (reduceMotion) {
    redrawStatic();
    return;
  }

  document.addEventListener(
    'pointermove',
    e => {
      if (!heroVisible) return;
      onPointerMove(e.clientX, e.clientY);
    },
    { passive: true }
  );

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        heroVisible = entry.isIntersecting;
        if (heroVisible) {
          buildMesh();
          prevMX = wCss * 0.5;
          prevMY = hCss * 0.5;
          mouseWasInside = false;
          if (!rafId) rafId = requestAnimationFrame(loop);
        } else {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = 0;
          mouseX = -1e6;
          velX = 0;
          velY = 0;
        }
      });
    },
    { threshold: 0, rootMargin: '64px' }
  );
  io.observe(hero);

  const br = hero.getBoundingClientRect();
  if (br.bottom > 0 && br.top < window.innerHeight) {
    heroVisible = true;
    buildMesh();
    prevMX = wCss * 0.5;
    prevMY = hCss * 0.5;
    if (!rafId) rafId = requestAnimationFrame(loop);
  }
})();

const header = document.querySelector('.site-header');
function updateHeaderScroll() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}
updateHeaderScroll();
window.addEventListener('scroll', updateHeaderScroll, { passive: true });

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
