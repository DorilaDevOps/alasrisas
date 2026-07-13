import { DataService } from '../services/DataService.js';
import { WalletService } from '../services/WalletService.js';
import { showToast } from './toast.js';
import { escHtml } from '../utils.js';
import { getCurrentUser, setCurrentUser } from './form.js';

let _updateStatsRef = null;
let _renderUsersRef = null;
let _onLogoutCallback = null;

export function setStatsCallbacks(cbs) { _updateStatsRef = cbs.updateStats; _renderUsersRef = cbs.renderUsers; }
export function setWalletLogoutCallback(fn) { _onLogoutCallback = fn; }

function walletAnchor() {
  return document.getElementById('muro-comentarios') || document.getElementById('wallet-section');
}

/* ========== WALLET ========== */
export function openWallet(user) {
  setCurrentUser(user);
  const contentComments = document.getElementById('panel-content-comments');
  const contentWallet = document.getElementById('panel-content-wallet');
  if (contentComments) contentComments.style.display = 'none';
  if (contentWallet) contentWallet.style.display = 'block';
  renderWallet(user);
  const section = document.getElementById('wallet-section');
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function closeWallet() {
  toggleEditMode(false);
  const contentComments = document.getElementById('panel-content-comments');
  const contentWallet = document.getElementById('panel-content-wallet');
  if (contentComments) contentComments.style.display = 'block';
  if (contentWallet) contentWallet.style.display = 'none';
  const input = document.getElementById('wallet-amount');
  if (input) input.value = '';
  const btnEdit = document.getElementById('btn-edit-profile');
  const profileForm = document.getElementById('profile-edit-form');
  if (profileForm) profileForm.style.display = 'none';
  if (btnEdit) {
    btnEdit.innerHTML = '<i class="fas fa-pen" aria-hidden="true"></i>';
    btnEdit.setAttribute('aria-label', 'Editar perfil');
  }
}

function renderWallet(user) {
  const wallet = WalletService.getWallet(user.id);
  const perUser = WalletService.getPerUserAmount();
  const pending = perUser - wallet.totalAcumulado;

  const nameEl = document.getElementById('wallet-user-name');
  if (nameEl) {
    const capitalName = user.nombre.charAt(0).toUpperCase() + user.nombre.slice(1);
    nameEl.innerHTML = `Billetera <small>de ${escHtml(capitalName)}</small>`;
  }

  const totalEl = document.getElementById('wallet-total');
  if (totalEl) totalEl.textContent = `$${wallet.totalAcumulado.toLocaleString('es-UY')}`;

  const pendingEl = document.getElementById('wallet-pending');
  if (pendingEl) pendingEl.textContent = `$${Math.max(0, pending).toLocaleString('es-UY')}`;

  const metaEl = document.getElementById('wallet-meta');
  if (metaEl) metaEl.textContent = `$${perUser.toLocaleString('es-UY')}`;

  renderHistory(wallet.historial);
}

function renderHistory(historial) {
  const container = document.getElementById('wallet-history-body');
  if (!container) return;
  if (!historial || historial.length === 0) {
    container.innerHTML = '<div class="history-empty">Aun no hay transacciones registradas.</div>';
    return;
  }
  const sorted = [...historial].reverse();
  let html = '<table><thead><tr><th>Fecha</th><th>Tipo</th><th>Monto</th></tr></thead><tbody>';
  sorted.forEach(tx => {
    const date = new Date(tx.fecha).toLocaleString('es-UY', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
    const isAdd = tx.tipo === 'agregar';
    const badge = isAdd ? 'wallet-badge-add' : 'wallet-badge-withdraw';
    const text = isAdd ? 'Agrega' : 'Retira';
    const sign = isAdd ? '+' : '\u2212';
    html += `<tr><td>${date}</td><td><span class="${badge}">${text}</span></td><td style="font-weight:600;color:${isAdd ? 'var(--success)' : 'var(--error)'}">${sign}$${Math.abs(tx.monto).toLocaleString('es-UY')}</td></tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

function doTransaction(tipo) {
  const user = getCurrentUser();
  if (!user) { showToast('Inicia sesion primero.', 'error', walletAnchor()); return; }
  const input = document.getElementById('wallet-amount');
  const amount = parseInt(input.value, 10);
  if (!amount || isNaN(amount) || amount < 1) {
    showToast('Ingresa un monto valido mayor a $0.', 'error', walletAnchor());
    return;
  }
  const wallet = WalletService.getWallet(user.id);
  if (tipo === 'retirar') {
    if (amount > wallet.totalAcumulado) {
      showToast('No podes retirar mas de lo que tenes acumulado.', 'error', walletAnchor());
      return;
    }
    WalletService.addTransaction(user.id, -amount, 'retirar');
    showToast(`Retiraste $${amount.toLocaleString('es-UY')} de tu billetera.`, 'success', walletAnchor());
  } else {
    WalletService.addTransaction(user.id, amount, 'agregar');
    showToast(`Agregaste $${amount.toLocaleString('es-UY')} a tu billetera.`, 'success', walletAnchor());
  }
  input.value = '';
  renderWallet(getCurrentUser());
  if (_updateStatsRef) _updateStatsRef();
}

/* ========== EDIT MODE ========== */
function toggleEditMode(active) {
  const profileForm = document.getElementById('profile-edit-form');
  if (active) {
    if (profileForm) profileForm.style.display = 'flex';
  } else {
    if (profileForm) profileForm.style.display = 'none';
  }
}

/* ========== PROFILE EDIT ========== */
export function initProfileEdit() {
  const btnEdit = document.getElementById('btn-edit-profile');
  const profileForm = document.getElementById('profile-edit-form');
  if (!btnEdit || !profileForm) return;

  const editIcon = '<i class="fas fa-pen" aria-hidden="true"></i>';
  const closeIcon = '<i class="fas fa-times" aria-hidden="true"></i>';

  btnEdit.addEventListener('click', () => {
    const isOpen = profileForm.style.display !== 'none';
    profileForm.style.display = isOpen ? 'none' : 'flex';
    btnEdit.innerHTML = isOpen ? editIcon : closeIcon;
    btnEdit.setAttribute('aria-label', isOpen ? 'Editar perfil' : 'Cerrar edicion');
    if (isOpen) return;
    const user = getCurrentUser();
    if (!user) return;
    const nameInput = document.getElementById('edit-profile-name');
    const nickInput = document.getElementById('edit-profile-nick');
    const descInput = document.getElementById('edit-profile-descripcion');
    const passInput = document.getElementById('edit-profile-pass');
    if (nameInput) nameInput.value = user.nombre || '';
    if (nickInput) nickInput.value = user.nick || '';
    if (descInput) descInput.value = user.descripcion || '';
    if (passInput) passInput.value = '';
  });

  document.getElementById('save-profile-edit')?.addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) return;
    const name = document.getElementById('edit-profile-name')?.value.trim() || '';
    const nick = document.getElementById('edit-profile-nick')?.value || '';
    const descripcion = document.getElementById('edit-profile-descripcion')?.value || '';
    const pass = document.getElementById('edit-profile-pass')?.value || '';
    if (!name || name.length < 2) {
      showToast('El nombre debe tener al menos 2 caracteres.', 'error', walletAnchor());
      return;
    }
    const effectivePass = (pass.length >= 1 && pass.length <= 4) ? pass : user.pass;
    const allUsers = DataService.getAll();
    const conflict = allUsers.find(u =>
      u.id !== user.id &&
      u.nombre.toLowerCase() === name.toLowerCase() &&
      u.pass === effectivePass
    );
    if (conflict) {
      showToast('Ya existe otro usuario con ese nombre y contrasena.', 'error', walletAnchor());
      return;
    }
    const data = { nombre: name, nick, descripcion };
    if (pass.length >= 1 && pass.length <= 4) data.pass = pass;
    DataService.updateUser(user.id, data);
    setCurrentUser(DataService.getUserById(user.id));
    showToast('Perfil actualizado.', 'success', walletAnchor());
    renderWallet(getCurrentUser());
    if (_renderUsersRef) _renderUsersRef();
    profileForm.style.display = 'none';
    btnEdit.innerHTML = editIcon;
    btnEdit.setAttribute('aria-label', 'Editar perfil');
  });

  document.getElementById('cancel-profile-edit')?.addEventListener('click', () => {
    profileForm.style.display = 'none';
    btnEdit.innerHTML = editIcon;
    btnEdit.setAttribute('aria-label', 'Editar perfil');
  });
}

/* ========== WALLET EVENT LISTENERS ========== */
export function initWalletListeners() {
  document.getElementById('wallet-btn-add')?.addEventListener('click', () => doTransaction('agregar'));
  document.getElementById('wallet-btn-withdraw')?.addEventListener('click', () => doTransaction('retirar'));

  document.getElementById('wallet-logout-btn')?.addEventListener('click', () => {
    const user = getCurrentUser();
    closeWallet();
    if (_onLogoutCallback) _onLogoutCallback();
    showToast('Sesion cerrada. Hasta la proxima!', 'info', walletAnchor());
  });

  document.getElementById('wallet-delete-btn')?.addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) return;
    if (!confirm(`Eliminar tu usuario "${user.nombre}"?\nSe borrarán tus datos. No se puede deshacer.`)) return;
    DataService.removeUser(user.id);
    closeWallet();
    if (_onLogoutCallback) _onLogoutCallback();
    showToast('Usuario eliminado.', 'info');
    if (_updateStatsRef) _updateStatsRef();
    if (_renderUsersRef) _renderUsersRef();
  });

  document.getElementById('wallet-amount')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doTransaction('agregar');
  });
}
