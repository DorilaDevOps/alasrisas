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

async function getUsers(store) {
  const raw = await store.get('users');
  return raw ? JSON.parse(raw) : [];
}

async function saveUsers(store, users) {
  await store.set('users', JSON.stringify(users));
}

function verifyAuth(request, users) {
  const userId = Number(request.headers.get('X-User-Id'));
  const userPass = request.headers.get('X-User-Pass') || '';
  if (!userId) return null;
  const user = users.find(u => u.id === userId && u.pass === userPass);
  return user || null;
}

export default async (request) => {
  if (request.method === 'OPTIONS') return getCorsResponse();

  const store = getStore({ name: 'app' });

  try {
    switch (request.method) {
      case 'GET': {
        const users = await getUsers(store);
        return json(users);
      }

      case 'POST': {
        const body = await request.json();
        const users = await getUsers(store);

        const exists = users.find(
          u => u.nombre.toLowerCase() === body.nombre.toLowerCase() && u.pass === body.pass
        );
        if (exists) {
          return json({ error: 'Ya estas registrado. Usa el modo Ingreso.' }, 409);
        }

        const newUser = {
          id: Date.now(),
          nombre: body.nombre || '',
          nick: body.nick || '',
          pass: body.pass || '',
          descripcion: body.descripcion || '',
          img: body.img || '',
          comentarios: [],
          rol: 'usuario',
          fecha: new Date().toISOString()
        };

        users.push(newUser);
        await saveUsers(store, users);

        const { pass, ...safe } = newUser;
        return json(safe, 201);
      }

      case 'PUT': {
        const body = await request.json();
        const { id, pass: authPass, ...data } = body;
        const users = await getUsers(store);

        const idx = users.findIndex(u => u.id === id);
        if (idx === -1) return json({ error: 'Usuario no encontrado' }, 404);

        Object.assign(users[idx], data);
        if (body.pass !== undefined) users[idx].pass = body.pass;

        await saveUsers(store, users);
        return json(users[idx]);
      }

      case 'DELETE': {
        const body = await request.json();
        const users = await getUsers(store);
        const filtered = users.filter(u => u.id !== body.id);
        if (filtered.length === users.length) {
          return json({ error: 'Usuario no encontrado' }, 404);
        }
        await saveUsers(store, filtered);
        return json({ ok: true });
      }

      default:
        return json({ error: 'Method not allowed' }, 405);
    }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
};

export const config = {
  path: "/api/users"
};
