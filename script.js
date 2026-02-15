/* ============================================================
   script.js — Elite Portfolio Interactions
   ============================================================ */

(function () {
  'use strict';

  // ===== PARTICLE TAIL CURSOR =====
  const TAIL_LENGTH = 20;
  const tailDots = [];
  const tailContainer = document.getElementById('cursor-tail');
  const cursorAura = document.querySelector('.cursor-aura');
  let mouseX = 0, mouseY = 0;

  // Create tail dot elements
  for (let i = 0; i < TAIL_LENGTH; i++) {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const t = i / TAIL_LENGTH;
    const size = Math.max(2, 14 * (1 - t));
    const hue = 265 + t * 60; // purple → cyan
    const alpha = 0.9 * (1 - t * 0.8);
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
    dot.style.background = `hsla(${hue}, 85%, 60%, ${alpha})`;
    dot.style.boxShadow = `0 0 ${size * 1.5}px hsla(${hue}, 85%, 60%, ${alpha * 0.6})`;
    tailContainer.appendChild(dot);
    tailDots.push({ el: dot, x: 0, y: 0 });
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateTail() {
    // First dot follows mouse directly
    tailDots[0].x += (mouseX - tailDots[0].x) * 0.35;
    tailDots[0].y += (mouseY - tailDots[0].y) * 0.35;
    tailDots[0].el.style.left = tailDots[0].x + 'px';
    tailDots[0].el.style.top = tailDots[0].y + 'px';

    // Each subsequent dot follows the one before it
    for (let i = 1; i < TAIL_LENGTH; i++) {
      const ease = 0.28 - (i * 0.005);
      tailDots[i].x += (tailDots[i - 1].x - tailDots[i].x) * Math.max(ease, 0.06);
      tailDots[i].y += (tailDots[i - 1].y - tailDots[i].y) * Math.max(ease, 0.06);
      tailDots[i].el.style.left = tailDots[i].x + 'px';
      tailDots[i].el.style.top = tailDots[i].y + 'px';
    }

    // Aura follows with even more lag
    cursorAura.style.left = tailDots[5].x + 'px';
    cursorAura.style.top = tailDots[5].y + 'px';

    requestAnimationFrame(animateTail);
  }
  animateTail();

  // ===== PARTICLE BACKGROUND =====
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 130;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      // Mouse repulsion
      const dx = this.x - mouseX;
      const dy = this.y - (mouseY + window.scrollY);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.vx += (dx / dist) * force * 0.3;
        this.vy += (dy / dist) * force * 0.3;
      }
      // Dampen velocity
      this.vx *= 0.99;
      this.vy *= 0.99;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(124, 58, 237, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  // ===== NAVBAR SCROLL EFFECT =====
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Scroll spy
  const sections = document.querySelectorAll('section[id]');
  const observerNav = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -60% 0px' });

  sections.forEach(section => observerNav.observe(section));

  // Hamburger
  const hamburger = document.querySelector('.nav-hamburger');
  const navMenu = document.querySelector('.nav-links');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
    navLinks.forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('open'));
    });
  }

  // ===== TYPEWRITER EFFECT =====
  const typedEl = document.querySelector('.typed-text');
  const titles = [
    'Full-Stack Developer',
    'Competitive Programmer',
    'Problem Solver',
    'Cybersecurity Enthusiast',
    'DSA Expert'
  ];
  let titleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeWriter() {
    const current = titles[titleIndex];
    if (isDeleting) {
      typedEl.textContent = current.substring(0, charIndex--);
      if (charIndex < 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        setTimeout(typeWriter, 400);
        return;
      }
      setTimeout(typeWriter, 40);
    } else {
      typedEl.textContent = current.substring(0, charIndex++);
      if (charIndex > current.length) {
        isDeleting = true;
        setTimeout(typeWriter, 2000);
        return;
      }
      setTimeout(typeWriter, 80);
    }
  }
  typeWriter();

  // ===== ANIMATED COUNTERS =====
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        const target = parseInt(entry.target.dataset.count);
        const suffix = entry.target.dataset.suffix || '';
        let current = 0;
        const increment = Math.ceil(target / 60);
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          entry.target.textContent = current + suffix;
        }, 25);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // ===== SCROLL REVEAL =====
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // ===== 3D TILT ON PROJECT CARDS =====
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });

  // ===== MAGNETIC BUTTONS =====
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  // ===== SMOOTH NAV LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
