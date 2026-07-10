import { DataService } from '../services/DataService.js';
import { WalletService } from '../services/WalletService.js';
import { ComentariosService } from '../services/ComentariosService.js';
import { showToast } from './toast.js';
import { escHtml } from '../utils.js';
import { getCurrentUser, setCurrentUser } from './form.js';

const walletAnchor = () => document.getElementById('wallet-section');

let _updateStatsRef = null;
let _renderUsersRef = null;
export function setStatsCallbacks(cbs) { _updateStatsRef = cbs.updateStats; _renderUsersRef = cbs.renderUsers; }

/* ========== WALLET ========== */
export function openWallet(user) {
  setCurrentUser(user);
  const section = document.getElementById('wallet-section');
  if (!section) return;
  section.classList.add('is-active');
  renderWallet(user);
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  renderComentarios();
}

export function closeWallet() {
  setCurrentUser(null);
  toggleEditMode(false);
  const section = document.getElementById('wallet-section');
  if (section) section.classList.remove('is-active');
  const input = document.getElementById('wallet-amount');
  if (input) input.value = '';
  const btnEdit = document.getElementById('btn-edit-profile');
  const profileForm = document.getElementById('profile-edit-form');
  const walletComments = document.getElementById('wallet-comments');
  if (profileForm) profileForm.style.display = 'none';
  if (walletComments) walletComments.style.display = 'none';
  if (btnEdit) {
    btnEdit.innerHTML = '<i class="fas fa-pen" aria-hidden="true"></i>';
    btnEdit.setAttribute('aria-label', 'Editar perfil');
  }
  renderComentarios();
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
    container.innerHTML = '<div class="history-empty">Aún no hay transacciones registradas.</div>';
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
  if (!user) { showToast('Iniciá sesión primero.', 'error', walletAnchor()); return; }
  const input = document.getElementById('wallet-amount');
  const amount = parseInt(input.value, 10);
  if (!amount || isNaN(amount) || amount < 1) {
    showToast('Ingresá un monto válido mayor a $0.', 'error', walletAnchor());
    return;
  }
  const wallet = WalletService.getWallet(user.id);
  const perUser = WalletService.getPerUserAmount();
  if (tipo === 'retirar') {
    if (amount > wallet.totalAcumulado) {
      showToast('No podés retirar más de lo que tenés acumulado.', 'error', walletAnchor());
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

/* ========== COMENTARIOS ========== */
export function renderComentarios() {
  const lista = document.getElementById('comentarios-lista');
  if (!lista) return;
  const items = ComentariosService.getAll();
  if (items.length === 0) {
    lista.innerHTML = '<div class="comentarios-empty">Aún no hay comentarios. ¡Sé el primero!</div>';
    return;
  }
  const sorted = [...items].reverse();
  const user = getCurrentUser();
  let html = '';
  sorted.forEach(c => {
    const fecha = new Date(c.fecha).toLocaleString('es-UY', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const avatarHtml = c.userImg
      ? `<img src="${c.userImg}" alt="" class="comentario-avatar" loading="lazy">`
      : `<div class="comentario-avatar-placeholder">${(c.userName || '?')[0]}</div>`;
    const isOwn = user && user.id === c.userId;
    const ownClass = isOwn ? 'comentario-card--own' : '';
    const deleteBtn = isOwn
      ? `<button class="comentario-btn-eliminar" data-comentario-id="${c.id}" aria-label="Eliminar comentario"><i class="fas fa-times" aria-hidden="true"></i></button>`
      : '';
    html += `
      <div class="comentario-card ${ownClass}" ${isOwn ? 'aria-label="Tu comentario"' : ''}>
        <div class="comentario-header">
          ${avatarHtml}
          <span class="comentario-author">${escHtml(c.userName)} <small>${c.userNick ? '@' + escHtml(c.userNick) : ''}</small></span>
          <span class="comentario-fecha">${fecha}</span>
        </div>
        <div class="comentario-texto">${escHtml(c.texto)}</div>
        ${deleteBtn ? `<div class="comentario-acciones">${deleteBtn}</div>` : ''}
      </div>`;
  });
  lista.innerHTML = html;
  lista.querySelectorAll('.comentario-btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => {
      ComentariosService.remove(Number(btn.dataset.comentarioId));
      renderComentarios();
    });
  });
}

/* ========== EDIT MODE ========== */
function renderWalletComentarios() {
  const list = document.getElementById('wallet-comments-list');
  if (!list) return;
  const user = getCurrentUser();
  if (!user) { list.innerHTML = ''; return; }
  const all = ComentariosService.getAll();
  const mine = all.filter(c => c.userId === user.id).reverse();
  if (mine.length === 0) {
    list.innerHTML = '<div class="wallet-comments-empty">Aún no tenés comentarios publicados.</div>';
    return;
  }
  let html = '';
  mine.forEach(c => {
    const fecha = new Date(c.fecha).toLocaleString('es-UY', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    html += `
      <div class="wallet-comment-card">
        <div class="wallet-comment-card-header">
          <span class="wallet-comment-card-fecha">${fecha}</span>
          <button class="comentario-btn-eliminar" data-comentario-id="${c.id}" aria-label="Eliminar comentario">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div class="wallet-comment-card-texto">${escHtml(c.texto)}</div>
      </div>`;
  });
  list.innerHTML = html;
  list.querySelectorAll('.comentario-btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => {
      ComentariosService.remove(Number(btn.dataset.comentarioId));
      renderWalletComentarios();
      renderComentarios();
    });
  });
}

function toggleEditMode(active) {
  const walletComments = document.getElementById('wallet-comments');
  if (active) {
    if (walletComments) walletComments.style.display = 'block';
    renderWalletComentarios();
  } else {
    if (walletComments) walletComments.style.display = 'none';
  }
  renderComentarios();
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
    btnEdit.setAttribute('aria-label', isOpen ? 'Editar perfil' : 'Cerrar edición');
    toggleEditMode(!isOpen);
    if (isOpen) return;
    const user = getCurrentUser();
    if (!user) return;
    const nameInput = document.getElementById('edit-profile-name');
    const nickInput = document.getElementById('edit-profile-nick');
    const comentarioInput = document.getElementById('edit-profile-comentario');
    const passInput = document.getElementById('edit-profile-pass');
    if (nameInput) nameInput.value = user.nombre || '';
    if (nickInput) nickInput.value = user.nick || '';
    if (comentarioInput) comentarioInput.value = user.comentario || '';
    if (passInput) passInput.value = '';
  });

  document.getElementById('save-profile-edit')?.addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) return;
    const name = document.getElementById('edit-profile-name')?.value.trim() || '';
    const nick = document.getElementById('edit-profile-nick')?.value || '';
    const comentario = document.getElementById('edit-profile-comentario')?.value || '';
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
      showToast('Ya existe otro usuario con ese nombre y contraseña.', 'error', walletAnchor());
      return;
    }
    const data = { nombre: name };
    if (nick) data.nick = nick;
    if (comentario) data.comentario = comentario;
    if (pass.length >= 1 && pass.length <= 4) data.pass = pass;
    DataService.updateUser(user.id, data);
    ComentariosService.updateUserName(user.id, name);
    setCurrentUser(DataService.getUserById(user.id));
    showToast('Perfil actualizado.', 'success', walletAnchor());
    renderWallet(getCurrentUser());
    if (_renderUsersRef) _renderUsersRef();
    profileForm.style.display = 'none';
    btnEdit.innerHTML = editIcon;
    btnEdit.setAttribute('aria-label', 'Editar perfil');
    toggleEditMode(false);
  });

  document.getElementById('cancel-profile-edit')?.addEventListener('click', () => {
    profileForm.style.display = 'none';
    btnEdit.innerHTML = editIcon;
    btnEdit.setAttribute('aria-label', 'Editar perfil');
    toggleEditMode(false);
  });
}

/* ========== WALLET EVENT LISTENERS ========== */
export function initWalletListeners() {
  document.getElementById('wallet-btn-add')?.addEventListener('click', () => doTransaction('agregar'));
  document.getElementById('wallet-btn-withdraw')?.addEventListener('click', () => doTransaction('retirar'));

  document.getElementById('wallet-logout-btn')?.addEventListener('click', () => {
    closeWallet();
    showToast('Sesión cerrada. ¡Hasta la próxima!', 'info', walletAnchor());
  });

  document.getElementById('wallet-delete-btn')?.addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) return;
    if (!confirm(`¿Eliminar tu usuario "${user.nombre}"?\nSe borrarán tus comentarios y billetera. No se puede deshacer.`)) return;
    ComentariosService.removeByUser(user.id);
    DataService.removeUser(user.id);
    closeWallet();
    showToast('Usuario eliminado.', 'info');
    if (_updateStatsRef) _updateStatsRef();
    if (_renderUsersRef) _renderUsersRef();
  });

  document.getElementById('wallet-amount')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doTransaction('agregar');
  });

  /* Wallet comment character counter */
  const walletCommentInput = document.getElementById('wallet-comment-text');
  const walletCharCount = document.getElementById('wallet-comment-char-count');
  if (walletCommentInput && walletCharCount) {
    walletCommentInput.addEventListener('input', () => {
      walletCharCount.textContent = walletCommentInput.value.length;
    });
  }

  /* Wallet comment submission */
  document.getElementById('btn-wallet-enviar-comentario')?.addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) { showToast('Iniciá sesión para comentar.', 'warning', walletAnchor()); return; }
    const input = document.getElementById('wallet-comment-text');
    const texto = input?.value.trim();
    if (!texto) { showToast('Escribí algo para publicar.', 'warning', walletAnchor()); return; }
    ComentariosService.add({
      userId: user.id,
      userName: user.nombre,
      userNick: user.nick || '',
      userImg: user.img || '',
      texto
    });
    if (input) {
      input.value = '';
      if (walletCharCount) walletCharCount.textContent = '0';
    }
    renderWalletComentarios();
    renderComentarios();
    showToast('Comentario publicado.', 'success', walletAnchor());
  });
}
