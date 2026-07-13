const icons = {
  success: '✅',
  error: '⚠️',
  warning: '🔔',
  info: '💡'
};

export function showToast(msg, type = 'success', anchor = null) {
  const container = document.getElementById('toast-container');
  container.innerHTML = '';
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '💡'}</span> ${msg}`;

  if (anchor) {
    const rect = anchor.getBoundingClientRect();
    toast.style.top = `${rect.top + rect.height / 2}px`;
  }

  container.appendChild(toast);
  container.classList.add('has-toast');
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      container.classList.remove('has-toast');
      container.innerHTML = '';
    }, 400);
  }, 2000);
}

export function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
  });
}
