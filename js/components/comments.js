import { DataService } from '../services/DataService.js';
import { showToast } from './toast.js';
import { escHtml } from '../utils.js';
import { getCurrentUser, setCurrentUser, doLogout } from './form.js';
import { openWallet, closeWallet } from './wallet.js';
import { showUserDetail } from './user.js';

const anchor = () => document.getElementById('muro-comentarios');

function formatDate(iso) {
  return new Date(iso).toLocaleString('es-UY', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

/* ========== RENDER COMMENT CARD ========== */
function renderCommentCard(c, options = {}) {
  const { isOwn = false, isEditing = false } = options;
  const fecha = formatDate(c.fecha);
  const avatarHtml = c.userImg
    ? `<img src="${c.userImg}" alt="" class="comentario-avatar" loading="lazy">`
    : `<div class="comentario-avatar-placeholder">${(c.userName || '?')[0]}</div>`;

  const ownClass = isOwn ? 'comentario-card--own' : '';

  if (isEditing) {
    return `
      <div class="comentario-card ${ownClass} comentario-card--editing" data-user-id="${c.userId}" data-comment-id="${c.id}">
        <div class="comentario-header">
          ${avatarHtml}
          <span class="comentario-author">${escHtml(c.userName)} <small>${c.userNick ? '@' + escHtml(c.userNick) : ''}</small></span>
          <span class="comentario-fecha">${fecha}</span>
        </div>
        <div class="comentario-edit-form">
          <textarea class="comentario-edit-input" rows="2" maxlength="500" aria-label="Editar comentario">${escHtml(c.texto)}</textarea>
          <div class="comentario-edit-actions">
            <span class="char-count"><span class="edit-char-count">${c.texto.length}</span>/500</span>
            <button class="comentario-btn-guardar" data-user-id="${c.userId}" data-comment-id="${c.id}" aria-label="Guardar cambios">
              <i class="fas fa-check" aria-hidden="true"></i> Guardar
            </button>
            <button class="comentario-btn-cancelar" data-user-id="${c.userId}" data-comment-id="${c.id}" aria-label="Cancelar edicion">
              <i class="fas fa-times" aria-hidden="true"></i> Cancelar
            </button>
          </div>
        </div>
      </div>`;
  }

  const editBtn = isOwn
    ? `<button class="comentario-btn-editar" data-user-id="${c.userId}" data-comment-id="${c.id}" aria-label="Editar comentario"><i class="fas fa-pen" aria-hidden="true"></i></button>`
    : '';
  const deleteBtn = isOwn
    ? `<button class="comentario-btn-eliminar" data-user-id="${c.userId}" data-comment-id="${c.id}" aria-label="Eliminar comentario"><i class="fas fa-times" aria-hidden="true"></i></button>`
    : '';

  return `
    <div class="comentario-card ${ownClass}" data-user-id="${c.userId}" data-comment-id="${c.id}" ${isOwn ? 'aria-label="Tu comentario"' : ''}>
      <div class="comentario-header">
        ${avatarHtml}
        <span class="comentario-author">${escHtml(c.userName)} <small>${c.userNick ? '@' + escHtml(c.userNick) : ''}</small></span>
        <span class="comentario-fecha">${fecha}</span>
      </div>
      <div class="comentario-texto">${escHtml(c.texto)}</div>
      ${(editBtn || deleteBtn) ? `<div class="comentario-acciones">${editBtn}${deleteBtn}</div>` : ''}
    </div>`;
}

/* ========== RENDER MY COMMENTS ========== */
function renderMisComentarios() {
  const container = document.getElementById('comentarios-mis-lista');
  const wrapper = document.getElementById('comentarios-mis-comentarios');
  if (!container || !wrapper) return;
  const user = getCurrentUser();
  if (!user) { wrapper.style.display = 'none'; return; }

  const mine = DataService.getUserComments(user.id).reverse();

  if (mine.length === 0) {
    container.innerHTML = '<div class="comentarios-empty">Aun no tenes comentarios publicados.</div>';
    wrapper.style.display = 'block';
    return;
  }

  const enriched = mine.map(c => ({
    ...c,
    userId: user.id,
    userName: user.nombre,
    userNick: user.nick || '',
    userImg: user.img || ''
  }));

  container.innerHTML = enriched.map(c => renderCommentCard(c, { isOwn: true })).join('');
  attachCommentListeners(container, true);
  wrapper.style.display = 'block';
}

/* ========== RENDER ALL COMMENTS ========== */
function renderAllComments() {
  const container = document.getElementById('comentarios-lista');
  if (!container) return;
  const items = DataService.getAllCommentsFlat();

  if (items.length === 0) {
    container.innerHTML = '<div class="comentarios-empty">Aun no hay comentarios. Se el primero!</div>';
    return;
  }

  const user = getCurrentUser();
  container.innerHTML = items.map(c => {
    const isOwn = user && user.id === c.userId;
    return renderCommentCard(c, { isOwn });
  }).join('');

  attachCommentListeners(container, false);
}

/* ========== ATTACH LISTENERS ========== */
function attachCommentListeners(container, isOwnSection) {
  container.querySelectorAll('.comentario-btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = Number(btn.dataset.userId);
      const commentId = Number(btn.dataset.commentId);
      if (!confirm('Eliminar este comentario?')) return;
      DataService.removeUserComment(userId, commentId);
      renderMisComentarios();
      renderAllComments();
      showToast('Comentario eliminado.', 'info', anchor());
    });
  });

  container.querySelectorAll('.comentario-btn-editar').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = Number(btn.dataset.userId);
      const commentId = Number(btn.dataset.commentId);
      startEditing(userId, commentId);
    });
  });
}

/* ========== START EDITING ========== */
function startEditing(userId, commentId) {
  const user = DataService.getUserById(userId);
  if (!user) return;
  const comment = (user.comentarios || []).find(c => c.id === commentId);
  if (!comment) return;

  const card = document.querySelector(`.comentario-card[data-user-id="${userId}"][data-comment-id="${commentId}"]`);
  if (!card) return;

  const currentUser = getCurrentUser();
  const isOwn = currentUser && currentUser.id === userId;
  card.outerHTML = renderCommentCard({ ...comment, userId, userName: user.nombre, userNick: user.nick || '', userImg: user.img || '' }, { isOwn, isEditing: true });

  const editCard = document.querySelector(`.comentario-card[data-user-id="${userId}"][data-comment-id="${commentId}"]`);
  if (!editCard) return;

  const textarea = editCard.querySelector('.comentario-edit-input');
  const charCount = editCard.querySelector('.edit-char-count');
  if (textarea) {
    textarea.focus();
    textarea.addEventListener('input', () => {
      if (charCount) charCount.textContent = textarea.value.length;
    });
  }

  editCard.querySelector('.comentario-btn-cancelar')?.addEventListener('click', () => {
    renderMisComentarios();
    renderAllComments();
  });

  editCard.querySelector('.comentario-btn-guardar')?.addEventListener('click', () => {
    const newText = textarea?.value.trim();
    if (!newText) { showToast('El comentario no puede estar vacio.', 'error', anchor()); return; }
    if (newText.length > 500) { showToast('Maximo 500 caracteres.', 'error', anchor()); return; }
    DataService.updateUserComment(userId, commentId, newText);
    renderMisComentarios();
    renderAllComments();
    showToast('Comentario actualizado.', 'success', anchor());
  });
}

/* ========== UPDATE LOGIN STATE ========== */
function updateLoginState() {
  const user = getCurrentUser();
  const notLoggedIn = document.getElementById('comentarios-not-logged-in');
  const userPanel = document.getElementById('user-panel');
  const panelComments = document.getElementById('panel-content-comments');
  const panelWallet = document.getElementById('panel-content-wallet');
  const panelUserName = document.getElementById('panel-user-name');
  const panelUserNick = document.getElementById('panel-user-nick');
  const panelUserAvatar = document.getElementById('panel-user-avatar');

  if (user) {
    if (notLoggedIn) notLoggedIn.style.display = 'none';
    if (userPanel) userPanel.style.display = 'flex';
    if (panelComments) panelComments.style.display = 'block';
    if (panelWallet) panelWallet.style.display = 'none';
    if (panelUserName) panelUserName.textContent = user.nombre;
    if (panelUserNick) panelUserNick.textContent = user.nick ? '@' + user.nick : '';
    if (panelUserAvatar) {
      if (user.img) {
        panelUserAvatar.innerHTML = `<img src="${user.img}" alt="" class="user-panel-avatar-img" loading="lazy">`;
      } else {
        panelUserAvatar.innerHTML = `<div class="user-panel-avatar-placeholder">${(user.nombre || '?')[0]}</div>`;
      }
    }
    closeWallet();
    renderMisComentarios();
  } else {
    if (notLoggedIn) notLoggedIn.style.display = 'flex';
    if (userPanel) userPanel.style.display = 'none';
    if (panelComments) panelComments.style.display = 'none';
    if (panelWallet) panelWallet.style.display = 'none';
  }
}

/* ========== INIT ========== */
export function initComments() {
  const publishBtn = document.getElementById('comment-publish-btn');
  const textInput = document.getElementById('comment-text-input');
  const charCount = document.getElementById('comment-char-count');
  const registerBtn = document.getElementById('comentarios-register-btn');
  const panelBtnComments = document.getElementById('panel-btn-comments');
  const panelBtnWallet = document.getElementById('panel-btn-wallet');
  const panelBtnEdit = document.getElementById('panel-btn-edit');
  const panelBtnLogout = document.getElementById('panel-btn-logout');

  /* Character counter */
  if (textInput && charCount) {
    textInput.addEventListener('input', () => {
      charCount.textContent = textInput.value.length;
    });
  }

  /* Publish comment */
  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      const user = getCurrentUser();
      if (!user) { showToast('Ingresa para comentar.', 'warning', anchor()); return; }
      const texto = textInput?.value.trim();
      if (!texto) { showToast('Escribi algo para publicar.', 'warning', anchor()); return; }
      if (texto.length > 500) { showToast('Maximo 500 caracteres.', 'error', anchor()); return; }
      DataService.addUserComment(user.id, texto);
      if (textInput) textInput.value = '';
      if (charCount) charCount.textContent = '0';
      renderMisComentarios();
      renderAllComments();
      showToast('Comentario publicado.', 'success', anchor());
    });
  }

  /* Register button */
  if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('form_section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* Panel buttons */
  if (panelBtnComments) {
    panelBtnComments.addEventListener('click', () => {
      const panelComments = document.getElementById('panel-content-comments');
      const panelWallet = document.getElementById('panel-content-wallet');
      if (panelComments) panelComments.style.display = 'block';
      if (panelWallet) panelWallet.style.display = 'none';
      closeWallet();
      panelBtnComments.classList.add('active');
      if (panelBtnWallet) panelBtnWallet.classList.remove('active');
    });
  }

  if (panelBtnWallet) {
    panelBtnWallet.addEventListener('click', () => {
      const user = getCurrentUser();
      if (!user) return;
      openWallet(user);
      panelBtnWallet.classList.add('active');
      if (panelBtnComments) panelBtnComments.classList.remove('active');
    });
  }

  if (panelBtnEdit) {
    panelBtnEdit.addEventListener('click', () => {
      const user = getCurrentUser();
      if (!user) return;
      showUserDetail(user.id, true);
    });
  }

  if (panelBtnLogout) {
    panelBtnLogout.addEventListener('click', () => {
      doLogout();
      updateLoginState();
      renderAllComments();
      showToast('Sesion cerrada. Hasta la proxima!', 'info', anchor());
    });
  }

  updateLoginState();
  renderAllComments();
}

/* ========== REFRESH (called on login/logout) ========== */
export function refreshComments() {
  updateLoginState();
  renderAllComments();
}
