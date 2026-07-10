export function initAudio() {
  const audio = document.getElementById('tripAudio');
  const audioBtn = document.getElementById('audioToggleBtn');
  if (!audio || !audioBtn) return;
  const audioStatus = audioBtn.querySelector('.audio-status-text');
  const audioIcon = audioBtn.querySelector('.audio-icon');
  audioBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        audioBtn.setAttribute('aria-pressed', 'true');
        audioIcon.textContent = '⏸';
        audioStatus.textContent = 'Música de viaje sonando';
      }).catch(err => console.warn('Autoplay bloqueado:', err));
    } else {
      audio.pause();
      audioBtn.setAttribute('aria-pressed', 'false');
      audioIcon.textContent = '▶';
      audioStatus.textContent = 'Música de viaje pausada';
    }
  });
}
