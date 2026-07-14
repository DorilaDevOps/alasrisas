import { DataService } from '../services/DataService.js';
import { WalletService } from '../services/WalletService.js';
import { escHtml, lockScroll, unlockScroll } from '../utils.js';
import { showToast } from './toast.js';
import { getCurrentUser, setCurrentUser, doLogout } from './form.js';
import { refreshComments } from './comments.js';

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

/* ========== SHOW USER DETAIL ========== */
function closeEditPanel() {
  const panelComments = document.getElementById('panel-content-comments');
  const panelWallet = document.getElementById('panel-content-wallet');
  const panelEdit = document.getElementById('panel-content-edit');
  const panelBtnComments = document.getElementById('panel-btn-comments');
  const panelBtnWallet = document.getElementById('panel-btn-wallet');
  const panelBtnEdit = document.getElementById('panel-btn-edit');
  if (panelComments) panelComments.style.display = 'block';
  if (panelWallet) panelWallet.style.display = 'none';
  if (panelEdit) panelEdit.style.display = 'none';
  [panelBtnComments, panelBtnWallet, panelBtnEdit].forEach(b => b?.classList.remove('active'));
  panelBtnComments?.classList.add('active');
}

export function showUserDetail(id, isEditMode) {
  const user = DataService.getUserById(id);
  if (!user) return;

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
    const panelEditBody = document.getElementById('panel-edit-body');
    if (!panelEditBody) return;

    const avatarPreview = user.img
      ? `<img src="${user.img}" alt="" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--color-accent-cool)">`
      : `<div style="width:80px;height:80px;border-radius:50%;background:var(--color-surface);display:flex;align-items:center;justify-content:center;font-size:2rem;color:var(--color-text-muted)"><i class="fas fa-user"></i></div>`;
    panelEditBody.innerHTML = `
      <h3 style="margin:0 0 1rem;font-family:var(--font-display);font-size:var(--font-size-lg);text-align:center">Editar mis datos</h3>
      <div class="user-detail">
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;margin-bottom:1rem">
          <div id="editAvatarPreview">${avatarPreview}</div>
          <label for="editAvatarFile" style="font-size:var(--font-size-xs);color:var(--color-accent-cool);cursor:pointer;text-decoration:underline">Cambiar foto</label>
          <input type="file" id="editAvatarFile" accept="image/*" style="display:none">
        </div>
        <div class="form-field" style="margin-bottom:0.75rem">
          <label for="editNombre" style="font-weight:600;display:block;margin-bottom:0.25rem">Nombre</label>
          <input type="text" id="editNombre" value="${escHtml(user.nombre)}" minlength="2" required style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid var(--color-border);background:var(--color-surface);color:var(--color-text)">
        </div>
        <div class="form-field" style="margin-bottom:0.75rem">
          <label for="editNick" style="font-weight:600;display:block;margin-bottom:0.25rem">Nick</label>
          <input type="text" id="editNick" value="${escHtml(user.nick || '')}" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid var(--color-border);background:var(--color-surface);color:var(--color-text)">
        </div>
        <div class="form-field" style="margin-bottom:0.75rem">
          <label for="editDescripcion" style="font-weight:600;display:block;margin-bottom:0.25rem">Descripcion</label>
          <textarea id="editDescripcion" rows="3" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid var(--color-border);background:var(--color-surface);color:var(--color-text);resize:vertical">${escHtml(user.descripcion || '')}</textarea>
        </div>
        <div class="form-field" style="margin-bottom:1rem">
          <label for="editPass" style="font-weight:600;display:block;margin-bottom:0.25rem">Contrasena <small style="font-weight:400;color:var(--color-text-muted)">(1-4 caracteres)</small></label>
          <input type="text" id="editPass" minlength="1" maxlength="4" placeholder="Nueva contrasena" style="width:100%;padding:0.5rem;border-radius:6px;border:1px solid var(--color-border);background:var(--color-surface);color:var(--color-text)">
        </div>
        ${fechaHtml}
        <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:1rem">
          <button id="saveEditUser" class="btn-save-modal" data-user-id="${user.id}">Guardar cambios</button>
          <button id="deleteEditUser" class="btn-save-modal" style="background:var(--color-danger);color:#fff;border-color:var(--color-danger)">Eliminar mi cuenta</button>
        </div>
      </div>`;

    const panelComments = document.getElementById('panel-content-comments');
    const panelWallet = document.getElementById('panel-content-wallet');
    const panelEdit = document.getElementById('panel-content-edit');
    if (panelComments) panelComments.style.display = 'none';
    if (panelWallet) panelWallet.style.display = 'none';
    if (panelEdit) panelEdit.style.display = 'block';

    window._editAvatarData = user.img || '';
    const avatarFile = document.getElementById('editAvatarFile');
    if (avatarFile) {
      avatarFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 150;
            canvas.height = 150;
            canvas.getContext('2d').drawImage(img, 0, 0, 150, 150);
            window._editAvatarData = canvas.toDataURL('image/webp', 0.7);
            const preview = document.getElementById('editAvatarPreview');
            if (preview) preview.innerHTML = `<img src="${window._editAvatarData}" alt="" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--color-accent-cool)">`;
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    document.getElementById('saveEditUser')?.addEventListener('click', () => {
      const nombre = document.getElementById('editNombre')?.value.trim() || '';
      const nick = document.getElementById('editNick')?.value || '';
      const descripcion = document.getElementById('editDescripcion')?.value || '';
      const pass = document.getElementById('editPass')?.value || '';
      if (!nombre || nombre.length < 2) {
        showToast('El nombre debe tener al menos 2 caracteres.', 'error');
        return;
      }
      const effectivePass = (pass.length >= 1 && pass.length <= 4) ? pass : user.pass;
      const allUsers = DataService.getAll();
      const conflict = allUsers.find(u =>
        u.id !== user.id &&
        u.nombre.toLowerCase() === nombre.toLowerCase() &&
        u.pass === effectivePass
      );
      if (conflict) {
        showToast('Ya existe otro usuario con ese nombre y contrasena.', 'error');
        return;
      }
      const data = { nombre, nick, descripcion, img: window._editAvatarData || user.img };
      if (pass.length >= 1 && pass.length <= 4) data.pass = pass;
      DataService.updateUser(user.id, data);
      const updated = DataService.getUserById(user.id);
      setCurrentUser(updated);
      window._editAvatarData = '';
      renderUsers();
      const panelUserName = document.getElementById('panel-user-name');
      const panelUserNick = document.getElementById('panel-user-nick');
      const panelUserAvatar = document.getElementById('panel-user-avatar');
      if (panelUserName) panelUserName.textContent = updated.nombre;
      if (panelUserNick) panelUserNick.textContent = updated.nick ? '@' + updated.nick : '';
      if (panelUserAvatar) {
        if (updated.img) {
          panelUserAvatar.innerHTML = `<img src="${updated.img}" alt="" class="user-panel-avatar-img" loading="lazy">`;
        } else {
          panelUserAvatar.innerHTML = `<div class="user-panel-avatar-placeholder">${(updated.nombre || '?')[0]}</div>`;
        }
      }
      refreshComments();
      showToast('Perfil actualizado.', 'success');
      closeEditPanel();
    });

    document.getElementById('deleteEditUser')?.addEventListener('click', () => {
      if (!confirm(`Eliminar tu usuario "${user.nombre}"?\nSe borrarán tus datos. No se puede deshacer.`)) return;
      DataService.removeUser(user.id);
      window._editAvatarData = '';
      closeEditPanel();
      doLogout();
      refreshComments();
      showToast('Usuario eliminado.', 'info');
      updateStats();
      renderUsers();
    });
  } else {
    const modalBody = document.getElementById('modalBody');
    const modal = document.getElementById('userModal');
    if (!modalBody || !modal) return;
    const title = document.getElementById('modalTitle');
    if (title) title.textContent = 'Detalle del viajero';
    modalBody.innerHTML = `
      <div class="user-detail">${avatarHtml}
        <p style="font-weight:700;font-size:var(--font-size-lg);margin:0.5rem 0 0.25rem">${escHtml(user.nombre)}</p>
        <p style="font-size:var(--font-size-base);color:var(--color-text-muted);margin:0 0 0.25rem">${escHtml(user.nick ? '@' + user.nick : '')}</p>
        <p style="font-size:var(--font-size-sm);margin:0">Contraseña: ${escHtml(user.pass || 'Sin contraseña')}</p>
        ${user.descripcion ? `<p style="font-size:var(--font-size-sm);color:var(--color-accent);margin:0.5rem 0 0;font-style:italic">\u201C${escHtml(user.descripcion)}\u201D</p>` : ''}
        ${fechaHtml}</div>`;
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    lockScroll();
  }
}

/* ========== SEED DATA ========== */
export function initSeedData() {
  if (!localStorage.getItem(DataService.STORAGE_KEY)) {
    const seed = [
      { id: 1, nombre: 'Andres', nick: 'Loco', pass: '123', descripcion: 'Vamos que nos vamos!', img: '', comentarios: [], rol: 'usuario', fecha: new Date(Date.now() - 86400000).toISOString() },
      { id: 2, nombre: 'Conde', nick: 'chikisuel', pass: '1122', descripcion: 'Llevo la pelota', img: '', comentarios: [], rol: 'usuario', fecha: new Date(Date.now() - 43200000).toISOString() }
    ];
    localStorage.setItem(DataService.STORAGE_KEY, JSON.stringify(seed));
  }

  DataService.migrateLegacyData();

  /* Migrate old standalone comments into user.comentarios */
  const oldKey = 'viaje_amigos_comentarios';
  try {
    const oldComments = JSON.parse(localStorage.getItem(oldKey)) || [];
    if (oldComments.length > 0) {
      const users = DataService.getAll();
      let changed = false;
      oldComments.forEach(oc => {
        const user = users.find(u => u.id === oc.userId);
        if (user) {
          if (!user.comentarios) user.comentarios = [];
          const alreadyHas = user.comentarios.some(c => c.id === oc.id);
          if (!alreadyHas) {
            user.comentarios.push({ id: oc.id, texto: oc.texto, fecha: oc.fecha });
            changed = true;
          }
        }
      });
      if (changed) DataService.saveAll(users);
      localStorage.removeItem(oldKey);
    }
  } catch {}

  /* Seed comments for demo users */
  const allUsers = DataService.getAll();
  const andres = allUsers.find(u => u.id === 1);
  const conde = allUsers.find(u => u.id === 2);
  if (andres && (!andres.comentarios || andres.comentarios.length === 0)) {
    DataService.addUserComment(1, 'Vamos que nos vamos! Ya falta menos 💪');
    DataService.addUserComment(1, 'No olviden traer protector solar');
  }
  if (conde && (!conde.comentarios || conde.comentarios.length === 0)) {
    DataService.addUserComment(2, 'Llevo la pelota y el mate 🧉');
    DataService.addUserComment(2, '¿Quién trae las sillas plegables?');
  }

  /* Safety net: re-render comments after seeding */
  refreshComments();
}

/* ========== MODAL CLOSE ========== */
export function initModal() {
  const modal = document.getElementById('userModal');
  const modalClose = document.getElementById('modalClose');
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('is-open');
      document.body.classList.remove('modal-open');
      unlockScroll();
    });
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('is-open');
        document.body.classList.remove('modal-open');
        unlockScroll();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        modal.classList.remove('is-open');
        document.body.classList.remove('modal-open');
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
