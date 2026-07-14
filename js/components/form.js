import { DataService } from '../services/DataService.js';
import { showToast, clearErrors } from './toast.js';

let formMode = 'registro';
let _currentUser = null;
let _onLogin = null;
let _onLogout = null;
let _afterRegister = null;

export function getCurrentUser() { return _currentUser; }
export function setCurrentUser(user) { _currentUser = user; }
export function setFormOnLogin(fn) { _onLogin = fn; }
export function setFormOnLogout(fn) { _onLogout = fn; }
export function setFormAfterRegister(fn) { _afterRegister = fn; }

export function doLogout() {
  _currentUser = null;
  if (_onLogout) _onLogout();
}

export function setFormMode(mode) {
  formMode = mode;
  const isReg = mode === 'registro';
  const title = document.getElementById('form-title');
  const subtitle = document.querySelector('.form-subtitle');
  const btn = document.querySelector('.form-submit');
  const toggle = document.getElementById('formModeToggle');
  if (title) title.innerHTML = isReg
    ? 'Registro de la <span>Banda</span><span class="live-indicator" aria-hidden="true"></span>'
    : 'Mi <span>Usuario</span><span class="live-indicator" aria-hidden="true"></span>';
  if (subtitle) subtitle.textContent = isReg ? 'Completá tus datos' : 'Ingresá con tu nombre y contraseña';
  if (btn) {
    btn.innerHTML = isReg
      ? '<span class="submit-icon" aria-hidden="true"><i class="fas fa-thumbs-up"></i></span> REGISTRARSE'
      : '<span class="submit-icon" aria-hidden="true"><i class="fas fa-thumbs-up"></i></span> INGRESAR';
    btn.setAttribute('aria-label', isReg ? 'Registrarse' : 'Ingresar');
  }
  document.querySelectorAll('.reg-field').forEach(el => {
    el.style.display = isReg ? '' : 'none';
    el.classList.toggle('reg-field--hidden', !isReg);
  });
  clearErrors();
  if (toggle) toggle.textContent = isReg ? '¿Ya tenés cuenta? Ingresá' : '¿No tenés cuenta? Registrate';
}

const FORM_VALIDATORS = {
  'nombre': (v) => v.trim().length >= 2 || 'Ingresá tu nombre (mínimo 2 caracteres).',
  'password': (v) => (v.length >= 1 && v.length <= 4) || 'La contraseña debe tener entre 1 y 4 caracteres.',
  'nick': (v) => !v || v.trim().length >= 2 || 'El nick debe tener al menos 2 caracteres.'
};

function validateField(fieldId) {
  const validate = FORM_VALIDATORS[fieldId];
  if (!validate) return false;
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-err`);
  if (!field) return false;
  const result = validate(field.value);
  const message = result === true ? '' : result;
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.toggle('show', !!message);
  }
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  field.classList.toggle('field--valid', !message && field.value.trim().length > 0);
  field.classList.toggle('field--error', !!message);
  return !!message;
}

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formAnchor = document.getElementById('form_section');
  let firstInvalid = null;
  let isValid = true;

  Object.keys(FORM_VALIDATORS).forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    if (field.closest('.reg-field')?.style.display === 'none') {
      const errorEl = document.getElementById(`${fieldId}-err`);
      if (errorEl) { errorEl.textContent = ''; errorEl.classList.remove('show'); }
      return;
    }
    const hasError = validateField(fieldId);
    if (hasError) {
      isValid = false;
      if (!firstInvalid) firstInvalid = field;
    }
  });

  if (!isValid) {
    showToast('Corregí los campos marcados en rojo.', 'error', formAnchor);
    firstInvalid?.focus();
    return false;
  }

  const nombreVal = document.getElementById('nombre')?.value.trim() || '';
  const passVal = document.getElementById('password')?.value.trim() || '';
  const existingUser = DataService.getAll().find(
    u => u.nombre.toLowerCase() === nombreVal.toLowerCase() && u.pass === passVal
  );

  if (formMode === 'ingreso') {
    if (existingUser) {
      showToast(`¡Bienvenido de nuevo, ${existingUser.nombre}!`, 'success', formAnchor);
      _currentUser = existingUser;
      if (_onLogin) _onLogin(existingUser);
      form.reset();
      return false;
    }
    const userByName = DataService.getAll().find(
      u => u.nombre.toLowerCase() === nombreVal.toLowerCase()
    );
    if (userByName) {
      showToast('Contraseña incorrecta. Intentá de nuevo.', 'error', formAnchor);
    } else {
      showToast('No estás registrado. Completá el formulario.', 'warning', formAnchor);
      setFormMode('registro');
    }
    return false;
  }

  if (existingUser) {
    showToast('Ya estás registrado. Usá el modo Ingreso.', 'info', formAnchor);
    setFormMode('ingreso');
    return false;
  }

  const submitBtn = form.querySelector('.form-submit');
  const originalLabel = submitBtn?.innerHTML;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('form-submit--loading');
    submitBtn.innerHTML = '<span aria-hidden="true" class="spinner"></span> Enviando...';
  }

  const newUser = {
    nombre: document.getElementById('nombre')?.value || '',
    nick: document.getElementById('nick')?.value || '',
    pass: document.getElementById('password')?.value || '',
    descripcion: document.getElementById('fn-descripcion')?.value || '',
    img: window._avatarData || ''
  };
  const savedUser = DataService.addUser(newUser);
  if (_afterRegister) _afterRegister();

  setTimeout(() => {
    form.reset();
    clearErrors();
    window._avatarData = '';
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('form-submit--loading');
      submitBtn.innerHTML = originalLabel;
    }
    showToast(`¡Listo, ${savedUser.nombre}! Te anotaste al viaje.`, 'success', formAnchor);
  }, 2000);

  return false;
}

export function initForm() {
  const form = document.getElementById('formContact');
  const toggle = document.getElementById('formModeToggle');
  if (form) form.addEventListener('submit', handleFormSubmit);
  if (toggle) {
    toggle.addEventListener('click', () => {
      setFormMode(formMode === 'registro' ? 'ingreso' : 'registro');
    });
  }
  setFormMode('registro');

  /* Real-time clear errors on input */
  Object.keys(FORM_VALIDATORS).forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', () => validateField(fieldId));
    }
  });

  /* Password toggle */
  const passwordToggle = document.querySelector('.password-toggle');
  const passwordInput = document.getElementById('password');
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      const icon = passwordToggle.querySelector('i');
      if (icon) icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
      passwordToggle.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
  }

  /* Avatar input */
  const avatarInput = document.getElementById('avatar');
  if (avatarInput) {
    window._avatarData = '';
    avatarInput.addEventListener('change', (e) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.getElementById('previewCanvas');
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          canvas.width = 150;
          canvas.height = 150;
          ctx.drawImage(img, 0, 0, 150, 150);
          window._avatarData = canvas.toDataURL('image/webp', 0.7);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    });
  }

  /* Clear form button */
  document.getElementById('btn_clear_form')?.addEventListener('click', () => {
    clearErrors();
    showToast('Formulario limpiado', 'warning', document.getElementById('form_section'));
  });
}
