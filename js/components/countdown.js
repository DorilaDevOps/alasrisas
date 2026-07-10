export function initCountdown() {
  const target = new Date('2026-12-26T00:00:00').getTime();
  const els = {
    d: document.getElementById('cd-days'),
    h: document.getElementById('cd-hours'),
    m: document.getElementById('cd-minutes'),
    s: document.getElementById('cd-seconds')
  };
  const updateValue = (el, value) => {
    if (!el) return;
    if (el.textContent !== value) {
      el.textContent = value;
      el.classList.remove('tick');
      void el.offsetWidth;
      el.classList.add('tick');
    }
  };
  const update = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      if (els.d) {
        const grid = els.d.closest('.countdown-grid');
        if (grid) {
          grid.innerHTML = `<h3 style="color:var(--accent); text-align:center; width:100%;">¡Llegó el día! 🎉</h3>`;
        }
      }
      clearInterval(intervalId);
      return;
    }
    const days = String(Math.floor(diff / 86400000)).padStart(2, '0');
    const hours = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    updateValue(els.d, days);
    updateValue(els.h, hours);
    updateValue(els.m, minutes);
    updateValue(els.s, seconds);
  };
  const intervalId = setInterval(update, 1000);
  update();
}
