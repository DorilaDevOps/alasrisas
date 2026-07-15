import { getStore } from '@netlify/blobs';

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-User-Pass',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: HEADERS });
}

function getCorsResponse() {
  return new Response(null, { status: 204, headers: HEADERS });
}

async function getData(store) {
  const raw = await store.get('wallets');
  return raw ? JSON.parse(raw) : {};
}

async function saveData(store, data) {
  await store.set('wallets', JSON.stringify(data));
}

async function getMeta(store) {
  const raw = await store.get('meta');
  return raw ? JSON.parse(raw) : { valor: 200000, divisa: 'UYU' };
}

async function saveMeta(store, meta) {
  await store.set('meta', JSON.stringify(meta));
}

export default async (request) => {
  if (request.method === 'OPTIONS') return getCorsResponse();

  const store = getStore({ name: 'app' });
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  try {
    switch (request.method) {
      case 'GET': {
        if (action === 'meta') {
          const meta = await getMeta(store);
          return json(meta);
        }
        if (action === 'peruser') {
          const wallets = await getData(store);
          const meta = await getMeta(store);
          const totalUsers = Object.keys(wallets).length || 1;
          const perUser = Math.round(meta.valor / totalUsers);
          return json({ perUser, meta });
        }

        const wallets = await getData(store);
        return json(wallets);
      }

      case 'POST': {
        const body = await request.json();

        if (body.action === 'transaction') {
          const wallets = await getData(store);
          const { userId, monto, tipo } = body;

          if (!wallets[userId]) {
            wallets[userId] = { totalAcumulado: 0, historial: [] };
          }

          wallets[userId].totalAcumulado += monto;
          wallets[userId].historial.push({
            fecha: new Date().toISOString(),
            monto,
            tipo
          });

          await saveData(store, wallets);
          return json(wallets[userId]);
        }

        if (body.action === 'meta') {
          await saveMeta(store, body.meta);
          return json(body.meta);
        }

        return json({ error: 'Unknown action' }, 400);
      }

      default:
        return json({ error: 'Method not allowed' }, 405);
    }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
};

export const config = {
  path: "/api/wallets"
};
