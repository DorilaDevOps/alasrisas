import { DataService } from './DataService.js';

export const WalletService = {
  STORAGE_KEY: 'viaje_amigos_wallets',
  META_KEY: 'viaje_amigos_meta',

  getMeta() {
    try {
      const stored = localStorage.getItem(this.META_KEY);
      return stored ? JSON.parse(stored) : { valor: 200000, divisa: 'UYU' };
    } catch { return { valor: 200000, divisa: 'UYU' }; }
  },

  saveMeta(meta) {
    localStorage.setItem(this.META_KEY, JSON.stringify(meta));
  },

  getAll() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  },

  saveAll(wallets) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(wallets));
  },

  getWallet(userId) {
    const wallets = this.getAll();
    if (!wallets[userId]) {
      wallets[userId] = { totalAcumulado: 0, historial: [] };
      this.saveAll(wallets);
    }
    return wallets[userId];
  },

  addTransaction(userId, monto, tipo) {
    const wallets = this.getAll();
    if (!wallets[userId]) wallets[userId] = { totalAcumulado: 0, historial: [] };
    const wallet = wallets[userId];
    wallet.totalAcumulado += monto;
    wallet.historial.push({ fecha: new Date().toISOString(), monto, tipo });
    this.saveAll(wallets);
    return wallet;
  },

  getPerUserAmount() {
    const users = DataService.getAll();
    const meta = this.getMeta();
    return users.length > 0 ? Math.round(meta.valor / users.length) : meta.valor;
  }
};
