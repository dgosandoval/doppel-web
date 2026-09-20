/* API de la trivia LATAM (Activación Semana de la Seguridad).
   Worker montado en doppel.cl/latam-seguridad/api/*  → mismo origen que el demo,
   sin CORS. La D1 'latam-trivia-db' guarda partidas y respuestas.

   Escritura: pública (cualquiera que juegue registra su partida).
   Lectura (/stats): exige la clave del dashboard. */

const CLAVE = 'seguridad2026';
const COOKIE = 'latam_panel';
const TOKEN = 'a93f21-latam-panel';
const CANALES = new Set(['totem', 'online']);

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }
  });

const texto = (v, max) => {
  if (typeof v !== 'string') return null;
  const t = v.trim().slice(0, max);
  return t.length ? t : null;
};
const entero = (v) => (Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : null);
const autorizado = (request) =>
  (request.headers.get('Cookie') || '').split(/;\s*/).includes(`${COOKIE}=${TOKEN}`);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ruta = url.pathname.replace(/^\/latam-seguridad\/api\/?/, '');

    try {
      if (request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        if (ruta === 'partida') return await crearPartida(env, body);
        if (ruta === 'respuesta') return await guardarRespuesta(env, body);
        if (ruta === 'fin') return await cerrarPartida(env, body);
        if (ruta === 'acceso') return acceso(body);
      }
      if (request.method === 'GET') {
        if (ruta === 'stats') {
          if (!autorizado(request)) return json({ error: 'clave requerida' }, 401);
          return await stats(env);
        }
        if (ruta === 'sesion') return json({ ok: autorizado(request) });
      }
      return json({ error: 'ruta no encontrada' }, 404);
    } catch (e) {
      return json({ error: String(e && e.message || e) }, 500);
    }
  }
};

/* ── acceso al dashboard ── */

function acceso(body) {
  if (texto(body.clave, 60) !== CLAVE) return json({ ok: false }, 401);
  return json({ ok: true }, 200, {
    'Set-Cookie': `${COOKIE}=${TOKEN}; Path=/latam-seguridad; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`
  });
}

/* ── registro ── */

async function crearPartida(env, body) {
  const id = texto(body.id, 40);
  const canal = CANALES.has(body.canal) ? body.canal : 'online';
  if (!id) return json({ error: 'falta id' }, 400);

  await env.DB.prepare(
    `INSERT OR IGNORE INTO partidas (id, canal, punto, nombre, inicio) VALUES (?, ?, ?, ?, ?)`
  ).bind(id, canal, texto(body.punto, 40), texto(body.nombre, 40), new Date().toISOString()).run();

  return json({ ok: true, id });
}

async function guardarRespuesta(env, body) {
  const partida = texto(body.partida, 40);
  const pregunta = entero(body.pregunta);
  if (!partida || pregunta === null) return json({ error: 'datos incompletos' }, 400);

  const elegida = entero(body.elegida);
  const segundos = Number.isFinite(Number(body.segundos)) ? Number(body.segundos) : null;

  await env.DB.prepare(
    `INSERT INTO respuestas (partida_id, pregunta_id, elegida, correcta, segundos, ts)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(partida, pregunta, elegida === null ? -1 : elegida, body.correcta ? 1 : 0,
         segundos, new Date().toISOString()).run();

  return json({ ok: true });
}

async function cerrarPartida(env, body) {
  const partida = texto(body.partida, 40);
  if (!partida) return json({ error: 'falta partida' }, 400);

  await env.DB.prepare(
    `UPDATE partidas SET fin = ?, aciertos = ?, total = ?, puntos = ?, completada = 1 WHERE id = ?`
  ).bind(new Date().toISOString(), entero(body.aciertos), entero(body.total),
         entero(body.puntos), partida).run();

  return json({ ok: true });
}

/* ── agregados para el dashboard ── */

async function stats(env) {
  const [resumen, porPregunta, alternativas, actividad, ultimas] = await Promise.all([
    env.DB.prepare(
      `SELECT canal,
              COUNT(*)                                   AS partidas,
              SUM(completada)                            AS completadas,
              AVG(CASE WHEN completada = 1 THEN aciertos END) AS aciertos_prom,
              AVG(CASE WHEN completada = 1 THEN total    END) AS total_prom,
              AVG(CASE WHEN completada = 1 THEN puntos   END) AS puntos_prom
       FROM partidas GROUP BY canal`
    ).all(),

    env.DB.prepare(
      `SELECT r.pregunta_id AS pregunta, p.canal AS canal,
              COUNT(*) AS n, SUM(r.correcta) AS ok, AVG(r.segundos) AS segundos
       FROM respuestas r JOIN partidas p ON p.id = r.partida_id
       GROUP BY r.pregunta_id, p.canal`
    ).all(),

    env.DB.prepare(
      `SELECT r.pregunta_id AS pregunta, r.elegida AS elegida, COUNT(*) AS n
       FROM respuestas r GROUP BY r.pregunta_id, r.elegida`
    ).all(),

    env.DB.prepare(
      `SELECT substr(inicio, 1, 10) AS dia, canal, COUNT(*) AS n
       FROM partidas GROUP BY dia, canal ORDER BY dia`
    ).all(),

    env.DB.prepare(
      `SELECT nombre, canal, punto, aciertos, total, puntos, completada,
              COALESCE(fin, inicio) AS momento
       FROM partidas ORDER BY COALESCE(fin, inicio) DESC LIMIT 25`
    ).all()
  ]);

  return json({
    generado: new Date().toISOString(),
    resumen: resumen.results,
    preguntas: porPregunta.results,
    alternativas: alternativas.results,
    actividad: actividad.results,
    ultimas: ultimas.results
  });
}
