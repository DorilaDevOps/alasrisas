import { api } from '../api.js';
import { DataService } from './DataService.js';

const LS_KEY = 'viaje_amigos_wallets';
const LS_META_KEY = 'viaje_amigos_meta';

let _apiAvailable = null;

async function checkApi() {
  if (_apiAvailable !== null) return _apiAvailable;
  try {
    await api.getWallets();
    _apiAvailable = true;
  } catch {
    _apiAvailable = false;
  }
  return _apiAvailable;
}

function lsGetAll() {
  try {
    const stored = localStorage.getItem(LS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

function lsSaveAll(wallets) {
  localStorage.setItem(LS_KEY, JSON.stringify(wallets));
}

function lsGetMeta() {
  try {
    const stored = localStorage.getItem(LS_META_KEY);
    return stored ? JSON.parse(stored) : { valor: 200000, divisa: 'UYU' };
  } catch { return { valor: 200000, divisa: 'UYU' }; }
}

function lsSaveMeta(meta) {
  localStorage.setItem(LS_META_KEY, JSON.stringify(meta));
}

export const WalletService = {
  STORAGE_KEY: LS_KEY,
  META_KEY: LS_META_KEY,

  async getMeta() {
    const apiOk = await checkApi();
    if (apiOk) {
      try {
        const meta = await api.getMeta();
        lsSaveMeta(meta);
        return meta;
      } catch { /* fallback */ }
    }
    return lsGetMeta();
  },

  async saveMeta(meta) {
    lsSaveMeta(meta);
    const apiOk = await checkApi();
    if (apiOk) {
      try { await api.saveMeta(meta); } catch { /* saved locally */ }
    }
  },

  async getAll() {
    const apiOk = await checkApi();
    if (apiOk) {
      try {
        const wallets = await api.getWallets();
        lsSaveAll(wallets);
        return wallets;
      } catch { /* fallback */ }
    }
    return lsGetAll();
  },

  async saveAll(wallets) {
    lsSaveAll(wallets);
  },

  async getWallet(userId) {
    const apiOk = await checkApi();
    if (apiOk) {
      try {
        const wallet = await api.getWallet(userId);
        return wallet;
      } catch { /* fallback */ }
    }
    const wallets = lsGetAll();
    if (!wallets[userId]) {
      wallets[userId] = { totalAcumulado: 0, historial: [] };
      lsSaveAll(wallets);
    }
    return wallets[userId];
  },

  async addTransaction(userId, monto, tipo) {
    const apiOk = await checkApi();
    if (apiOk) {
      try {
        const wallet = await api.addTransaction(userId, monto, tipo);
        const wallets = lsGetAll();
        wallets[userId] = wallet;
        lsSaveAll(wallets);
        return wallet;
      } catch { /* fallback */ }
    }
    const wallets = lsGetAll();
    if (!wallets[userId]) wallets[userId] = { totalAcumulado: 0, historial: [] };
    const wallet = wallets[userId];
    wallet.totalAcumulado += monto;
    wallet.historial.push({ fecha: new Date().toISOString(), monto, tipo });
    lsSaveAll(wallets);
    return wallet;
  },

  async getPerUserAmount() {
    const users = await DataService.getAll();
    const meta = await this.getMeta();
    return users.length > 0 ? Math.round(meta.valor / users.length) : meta.valor;
  }
};
