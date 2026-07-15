import { DataService } from '../services/DataService.js';
import { WalletService } from '../services/WalletService.js';
import { showToast } from './toast.js';
import { escHtml } from '../utils.js';
import { getCurrentUser, setCurrentUser, doLogout } from './form.js';

let _updateStatsRef = null;
let _renderUsersRef = null;
let _onLogoutCallback = null;

export function setStatsCallbacks(cbs) { _updateStatsRef = cbs.updateStats; _renderUsersRef = cbs.renderUsers; }
export function setWalletLogoutCallback(fn) { _onLogoutCallback = fn; }

function walletAnchor() {
  return document.getElementById('muro-comentarios') || document.getElementById('wallet-section');
}

export function openWallet(user) {
  setCurrentUser(user);
  const contentComments = document.getElementById('panel-content-comments');
  const contentWallet = document.getElementById('panel-content-wallet');
  const contentEdit = document.getElementById('panel-content-edit');
  if (contentComments) contentComments.style.display = 'none';
  if (contentEdit) contentEdit.style.display = 'none';
  if (contentWallet) contentWallet.style.display = 'block';
  const section = document.getElementById('wallet-section');
  if (section) section.classList.add('is-active');
  renderWallet(user);
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function closeWallet() {
  const contentComments = document.getElementById('panel-content-comments');
  const contentWallet = document.getElementById('panel-content-wallet');
  if (contentComments) contentComments.style.display = 'block';
  if (contentWallet) contentWallet.style.display = 'none';
  const section = document.getElementById('wallet-section');
  if (section) section.classList.remove('is-active');
  const input = document.getElementById('wallet-amount');
  if (input) input.value = '';
}

async function renderWallet(user) {
  const wallet = await WalletService.getWallet(user.id);
  const perUser = await WalletService.getPerUserAmount();
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

async function doTransaction(tipo) {
  const user = getCurrentUser();
  if (!user) { showToast('Inicia sesion primero.', 'error', walletAnchor()); return; }
  const input = document.getElementById('wallet-amount');
  const amount = parseInt(input.value, 10);
  if (!amount || isNaN(amount) || amount < 1) {
    showToast('Ingresa un monto valido mayor a $0.', 'error', walletAnchor());
    return;
  }
  const wallet = await WalletService.getWallet(user.id);
  const perUser = await WalletService.getPerUserAmount();
  const pending = perUser - wallet.totalAcumulado;

  if (tipo === 'retirar') {
    if (amount > wallet.totalAcumulado) {
      showToast('No podes retirar mas de lo que tenes acumulado.', 'error', walletAnchor());
      return;
    }
    await WalletService.addTransaction(user.id, -amount, 'retirar');
    showToast(`Retiraste $${amount.toLocaleString('es-UY')} de tu billetera.`, 'success', walletAnchor());
  } else {
    if (pending > 0 && amount > pending) {
      showToast('El monto no puede superar el saldo pendiente.', 'error', walletAnchor());
      return;
    }
    await WalletService.addTransaction(user.id, amount, 'agregar');
    showToast(`Agregaste $${amount.toLocaleString('es-UY')} a tu billetera.`, 'success', walletAnchor());
  }
  input.value = '';
  await renderWallet(getCurrentUser());
  if (_updateStatsRef) _updateStatsRef();
}

export function initWalletListeners() {
  document.getElementById('wallet-btn-add')?.addEventListener('click', () => doTransaction('agregar'));
  document.getElementById('wallet-btn-withdraw')?.addEventListener('click', () => doTransaction('retirar'));

  document.getElementById('wallet-delete-btn')?.addEventListener('click', async () => {
    const user = getCurrentUser();
    if (!user) return;
    if (!confirm(`Eliminar tu usuario "${user.nombre}"?\nSe borrarán tus datos. No se puede deshacer.`)) return;
    await DataService.removeUser(user.id);
    doLogout();
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
