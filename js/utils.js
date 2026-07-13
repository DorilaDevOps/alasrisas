export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

export const escHtml = (str) => {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
};

export const rafThrottle = (callback) => {
  let queued = false;
  return (...args) => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      callback(...args);
      queued = false;
    });
  };
};

export const waitForTransition = (element, propertyName) => new Promise(resolve => {
  const handler = (e) => {
    if (e.target === element && (!propertyName || e.propertyName === propertyName)) {
      element.removeEventListener('transitionend', handler);
      resolve();
    }
  };
  element.addEventListener('transitionend', handler);
});

/* ========== SCROLL LOCK (iOS-safe) ========== */
let scrollY = 0;

export function lockScroll() {
  scrollY = window.scrollY;
  document.body.classList.add('no-scroll');
  document.body.style.top = `-${scrollY}px`;
}

export function unlockScroll() {
  document.body.classList.remove('no-scroll');
  document.body.style.top = '';
  window.scrollTo(0, scrollY);
}
