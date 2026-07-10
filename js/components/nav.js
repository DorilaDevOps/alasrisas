import { lockScroll, unlockScroll } from '../utils.js';

export function initNav() {
  const navToggle = document.getElementById('navToggle');
  const sidebar = document.getElementById('header_sidebar');
  const sidebarLinks = document.querySelectorAll('#sidebar-nav ul li a');
  const navLinks = document.querySelectorAll('#nav_menu ul li a');
  const nav_menu = document.getElementById('nav_menu');
  if (!navToggle || !sidebar || !nav_menu) return;

  let scrollLocked = false;

  function toggleMobileMenu(open) {
    document.body.classList.toggle('nav-active', open);
    navToggle.setAttribute('aria-expanded', open);
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú móvil' : 'Abrir menú móvil');
    sidebar.setAttribute('aria-hidden', !open);

    if (open && !scrollLocked) {
      scrollLocked = true;
      lockScroll();
    } else if (!open && scrollLocked) {
      scrollLocked = false;
      unlockScroll();
    }
  }

  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !document.body.classList.contains('nav-active');
    toggleMobileMenu(isOpen);
  });

  document.addEventListener('click', (e) => {
    sidebar.style.willChange = 'transform, opacity';
    if (document.body.classList.contains('nav-active') &&
        !sidebar.contains(e.target) && !navToggle.contains(e.target)) {
      sidebar.style.willChange = 'transform, opacity';
      toggleMobileMenu(false);
      sidebar.addEventListener('transitionend', () => {
        sidebar.style.willChange = 'auto';
      }, { once: true });
    }
  });

  const allNavLinks = [...sidebarLinks, ...navLinks];

  const setActiveLink = (hash) => {
    allNavLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === hash);
    });
  };

  allNavLinks.forEach(link => {
    link.addEventListener('click', function() {
      allNavLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      toggleMobileMenu(false);
    });
  });

  sidebar.addEventListener('click', () => {
    toggleMobileMenu(false);
  });

  const sections = [];
  allNavLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      const section = document.getElementById(href.slice(1));
      if (section) sections.push({ id: href, el: section });
    }
  });

  if (sections.length > 0) {
    const obs = new IntersectionObserver((entries) => {
      let maxRatio = 0;
      let activeId = null;
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          activeId = '#' + entry.target.id;
        }
      });
      if (activeId) setActiveLink(activeId);
    }, { threshold: [0.2, 0.4, 0.6], rootMargin: '-80px 0px -30% 0px' });

    sections.forEach(s => obs.observe(s.el));
  }

  const mqDesktop = window.matchMedia('(min-width: 992px)');
  function handleScreenChange(e) {
    if (e.matches) {
      nav_menu.setAttribute('aria-hidden', 'false');
      toggleMobileMenu(false);
    } else {
      nav_menu.setAttribute('aria-hidden', 'true');
    }
  }
  mqDesktop.addEventListener('change', handleScreenChange);
  handleScreenChange(mqDesktop);
}
