import { waitForTransition } from '../utils.js';

export function initLanding({ onEnter, onReturnToLanding }) {
  const landing = document.getElementById('landingSection');
  const landingDot = document.getElementById('landingDot');
  const landingImg = document.getElementById('landingImg');
  const landingContent = document.getElementById('landingContent');
  const landingHint = document.getElementById('landingHint');
  const enterBtn = document.getElementById('enterBtn');
  const logoBtn = document.getElementById('logoBtn');

  if (!landing) return;

  let animStarted = false;
  let timerInicio = null;
  let timerHint = null;

  const startExpandingAnimation = () => {
    if (animStarted) return;
    landingContent.style.willChange = 'translate, opacity';
    animStarted = true;
    clearTimeout(timerInicio);
    clearTimeout(timerHint);
    if (landingHint) landingHint.classList.remove('is-visible');
    if (landingDot) landingDot.style.display = 'none';
    if (landingImg) landingImg.classList.add('is-expanding');
    landingContent.classList.add('is-visible');
  };

  landingContent.addEventListener('transitionend', () => {
    landingContent.style.willChange = 'auto';
  }, { once: true });

  if (landingDot) {
    landingDot.addEventListener('click', startExpandingAnimation);
  }

  landing.addEventListener('click', (e) => {
    if (enterBtn && (e.target === enterBtn || enterBtn.contains(e.target))) return;
    startExpandingAnimation();
  });

  if (enterBtn) {
    enterBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      landingContent.classList.remove('is-visible');
      landing.classList.add('is-exiting');
      await waitForTransition(landing, 'opacity');
      landing.classList.add('is-hidden');
      requestAnimationFrame(() => {
        if (onEnter) onEnter();
      });
    });
  }

  const showLanding = async () => {
    history.replaceState(null, '', window.location.pathname);
    clearTimeout(timerInicio);
    document.getElementById('main-content')?.classList.remove('nav-active', 'visible');
    animStarted = false;
    landing.classList.remove('is-hidden', 'is-exiting');
    if (landingDot) landingDot.style.display = 'block';
    if (landingImg) landingImg.classList.remove('is-expanding');
    landingContent.classList.remove('is-visible');
    if (landingHint) landingHint.classList.remove('is-visible');
    clearTimeout(timerHint);
    timerHint = setTimeout(() => {
      if (!animStarted && landingHint) landingHint.classList.add('is-visible');
    }, 3000);
    timerInicio = setTimeout(() => {
      if (!animStarted) startExpandingAnimation();
    }, 5000);
    if (onReturnToLanding) onReturnToLanding();
  };

  showLanding();

  if (logoBtn) {
    const scrollToTop = () => {
      document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    logoBtn.addEventListener('click', scrollToTop);
    logoBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToTop();
      }
    });
  }
}
