import { rafThrottle } from './utils.js';
import { initLanding } from './components/landing.js';
import { initNav } from './components/nav.js';
import { initThemeToggle } from './components/theme.js';
import { initFaq } from './components/faq.js';
import { initAudio } from './components/audio.js';
import { initCountdown } from './components/countdown.js';
import { initForm, setFormOnLogin, setFormOnLogout, setFormAfterRegister } from './components/form.js';
import { initCarousel, stopAutoplay, startAutoplay } from './components/carousel.js';
import { initProfileEdit, initWalletListeners, setStatsCallbacks, setWalletLogoutCallback } from './components/wallet.js';
import { updateStats, renderUsers, initSeedData, initModal } from './components/user.js';
import { initComments, refreshComments } from './components/comments.js';

document.addEventListener('DOMContentLoaded', async () => {

  setFormOnLogin((user) => {
    refreshComments();
  });
  setFormOnLogout(() => {
    refreshComments();
  });
  setFormAfterRegister(() => { updateStats(); renderUsers(); });
  setStatsCallbacks({ updateStats, renderUsers });
  setWalletLogoutCallback(() => {
    refreshComments();
  });

  initLanding({
    onEnter() {
      document.getElementById('main-content')?.classList.add('visible');
      initCarousel();
      initIntersectionObservers();
    },
    onReturnToLanding() {
      stopAutoplay();
    }
  });

  initNav();
  initFaq();
  initAudio();
  initForm();
  initModal();
  initProfileEdit();
  initWalletListeners();

  await initSeedData();
  await updateStats();
  await renderUsers();
  initComments();

  function initIntersectionObservers() {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        if (entry.target.id === 'carousel') startAutoplay();
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal, .fade-in, .form-section, .form-card').forEach(el => revealObserver.observe(el));

    const mainHeader = document.getElementById('mainHeader');
    if (mainHeader) {
      const threshold = window.innerHeight * 1.4;
      const onHeaderScroll = rafThrottle(() => {
        const scrollY = window.scrollY;

        if (scrollY <= threshold) {
          mainHeader.style.transform = 'translateY(0)';
        } else {
          mainHeader.style.transform = 'translateY(-100%)';
        }
      });
      window.addEventListener('scroll', onHeaderScroll, { passive: true });
    }
  }

  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initThemeToggle();
  initCountdown();
});

const floatingButtons = document.querySelectorAll('.btn_floating');
const audioFloat = document.getElementById('audioFloat');
function toggleFloatingButtons(show) {
  floatingButtons.forEach(btn => btn.classList.toggle('show', show));
}
function updateFloatingButtons() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPct = window.scrollY / maxScroll;
  toggleFloatingButtons(scrollPct >= 0.5);
  if (audioFloat) audioFloat.classList.toggle('show', scrollPct >= 0.8);
}
document.getElementById('scrollTopBtn')?.addEventListener('click', () => {
  document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

window.addEventListener('scroll', rafThrottle(updateFloatingButtons), { passive: true });
requestAnimationFrame(updateFloatingButtons);

function syncLegalA11y() {
  document.querySelectorAll('.legal_toggle').forEach(btn => {
    const content = document.getElementById(btn.getAttribute('aria-controls'));
    if (!content) return;
    if (window.innerWidth >= 768) {
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Enlaces legales');
      content.setAttribute('aria-hidden', 'false');
      content.classList.add('open');
      btn.classList.add('active');
    } else {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Mostrar enlaces legales');
      content.setAttribute('aria-hidden', 'true');
      content.classList.remove('open');
      btn.classList.remove('active');
    }
  });
}
document.querySelectorAll('.legal_toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    if (window.innerWidth >= 768) return;
    const content = document.getElementById(btn.getAttribute('aria-controls'));
    const isOpen = content.classList.contains('open');
    content.classList.toggle('open');
    btn.classList.toggle('active');
    btn.setAttribute('aria-expanded', !isOpen);
    content.setAttribute('aria-hidden', isOpen);
    btn.setAttribute('aria-label', isOpen ? 'Mostrar enlaces legales' : 'Ocultar enlaces legales');
  });
});

window.addEventListener('resize', syncLegalA11y);
requestAnimationFrame(syncLegalA11y);
