export const DataService = {
  STORAGE_KEY: 'viaje_amigos_users',

  getAll() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; }
    catch { return []; }
  },

  saveAll(users) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  },

  addUser(userData) {
    const users = this.getAll();
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
    this.saveAll(users);
    return newUser;
  },

  getUserById(id) {
    return this.getAll().find(u => u.id === id) || null;
  },

  removeUser(id) {
    const users = this.getAll().filter(u => u.id !== id);
    this.saveAll(users);
  },

  updateUser(id, data) {
    const users = this.getAll();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    Object.assign(users[idx], data);
    this.saveAll(users);
    return users[idx];
  },

  getTotal() {
    return this.getAll().length;
  },

  /* ========== USER COMMENTS CRUD ========== */
  getUserComments(userId) {
    const user = this.getUserById(userId);
    return user ? (user.comentarios || []) : [];
  },

  addUserComment(userId, texto) {
    const users = this.getAll();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;
    if (!users[idx].comentarios) users[idx].comentarios = [];
    const comment = {
      id: Date.now(),
      texto: texto.trim(),
      fecha: new Date().toISOString()
    };
    users[idx].comentarios.push(comment);
    this.saveAll(users);
    return comment;
  },

  updateUserComment(userId, commentId, newText) {
    const users = this.getAll();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;
    const comments = users[idx].comentarios || [];
    const cIdx = comments.findIndex(c => c.id === commentId);
    if (cIdx === -1) return null;
    comments[cIdx].texto = newText.trim();
    comments[cIdx].fecha = new Date().toISOString();
    this.saveAll(users);
    return comments[cIdx];
  },

  removeUserComment(userId, commentId) {
    const users = this.getAll();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    users[idx].comentarios = (users[idx].comentarios || []).filter(c => c.id !== commentId);
    this.saveAll(users);
    return true;
  },

  getAllCommentsFlat() {
    const users = this.getAll();
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

  migrateLegacyData() {
    const users = this.getAll();
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
    if (changed) this.saveAll(users);
  }
};
