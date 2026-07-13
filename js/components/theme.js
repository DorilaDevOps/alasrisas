export function initThemeToggle() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme_toggle');
  if (!toggleBtn) return;
  const STORAGE_THEME = 'viaje_amigos_theme';
  const currentTheme = root.getAttribute('data-theme') || 'dark';
  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    toggleBtn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    toggleBtn.setAttribute('aria-label', theme === 'light'
      ? 'Cambiar a modo oscuro'
      : 'Cambiar a modo claro');
  };
  applyTheme(currentTheme);
  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem(STORAGE_THEME, next);
  });
}
