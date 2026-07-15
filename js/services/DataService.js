import { api } from '../api.js';

const LS_KEY = 'viaje_amigos_users';

let _usersCache = null;
let _apiAvailable = null;

async function checkApi() {
  if (_apiAvailable !== null) return _apiAvailable;
  try {
    await api.getUsers();
    _apiAvailable = true;
  } catch {
    _apiAvailable = false;
  }
  return _apiAvailable;
}

function lsGetAll() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}

function lsSaveAll(users) {
  localStorage.setItem(LS_KEY, JSON.stringify(users));
}

async function migrateLocalToApi() {
  const local = lsGetAll();
  if (local.length === 0) return;
  for (const u of local) {
    try {
      const existing = await api.getUsers();
      const exists = existing.find(e => e.id === u.id);
      if (!exists) {
        await api.createUser({
          nombre: u.nombre,
          nick: u.nick,
          pass: u.pass,
          descripcion: u.descripcion,
          img: u.img
        });
      }
    } catch { /* skip on error */ }
  }
  _usersCache = null;
}

export const DataService = {
  STORAGE_KEY: LS_KEY,

  async _ensureApi() {
    const available = await checkApi();
    if (available && !_usersCache) {
      try {
        _usersCache = await api.getUsers();
      } catch {
        _usersCache = lsGetAll();
      }
    }
    return available;
  },

  async getAll() {
    const apiOk = await this._ensureApi();
    if (apiOk) {
      try {
        _usersCache = await api.getUsers();
        lsSaveAll(_usersCache);
        return _usersCache;
      } catch {
        if (_usersCache) return _usersCache;
      }
    }
    return lsGetAll();
  },

  async saveAll(users) {
    _usersCache = users;
    lsSaveAll(users);
    const apiOk = await checkApi();
    if (apiOk) {
      for (const u of users) {
        try {
          await api.updateUser(u.id, { nick: u.nick, descripcion: u.descripcion, img: u.img, comentarios: u.comentarios, rol: u.rol, nombre: u.nombre });
        } catch { /* skip individual errors */ }
      }
    }
  },

  async addUser(userData) {
    const apiOk = await checkApi();
    if (apiOk) {
      try {
        const saved = await api.createUser(userData);
        _usersCache = null;
        return saved;
      } catch (e) {
        if (e.message.includes('Ya estas registrado')) throw e;
      }
    }
    const users = lsGetAll();
    const newUser = {
      id: Date.now(),
      nombre: userData.nombre || '',
      nick: userData.nick || '',
      pass: userData.pass || '',
      descripcion: userData.descripcion || '',
      img: userData.img || '',
      comentarios: [],
      rol: 'usuario',
      fecha: new Date().toISOString()
    };
    users.push(newUser);
    lsSaveAll(users);
    _usersCache = users;
    return newUser;
  },

  async getUserById(id) {
    const users = await this.getAll();
    return users.find(u => u.id === id) || null;
  },

  async removeUser(id) {
    const apiOk = await checkApi();
    if (apiOk) {
      try {
        await api.deleteUser(id);
        _usersCache = null;
        return;
      } catch { /* fallback */ }
    }
    const users = lsGetAll().filter(u => u.id !== id);
    lsSaveAll(users);
    _usersCache = users;
  },

  async updateUser(id, data) {
    const apiOk = await checkApi();
    if (apiOk) {
      try {
        const updated = await api.updateUser(id, data);
        _usersCache = null;
        return updated;
      } catch { /* fallback */ }
    }
    const users = lsGetAll();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    Object.assign(users[idx], data);
    lsSaveAll(users);
    _usersCache = users;
    return users[idx];
  },

  async getTotal() {
    const users = await this.getAll();
    return users.length;
  },

  async syncUser(user) {
    const apiOk = await checkApi();
    if (apiOk) {
      try {
        await api.updateUser(user.id, { nick: user.nick, descripcion: user.descripcion, img: user.img, comentarios: user.comentarios, rol: user.rol, nombre: user.nombre });
      } catch { /* fallback only */ }
    }
  },

  /* ========== USER COMMENTS CRUD ========== */
  async getUserComments(userId) {
    const user = await this.getUserById(userId);
    return user ? (user.comentarios || []) : [];
  },

  async addUserComment(userId, texto) {
    const users = await this.getAll();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;
    if (!users[idx].comentarios) users[idx].comentarios = [];
    const comment = {
      id: Date.now(),
      texto: texto.trim(),
      fecha: new Date().toISOString()
    };
    users[idx].comentarios.push(comment);
    _usersCache = users;
    lsSaveAll(users);
    await this.syncUser(users[idx]);
    return comment;
  },

  async updateUserComment(userId, commentId, newText) {
    const users = await this.getAll();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;
    const comments = users[idx].comentarios || [];
    const cIdx = comments.findIndex(c => c.id === commentId);
    if (cIdx === -1) return null;
    comments[cIdx].texto = newText.trim();
    comments[cIdx].fecha = new Date().toISOString();
    _usersCache = users;
    lsSaveAll(users);
    await this.syncUser(users[idx]);
    return comments[cIdx];
  },

  async removeUserComment(userId, commentId) {
    const users = await this.getAll();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    users[idx].comentarios = (users[idx].comentarios || []).filter(c => c.id !== commentId);
    _usersCache = users;
    lsSaveAll(users);
    await this.syncUser(users[idx]);
    return true;
  },

  async getAllCommentsFlat() {
    const users = await this.getAll();
    const all = [];
    users.forEach(u => {
      (u.comentarios || []).forEach(c => {
        all.push({
          ...c,
          userId: u.id,
          userName: u.nombre,
          userNick: u.nick || '',
          userImg: u.img || ''
        });
      });
    });
    all.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    return all;
  },

  async migrateLegacyData() {
    const users = await this.getAll();
    let changed = false;
    users.forEach(u => {
      if (u.mensaje && !u.descripcion) {
        u.descripcion = u.mensaje;
        delete u.mensaje;
        changed = true;
      }
      if (u.comentario && !u.descripcion) {
        u.descripcion = u.comentario;
        delete u.comentario;
        changed = true;
      }
      if (!u.comentarios) {
        u.comentarios = [];
        changed = true;
      }
    });
    if (changed) await this.saveAll(users);
  },

  async migrateLocalData() {
    const apiOk = await checkApi();
    if (apiOk) await migrateLocalToApi();
  }
};
