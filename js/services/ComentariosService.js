export const ComentariosService = {
  STORAGE_KEY: 'viaje_amigos_comentarios',

  getAll() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; }
    catch { return []; }
  },

  saveAll(items) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  },

  add({ userId, userName, userNick, userImg, texto }) {
    const items = this.getAll();
    items.push({
      id: Date.now(),
      userId,
      userName,
      userNick,
      userImg: userImg || '',
      texto: texto.trim(),
      fecha: new Date().toISOString()
    });
    this.saveAll(items);
    return items;
  },

  remove(id) {
    const items = this.getAll().filter(c => c.id !== id);
    this.saveAll(items);
    return items;
  },

  removeByUser(userId) {
    const items = this.getAll().filter(c => c.userId !== userId);
    this.saveAll(items);
    return items;
  },

  updateUserName(userId, newName) {
    const items = this.getAll();
    let changed = false;
    items.forEach(c => {
      if (c.userId === userId && c.userName !== newName) {
        c.userName = newName;
        changed = true;
      }
    });
    if (changed) this.saveAll(items);
    return items;
  }
};
