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
      comentario: userData.comentario || '',
      img: userData.img || '',
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
  }
};
