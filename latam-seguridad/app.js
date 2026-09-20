/* ───────── Trivia ¿Cuánto sabes? · LATAM Alcohol y Drogas ─────────
   Cada partida se registra en la API (/latam-seguridad/api) para alimentar
   el dashboard. Se guarda canal, punto, nombre si lo escriben, y la respuesta
   a cada pregunta. Si la API falla, el juego sigue igual.                */

(function () {
  'use strict';

  var POR_PARTIDA = 10;      // preguntas que se juegan
  var SEGUNDOS = 30;         // tiempo por pregunta
  var LETRAS = ['a', 'b', 'c', 'd'];
  var API = 'api/';
  var REINICIO_TOTEM = 60;   // segundos antes de volver a la portada en el tótem

  var $ = function (id) { return document.getElementById(id); };

  var pantallas = {
    inicio: $('p-inicio'),
    juego: $('p-juego'),
    fin: $('p-fin')
  };

  var estado = {
    nombre: '',
    ronda: [],
    i: 0,
    aciertos: 0,
    puntos: 0,
    respondida: false,
    historial: [],
    t0: 0,
    raf: 0,
    partida: '',
    tReinicio: 0
  };

  /* ── canal: tótem u online ───────────────────────────────────────────
     El tótem se marca una sola vez abriendo la URL con ?canal=totem&punto=SCL-T2;
     queda guardado en ese dispositivo. Todo lo demás cuenta como online.      */

  var canal = (function () {
    var p = new URLSearchParams(location.search);
    var c = p.get('canal');
    try {
      if (c === 'totem' || c === 'online') {
        localStorage.setItem('latam_canal', c);
        localStorage.setItem('latam_punto', p.get('punto') || '');
      }
      return {
        canal: localStorage.getItem('latam_canal') || 'online',
        punto: localStorage.getItem('latam_punto') || ''
      };
    } catch (e) {
      return { canal: c === 'totem' ? 'totem' : 'online', punto: p.get('punto') || '' };
    }
  })();
  var esTotem = canal.canal === 'totem';
  if (esTotem) {
    document.body.classList.add('totem');
    var badge = document.getElementById('punto-badge');
    badge.textContent = 'Modo tótem' + (canal.punto ? ' · ' + canal.punto : '');
    badge.hidden = false;
  }

  /* ── registro (best-effort: nunca interrumpe el juego) ── */

  function registrar(ruta, datos) {
    try {
      var cuerpo = JSON.stringify(datos);
      if (ruta === 'respuesta' && navigator.sendBeacon) {
        navigator.sendBeacon(API + ruta, new Blob([cuerpo], { type: 'application/json' }));
        return;
      }
      fetch(API + ruta, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: cuerpo,
        keepalive: true
      }).catch(function () {});
    } catch (e) { /* sin registro, el juego sigue */ }
  }

  function nuevoId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'p-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
  }

  /* ── utilidades ── */

  function mezclar(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function mostrar(clave) {
    Object.keys(pantallas).forEach(function (k) {
      pantallas[k].classList.toggle('activa', k === clave);
    });
    window.scrollTo(0, 0);
  }

  /* ── arranque ── */

  var total = window.PREGUNTAS.length;
  var porPartida = Math.min(POR_PARTIDA, total);
  $('mini-inicio').textContent =
    porPartida + ' preguntas al azar de un banco de ' + total +
    ' · ' + SEGUNDOS + ' segundos cada una. Respondes y al instante ves la explicación.';

  $('form-inicio').addEventListener('submit', function (e) {
    e.preventDefault();
    estado.nombre = $('nombre').value.trim();
    comenzar();
  });

  $('reiniciar').addEventListener('click', comenzar);
  $('siguiente').addEventListener('click', avanzar);

  function comenzar() {
    clearTimeout(estado.tReinicio);
    estado.ronda = mezclar(window.PREGUNTAS).slice(0, porPartida);
    estado.i = 0;
    estado.aciertos = 0;
    estado.puntos = 0;
    estado.historial = [];
    estado.partida = nuevoId();

    registrar('partida', {
      id: estado.partida,
      canal: canal.canal,
      punto: canal.punto,
      nombre: estado.nombre
    });

    mostrar('juego');
    pintarPregunta();
  }

  /* ── pregunta ── */

  function pintarPregunta() {
    var q = estado.ronda[estado.i];
    estado.respondida = false;

    $('contador').textContent = (estado.i + 1) + ' / ' + estado.ronda.length;
    $('puntaje').textContent = estado.puntos + ' pts';
    $('progreso-fill').style.width = (estado.i / estado.ronda.length * 100) + '%';
    $('pregunta').textContent = q.pregunta;

    var ul = $('opciones');
    ul.innerHTML = '';
    q.opciones.forEach(function (texto, idx) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.className = 'opcion';
      b.type = 'button';
      b.innerHTML = '<span class="letra">' + LETRAS[idx] + ')</span>' +
                    '<span class="texto"></span>' +
                    '<span class="marca"></span>';
      b.querySelector('.texto').textContent = texto;
      b.addEventListener('click', function () { responder(idx); });
      li.appendChild(b);
      ul.appendChild(li);
    });

    $('explica').hidden = true;
    $('siguiente').hidden = true;
    $('siguiente').textContent =
      estado.i === estado.ronda.length - 1 ? 'Ver resultado' : 'Siguiente';

    arrancarCrono();
  }

  /* ── cronómetro ── */

  function arrancarCrono() {
    var barra = document.querySelector('.cronometro');
    var fill = $('crono-fill');
    barra.classList.remove('oculto', 'apurado');
    fill.style.width = '100%';
    estado.t0 = performance.now();

    cancelAnimationFrame(estado.raf);
    (function tick(ahora) {
      if (estado.respondida) return;
      var pasado = (ahora - estado.t0) / 1000;
      var queda = Math.max(0, SEGUNDOS - pasado);
      fill.style.width = (queda / SEGUNDOS * 100) + '%';
      barra.classList.toggle('apurado', queda <= 5);
      if (queda <= 0) { responder(-1); return; }
      estado.raf = requestAnimationFrame(tick);
    })(performance.now());
  }

  function segundosRestantes() {
    return Math.max(0, SEGUNDOS - (performance.now() - estado.t0) / 1000);
  }

  /* ── respuesta ── */

  function responder(idx) {
    if (estado.respondida) return;
    estado.respondida = true;
    cancelAnimationFrame(estado.raf);
    document.querySelector('.cronometro').classList.add('oculto');

    var q = estado.ronda[estado.i];
    var bien = idx === q.correcta;
    var botones = $('opciones').querySelectorAll('.opcion');

    botones.forEach(function (b, i) {
      b.disabled = true;
      if (i === q.correcta) {
        b.classList.add('buena');
        b.querySelector('.marca').textContent = '✓';
      } else if (i === idx) {
        b.classList.add('mala');
        b.querySelector('.marca').textContent = '✕';
      }
    });

    if (bien) {
      estado.aciertos++;
      estado.puntos += 100 + Math.round(segundosRestantes() / SEGUNDOS * 50);
      $('puntaje').textContent = estado.puntos + ' pts';
    }

    estado.historial.push({ q: q, bien: bien, sinResponder: idx === -1 });

    registrar('respuesta', {
      partida: estado.partida,
      pregunta: q.id,
      elegida: idx,
      correcta: bien,
      segundos: Math.round((SEGUNDOS - segundosRestantes()) * 10) / 10
    });

    var enc = idx === -1
      ? 'Se acabó el tiempo. Respuesta correcta: '
      : (bien ? '¡Correcto! ' : 'Respuesta correcta: ');
    $('correcta-txt').textContent =
      enc + LETRAS[q.correcta] + ') ' + q.opciones[q.correcta];
    $('explica-txt').textContent = q.explicacion;
    $('explica').hidden = false;
    $('siguiente').hidden = false;
    $('siguiente').focus({ preventScroll: true });
    $('siguiente').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function avanzar() {
    estado.i++;
    if (estado.i >= estado.ronda.length) { terminar(); return; }
    pintarPregunta();
  }

  /* ── resultado ── */

  function terminar() {
    var n = estado.aciertos, t = estado.ronda.length;
    var pct = n / t;

    mostrar('fin');
    $('fin-aciertos').textContent = n;
    $('fin-total').textContent = '/' + t;

    registrar('fin', {
      partida: estado.partida,
      aciertos: n,
      total: t,
      puntos: estado.puntos
    });

    // En el tótem la pantalla vuelve sola a la portada para el siguiente participante.
    if (esTotem) {
      clearTimeout(estado.tReinicio);
      estado.tReinicio = setTimeout(function () {
        estado.nombre = '';
        $('nombre').value = '';
        mostrar('inicio');
      }, REINICIO_TOTEM * 1000);
    }

    var titulo, mensaje;
    if (pct === 1) {
      titulo = 'Puntaje perfecto';
      mensaje = 'Dominas el Programa de Alcohol y Drogas. Ayuda a que tu equipo también lo conozca.';
    } else if (pct >= 0.7) {
      titulo = 'Muy bien';
      mensaje = 'Manejas lo esencial. Repasa lo que te faltó: en seguridad operacional los detalles importan.';
    } else if (pct >= 0.4) {
      titulo = 'Vas encaminado';
      mensaje = 'Hay vacíos que conviene cerrar. Revisa el programa en el portal interno Home LATAM.';
    } else {
      titulo = 'Hora de repasar';
      mensaje = 'Vale la pena dedicarle un rato al programa: la seguridad de todos depende de cada uno.';
    }
    $('fin-titulo').textContent =
      estado.nombre ? estado.nombre + ', ' + titulo.toLowerCase() : titulo;
    $('fin-mensaje').textContent = mensaje;
    $('fin-detalle').textContent =
      estado.puntos + ' puntos · ' + n + ' de ' + t + ' respuestas correctas';

    var arco = $('arco');
    arco.style.strokeDashoffset = 327;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        arco.style.strokeDashoffset = 327 * (1 - pct);
      });
    });

    var ul = $('repaso');
    ul.innerHTML = '';
    estado.historial.forEach(function (h, i) {
      var li = document.createElement('li');
      var ico = document.createElement('span');
      ico.className = 'ico ' + (h.bien ? 'ok' : 'no');
      ico.textContent = h.bien ? '✓' : '✕';
      var txt = document.createElement('span');
      txt.textContent = (i + 1) + '. ' + h.q.pregunta;
      li.appendChild(ico);
      li.appendChild(txt);
      ul.appendChild(li);
    });
  }
})();
