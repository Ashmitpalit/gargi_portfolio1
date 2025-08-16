// ===== 3D Portfolio JavaScript =====

// Initialize Three.js Scene
let scene, camera, renderer, particles;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// DOM Elements
const loadingScreen = document.querySelector('.loading-screen');
const navLinks = document.querySelectorAll('.nav-link');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav-3d');
const sections = document.querySelectorAll('section');
const revealElements = document.querySelectorAll('.reveal');

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initThreeJS();
  initNavigation();
  initScrollAnimations();
  initGSAPAnimations();
  initInteractiveElements();
});

// ===== Loading Screen =====
function initLoadingScreen() {
  // Simulate loading time
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    // Start 3D background after loading
    animate();
  }, 2000);
}

// ===== Three.js 3D Background =====
function initThreeJS() {
  const canvas = document.getElementById('bg-canvas');

  // Scene setup
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create particle system
  createParticles();

  // Position camera
  camera.position.z = 50;

  // Handle window resize
  window.addEventListener('resize', onWindowResize);

  // Handle mouse movement
  document.addEventListener('mousemove', onDocumentMouseMove);
}

function createParticles() {
  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    // Random positions
    positions[i] = (Math.random() - 0.5) * 200;
    positions[i + 1] = (Math.random() - 0.5) * 200;
    positions[i + 2] = (Math.random() - 0.5) * 200;

    // Gradient colors
    const color = new THREE.Color();
    color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5);
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

function animate() {
  requestAnimationFrame(animate);

  // Rotate particles
  if (particles) {
    particles.rotation.x += 0.001;
    particles.rotation.y += 0.002;

    // Mouse interaction
    particles.rotation.x += (mouseY - particles.rotation.x) * 0.0001;
    particles.rotation.y += (mouseX - particles.rotation.y) * 0.0001;
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) * 0.01;
  mouseY = (event.clientY - windowHalfY) * 0.01;
}

// ===== Navigation =====
function initNavigation() {
  // Mobile navigation toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      const navLinksElement = document.querySelector('.nav-links');
      if (navLinksElement) {
        navLinksElement.classList.toggle('active');
      }
    });
  }

  // Close mobile nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !nav.contains(e.target)) {
      navToggle.classList.remove('active');
      const navLinksElement = document.querySelector('.nav-links');
      if (navLinksElement) {
        navLinksElement.classList.remove('active');
      }
    }
  });

  // Smooth scrolling for navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Update active navigation
        updateActiveNav(targetId);
      }
    });
  });

  // Update active navigation on scroll
  window.addEventListener('scroll', () => {
    updateActiveNavOnScroll();
  });
}

function updateActiveNav(targetId) {
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === targetId) {
      link.classList.add('active');
    }
  });
}

function updateActiveNavOnScroll() {
  const scrollPosition = window.scrollY + 100;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      updateActiveNav(`#${sectionId}`);
    }
  });
}

// ===== Scroll Animations =====
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    observer.observe(el);
  });
}

// ===== GSAP Animations =====
function initGSAPAnimations() {
  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // Hero section animations
  gsap.from('.hero-badge', {
    duration: 1,
    y: 30,
    opacity: 0,
    ease: 'power3.out',
    delay: 0.5
  });

  gsap.from('.hero-title .title-line', {
    duration: 1,
    y: 50,
    opacity: 0,
    stagger: 0.2,
    ease: 'power3.out',
    delay: 0.8
  });

  gsap.from('.hero-description', {
    duration: 1,
    y: 30,
    opacity: 0,
    ease: 'power3.out',
    delay: 1.4
  });

  gsap.from('.hero-actions', {
    duration: 1,
    y: 30,
    opacity: 0,
    ease: 'power3.out',
    delay: 1.6
  });

  gsap.from('.hero-image-container', {
    duration: 1.5,
    scale: 0.8,
    opacity: 0,
    ease: 'power3.out',
    delay: 1
  });

  // Floating shapes animation
  gsap.to('.floating-shape', {
    y: -20,
    duration: 3,
    ease: 'power2.inOut',
    stagger: 1,
    repeat: -1,
    yoyo: true
  });

  // Stats counter animation
  const stats = document.querySelectorAll('.stat-number');
  stats.forEach(stat => {
    const finalValue = stat.textContent;
    const numericValue = parseInt(finalValue);

    gsap.from(stat, {
      duration: 2,
      innerHTML: 0,
      ease: 'power2.out',
      snap: { innerHTML: 1 },
      scrollTrigger: {
        trigger: stat,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Work items stagger animation
  gsap.from('.work-item', {
    duration: 0.8,
    y: 50,
    opacity: 0,
    stagger: 0.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.work-grid',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // Process steps animation
  gsap.from('.process-step', {
    duration: 0.8,
    y: 30,
    opacity: 0,
    stagger: 0.3,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.process-timeline',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // Parallax effect for sections
  sections.forEach(section => {
    gsap.to(section, {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
}

// ===== Interactive Elements =====
function initInteractiveElements() {
  // Create cursor glow effect
  createCursorGlow();

  // Skill items hover effect
  const skillItems = document.querySelectorAll('.skill-item');
  skillItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, {
        duration: 0.3,
        scale: 1.05,
        ease: 'power2.out'
      });
    });

    item.addEventListener('mouseleave', () => {
      gsap.to(item, {
        duration: 0.3,
        scale: 1,
        ease: 'power2.out'
      });
    });
  });

  // Work items hover effect
  const workItems = document.querySelectorAll('.work-item');
  workItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, {
        duration: 0.3,
        y: -10,
        ease: 'power2.out'
      });
    });

    item.addEventListener('mouseleave', () => {
      gsap.to(item, {
        duration: 0.3,
        y: 0,
        ease: 'power2.out'
      });
    });
  });

  // Smooth reveal animations for elements
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gsap.to(entry.target, {
          duration: 1,
          y: 0,
          opacity: 1,
          ease: 'power3.out'
        });
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements that should reveal
  const allRevealElements = document.querySelectorAll('.about-content, .work-grid, .process-timeline, .contact-content');
  allRevealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    revealObserver.observe(el);
  });
}

// ===== Performance Optimizations =====
// Throttle scroll events
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Optimized scroll handler
window.addEventListener('scroll', throttle(() => {
  // Update any scroll-based animations here
}, 16)); // 60fps

// ===== Utility Functions =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animations when page is not visible
    gsap.globalTimeline.pause();
  } else {
    // Resume animations when page becomes visible
    gsap.globalTimeline.resume();
  }
});

// ===== Error Handling =====
window.addEventListener('error', (e) => {
  console.error('Portfolio error:', e.error);
  // Gracefully handle any errors
});

// ===== Accessibility Enhancements =====
// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-navigation');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-navigation');
});

// Focus management for better accessibility
const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
focusableElements.forEach(element => {
  element.addEventListener('focus', () => {
    element.classList.add('focused');
  });

  element.addEventListener('blur', () => {
    element.classList.remove('focused');
  });
});

// ===== Performance Monitoring =====
if ('performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
    }, 0);
  });
}

// Export functions for potential external use
window.PortfolioApp = {
  initThreeJS,
  animate,
  updateActiveNav
};

// ===== Cursor Effects =====
function createCursorGlow() {
  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  document.body.appendChild(cursorGlow);

  document.addEventListener('mousemove', (e) => {
    gsap.to(cursorGlow, {
      duration: 0.1,
      x: e.clientX,
      y: e.clientY,
      ease: 'power2.out'
    });
  });

  // Hide cursor glow on mobile
  if ('ontouchstart' in window) {
    cursorGlow.style.display = 'none';
  }
}
