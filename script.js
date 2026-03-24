/* Gargi Portfolio Interactions */

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
