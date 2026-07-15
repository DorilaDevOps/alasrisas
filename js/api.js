const API_BASE = '/api';

function buildHeaders(extras = {}) {
  const h = { 'Content-Type': 'application/json', ...extras };
  return h;
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: buildHeaders(options.headers),
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  /* ========== USERS ========== */
  async getUsers() {
    return request('/users');
  },

  async createUser(userData) {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async updateUser(id, data) {
    return request('/users', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data })
    });
  },

  async deleteUser(id) {
    return request('/users', {
      method: 'DELETE',
      body: JSON.stringify({ id })
    });
  },

  /* ========== WALLETS ========== */
  async getWallets() {
    return request('/wallets');
  },

  async getWallet(userId) {
    const all = await request('/wallets');
    return all[userId] || { totalAcumulado: 0, historial: [] };
  },

  async addTransaction(userId, monto, tipo) {
    return request('/wallets', {
      method: 'POST',
      body: JSON.stringify({ action: 'transaction', userId, monto, tipo })
    });
  },

  async getMeta() {
    return request('/wallets?action=meta');
  },

  async saveMeta(meta) {
    return request('/wallets', {
      method: 'POST',
      body: JSON.stringify({ action: 'meta', meta })
    });
  },

  async getPerUserAmount() {
    return request('/wallets?action=peruser');
  }
};
