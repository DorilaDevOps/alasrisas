export function initAudio() {
  const audio = document.getElementById('tripAudio');
  const audioBtn = document.getElementById('audioToggleBtn');
  if (!audio || !audioBtn) return;

  audioBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        audioBtn.setAttribute('aria-pressed', 'true');
        audioBtn.setAttribute('aria-label', 'Pausar música de viaje');
      }).catch(err => console.warn('Autoplay bloqueado:', err));
    } else {
      audio.pause();
      audioBtn.setAttribute('aria-pressed', 'false');
      audioBtn.setAttribute('aria-label', 'Reproducir música de viaje');
    }
  });
}
