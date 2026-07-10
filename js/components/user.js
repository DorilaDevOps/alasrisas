import { DataService } from '../services/DataService.js';
import { WalletService } from '../services/WalletService.js';
import { escHtml, lockScroll, unlockScroll } from '../utils.js';
import { showToast } from './toast.js';
import { getCurrentUser, setCurrentUser } from './form.js';

/* ========== INIT COUNT UP ========== */
function initCountUp(el, target, duration) {
  duration = duration || 800;
  const start = performance.now();
  const initial = parseInt(el.textContent, 10) || 0;
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(initial + (target - initial) * eased);
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ========== UPDATE STATS ========== */
export function updateStats() {
  const total = DataService.getTotal();
  const el = document.getElementById('stat-total');
  if (el) initCountUp(el, total);

  const meta = WalletService.getMeta();
  const perUser = WalletService.getPerUserAmount();
  const metaEl = document.getElementById('stat-meta');
  const cuotaEl = document.getElementById('stat-cuota');
  if (metaEl) metaEl.textContent = `$${meta.valor.toLocaleString('es-UY')}`;
  if (cuotaEl) cuotaEl.textContent = `$${perUser.toLocaleString('es-UY')}`;
}

/* ========== RENDER USERS ========== */
export function renderUsers() {
  const users = DataService.getAll();
  const tbody = document.getElementById('amigosBody');
  const empty = document.getElementById('amigosEmpty');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (users.length === 0) { if (empty) empty.style.display = 'block'; return; }
  if (empty) empty.style.display = 'none';

  users.forEach(u => {
    const tr = document.createElement('tr');
    const avatarHtml = u.img
      ? `<img src="${u.img}" alt="" class="user-avatar-thumb" loading="lazy">`
      : '<span style="opacity:0.4">\u2014</span>';
    tr.innerHTML = `
      <td>${avatarHtml}</td>
      <td>${escHtml(u.nombre)}</td>
      <td>${escHtml(u.nick || '\u2014')}</td>
      <td><button class="btn-sm" data-user-id="${u.id}" data-action="view">Ver</button></td>`;
    tbody.appendChild(tr);
  });
}

/* ========== SHOW USER DETAIL (MODAL) ========== */
export function showUserDetail(id, isEditMode) {
  const user = DataService.getUserById(id);
  const modalBody = document.getElementById('modalBody');
  const modal = document.getElementById('userModal');
  if (!user || !modalBody || !modal) return;

  const avatarHtml = user.img
    ? `<img src="${user.img}" alt="Avatar de ${escHtml(user.nombre)}" loading="lazy">`
    : `<div style="width:100px;height:100px;border-radius:50%;background:var(--color-surface);
        display:flex;align-items:center;justify-content:center;font-size:2.5rem;
        color:var(--color-text-muted);text-shadow:-1px 2px 3px var(--color-text);">
        <i class="fas fa-user"></i></div>`;
  const fechaHtml = user.fecha
    ? `<p style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin:0.5rem 0 0">Se unió: ${new Date(user.fecha).toLocaleDateString('es-UY')}</p>`
    : '';

  if (isEditMode) {
    const title = document.getElementById('modalTitle');
    if (title) title.textContent = 'Editar mis datos';
    modalBody.innerHTML = `
      <div class="user-detail">${avatarHtml}
        <p style="font-weight:700;font-size:var(--font-size-lg);margin:0.5rem 0 0.25rem">${escHtml(user.nombre)}</p>
        <p style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin:0 0 0.75rem">Contraseña: ${escHtml(user.pass || '')}</p>
        <div class="form-field" style="margin-bottom:0.75rem">
          <label for="editNick" style="font-weight:600;display:block;margin-bottom:0.25rem">Nick</label>
          <input type="text" id="editNick" value="${escHtml(user.nick || '')}" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid var(--color-border);background:var(--color-surface);color:var(--color-text)">
        </div>
        <div class="comentario-section">
          <label for="editComentario" style="font-weight:600;display:block;margin-bottom:0.25rem">Comentario</label>
          <textarea id="editComentario" rows="3" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid var(--color-border);background:var(--color-surface);color:var(--color-text);resize:vertical">${escHtml(user.comentario || '')}</textarea>
          <button id="saveEditUser" class="btn-save-modal" data-user-id="${user.id}">💾 Guardar cambios</button>
        </div>${fechaHtml}</div>`;
    modal.classList.add('is-open');
    lockScroll();
    document.getElementById('saveEditUser')?.addEventListener('click', () => {
      const nick = document.getElementById('editNick')?.value || '';
      const comentario = document.getElementById('editComentario')?.value || '';
      DataService.updateUser(user.id, { nick, comentario });
      renderUsers();
      const btn = document.getElementById('saveEditUser');
      if (btn) { btn.textContent = '¡Guardado!'; setTimeout(() => { btn.textContent = 'Guardar cambios'; }, 2000); }
    });
  } else {
    const title = document.getElementById('modalTitle');
    if (title) title.textContent = 'Detalle del viajero';
    modalBody.innerHTML = `
      <div class="user-detail">${avatarHtml}
        <p style="font-weight:700;font-size:var(--font-size-lg);margin:0.5rem 0 0.25rem">${escHtml(user.nombre)}</p>
        <p style="font-size:var(--font-size-base);color:var(--color-text-muted);margin:0 0 0.25rem">${escHtml(user.nick ? '@' + user.nick : '')}</p>
        <p style="font-size:var(--font-size-sm);margin:0">Contraseña: ${escHtml(user.pass || 'Sin contraseña')}</p>
        ${user.comentario ? `<p style="font-size:var(--font-size-sm);color:var(--color-accent);margin:0.5rem 0 0">\u201C${escHtml(user.comentario)}\u201D</p>` : ''}
        ${fechaHtml}</div>`;
    modal.classList.add('is-open');
    lockScroll();
  }
}

/* ========== SEED DATA ========== */
export function initSeedData() {
  if (!localStorage.getItem(DataService.STORAGE_KEY)) {
    const seed = [
      { id: 1, nombre: 'Andres', nick: 'Loco', pass: '123', comentario: '¡Vamos que nos vamos!', img: '', rol: 'usuario', fecha: new Date(Date.now() - 86400000).toISOString() },
      { id: 2, nombre: 'Conde', nick: 'chikisuel', pass: '1122', comentario: 'Llevo la pelota', img: '', rol: 'usuario', fecha: new Date(Date.now() - 43200000).toISOString() }
    ];
    localStorage.setItem(DataService.STORAGE_KEY, JSON.stringify(seed));
  }

  if (!localStorage.getItem('viaje_amigos_comentarios')) {
    const seedComments = [
      { id: 1001, userId: 1, userName: 'Andres', userNick: 'Loco', userImg: '', texto: '¡Vamos que nos vamos! Ya falta menos 💪', fecha: new Date(Date.now() - 86400000).toISOString() },
      { id: 1002, userId: 2, userName: 'Conde', userNick: 'chikisuel', userImg: '', texto: 'Llevo la pelota y el mate 🧉', fecha: new Date(Date.now() - 43200000).toISOString() }
    ];
    localStorage.setItem('viaje_amigos_comentarios', JSON.stringify(seedComments));
  }

  /* Migrate old mensaje field */
  const users = DataService.getAll();
  let changed = false;
  users.forEach(u => {
    if (u.mensaje && !u.comentario) {
      u.comentario = u.mensaje;
      delete u.mensaje;
      changed = true;
    }
  });
  if (changed) DataService.saveAll(users);
}

/* ========== MODAL CLOSE ========== */
export function initModal() {
  const modal = document.getElementById('userModal');
  const modalClose = document.getElementById('modalClose');
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('is-open');
      unlockScroll();
    });
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('is-open');
        unlockScroll();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        modal.classList.remove('is-open');
        unlockScroll();
      }
    });
  }

  /* Delegation: view user detail */
  const amigosBody = document.getElementById('amigosBody');
  if (amigosBody) {
    amigosBody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="view"]');
      if (btn) {
        const id = Number(btn.dataset.userId);
        if (id) showUserDetail(id);
      }
    });
  }
}
