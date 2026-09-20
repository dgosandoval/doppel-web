-- Trivia LATAM · Activación Semana de la Seguridad
-- Registro de participación. No se guardan IP ni user-agent: solo canal, punto y
-- (si la persona lo escribe) su nombre.

CREATE TABLE IF NOT EXISTS partidas (
  id          TEXT PRIMARY KEY,           -- uuid generado en el navegador
  canal       TEXT NOT NULL,              -- 'totem' | 'online'
  punto       TEXT,                       -- identificador del tótem o base (ej: SCL-T2)
  nombre      TEXT,                       -- opcional
  inicio      TEXT NOT NULL,              -- ISO-8601 UTC
  fin         TEXT,
  aciertos    INTEGER,
  total       INTEGER,
  puntos      INTEGER,
  completada  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS respuestas (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  partida_id  TEXT NOT NULL,
  pregunta_id INTEGER NOT NULL,           -- id del banco en preguntas.js
  elegida     INTEGER NOT NULL,           -- 0-3, o -1 si se acabó el tiempo
  correcta    INTEGER NOT NULL,           -- 0 | 1
  segundos    REAL,                       -- cuánto tardó en responder
  ts          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resp_partida  ON respuestas (partida_id);
CREATE INDEX IF NOT EXISTS idx_resp_pregunta ON respuestas (pregunta_id);
CREATE INDEX IF NOT EXISTS idx_part_canal    ON partidas (canal);
CREATE INDEX IF NOT EXISTS idx_part_inicio   ON partidas (inicio);
