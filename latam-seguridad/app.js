/* ───────── Trivia ¿Cuánto sabes? · LATAM Alcohol y Drogas ─────────
   Cada partida se registra en la API (/latam-seguridad/api) para alimentar
   el dashboard. Si la API falla, el juego sigue igual.

   Los textos de preguntas, alternativas y explicaciones son los del documento
   del cliente y no se editan: la legibilidad se resuelve ajustando el tamaño
   a lo que cabe en pantalla (ajustarTexto).                                */

(function () {
  'use strict';

  var POR_PARTIDA = 10;      // preguntas que se juegan
  var SEGUNDOS = 30;         // tiempo por pregunta
  var LETRAS = ['a', 'b', 'c', 'd'];
  var API = 'api/';
  var REINICIO_TOTEM = 60;   // segundos antes de volver a la portada en el tótem
  var BASE = 100;            // puntos por acierto, antes del bono de tiempo
  var BONO = 50;             // bono máximo por responder rápido
  var ARCO = 2 * Math.PI * 17;

  var $ = function (id) { return document.getElementById(id); };

  var pantallas = { inicio: $('p-inicio'), juego: $('p-juego'), fin: $('p-fin') };

  var estado = {
    nombre: '', ronda: [], i: 0, aciertos: 0, puntos: 0, mostrado: 0,
    racha: 0, mejorRacha: 0, respondida: false, historial: [],
    t0: 0, raf: 0, partida: '', tReinicio: 0, ultimoTick: 0
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
    var badge = $('punto-badge');
    badge.textContent = 'Modo tótem' + (canal.punto ? ' · ' + canal.punto : '');
    badge.hidden = false;
  }

  /* ── sonido: se sintetiza, no hay archivos que cargar ── */

  var audio = (function () {
    var ctx = null, activo = true;
    try { activo = localStorage.getItem('latam_sonido') !== 'no'; } catch (e) {}

    function motor() {
      if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (ctx && ctx.state === 'suspended') ctx.resume();
      return ctx;
    }

    function nota(freq, inicio, dur, vol, tipo) {
      var c = motor();
      if (!c) return;
      var osc = c.createOscillator(), gan = c.createGain();
      osc.type = tipo || 'sine';
      osc.frequency.setValueAtTime(freq, c.currentTime + inicio);
      gan.gain.setValueAtTime(0, c.currentTime + inicio);
      gan.gain.linearRampToValueAtTime(vol, c.currentTime + inicio + 0.012);
      gan.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + inicio + dur);
      osc.connect(gan); gan.connect(c.destination);
      osc.start(c.currentTime + inicio);
      osc.stop(c.currentTime + inicio + dur + 0.02);
    }

    var sonidos = {
      toque:   function () { nota(520, 0, .06, .05, 'triangle'); },
      acierto: function () { nota(659, 0, .13, .11); nota(988, .09, .22, .1); },
      error:   function () { nota(196, 0, .2, .1, 'sawtooth'); nota(165, .07, .26, .07, 'sawtooth'); },
      tic:     function () { nota(1180, 0, .04, .05, 'square'); },
      fin:     function () { [523, 659, 784, 1047].forEach(function (f, i) { nota(f, i * .12, .3, .1); }); }
    };

    return {
      esta: function () { return activo; },
      despertar: function () { if (activo) motor(); },
      toca: function (nombre) { if (activo && sonidos[nombre]) sonidos[nombre](); },
      alterna: function () {
        activo = !activo;
        try { localStorage.setItem('latam_sonido', activo ? 'si' : 'no'); } catch (e) {}
        if (activo) { motor(); sonidos.toque(); }
        return activo;
      }
    };
  })();

  var btnSonido = $('sonido');
  function pintarSonido() {
    btnSonido.setAttribute('aria-pressed', audio.esta() ? 'true' : 'false');
    $('sonido-texto').textContent = audio.esta() ? 'Silenciar' : 'Activar sonido';
  }
  pintarSonido();
  btnSonido.addEventListener('click', function () { audio.alterna(); pintarSonido(); });

  function vibrar(patron) {
    if (navigator.vibrate) { try { navigator.vibrate(patron); } catch (e) {} }
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: cuerpo, keepalive: true
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
    document.body.classList.toggle('jugando', clave === 'juego');
    window.scrollTo(0, 0);
  }

  function escapar(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ── arranque ── */

  var total = window.PREGUNTAS.length;
  var porPartida = Math.min(POR_PARTIDA, total);
  $('mini-inicio').textContent =
    porPartida + ' preguntas al azar de un banco de ' + total + ' · ' + SEGUNDOS +
    ' segundos cada una. Responde rápido y encadena aciertos para multiplicar tus puntos.';

  $('form-inicio').addEventListener('submit', function (e) {
    e.preventDefault();
    estado.nombre = $('nombre').value.trim();
    audio.despertar();
    comenzar();
  });

  $('reiniciar').addEventListener('click', comenzar);
  $('siguiente').addEventListener('click', avanzar);

  function comenzar() {
    clearTimeout(estado.tReinicio);
    estado.ronda = mezclar(window.PREGUNTAS).slice(0, porPartida);
    estado.i = 0; estado.aciertos = 0; estado.puntos = 0; estado.mostrado = 0;
    estado.racha = 0; estado.mejorRacha = 0; estado.historial = [];
    estado.partida = nuevoId();

    registrar('partida', {
      id: estado.partida, canal: canal.canal, punto: canal.punto, nombre: estado.nombre
    });

    $('marcador').textContent = '0';
    $('racha').hidden = true;
    mostrar('juego');
    pintarPregunta();
  }

  /* ── pregunta ── */

  function pintarPregunta() {
    var q = estado.ronda[estado.i];
    estado.respondida = false;

    $('contador').textContent = 'Pregunta ' + (estado.i + 1) + ' de ' + estado.ronda.length;
    $('progreso-fill').style.width = (estado.i / estado.ronda.length * 100) + '%';
    $('pregunta').textContent = q.pregunta;

    var ul = $('opciones');
    ul.innerHTML = '';
    q.opciones.forEach(function (texto, idx) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.className = 'opcion';
      b.type = 'button';
      b.style.setProperty('--i', idx);
      b.innerHTML = '<span class="letra">' + LETRAS[idx] + '</span>' +
                    '<span class="texto"></span><span class="marca"></span>';
      b.querySelector('.texto').textContent = texto;
      b.addEventListener('click', function () { responder(idx); });
      li.appendChild(b);
      ul.appendChild(li);
    });

    $('sheet').hidden = true;
    $('arena').classList.remove('con-panel');
    $('arena').style.paddingBottom = '';
    $('arena').scrollTop = 0;
    $('siguiente').textContent =
      estado.i === estado.ronda.length - 1 ? 'Ver resultado' : 'Siguiente';

    ajustarTexto();
    arrancarCrono();
  }

  /* ── el texto del cliente es intocable: lo que cede es el tamaño ── */

  function ajustarTexto() {
    var arena = $('arena');
    var pregunta = $('pregunta');
    var opciones = $('opciones');
    var botones = opciones.querySelectorAll('.opcion');
    var grande = window.innerWidth >= 760;
    var pasos = grande
      ? [[2.0, 1.2, 20], [1.8, 1.14, 18], [1.62, 1.06, 16], [1.46, 1.0, 14],
         [1.3, .94, 12], [1.16, .88, 11]]
      : [[1.5, 1.0, 14], [1.38, .98, 13], [1.26, .94, 12],
         [1.16, .9, 11], [1.08, .86, 10], [1.0, .82, 9]];
    var relleno = 14;

    for (var p = 0; p < pasos.length; p++) {
      relleno = pasos[p][2];
      pregunta.style.fontSize = pasos[p][0] + 'rem';
      botones.forEach(function (b) {
        b.style.fontSize = pasos[p][1] + 'rem';
        b.style.paddingTop = relleno + 'px';
        b.style.paddingBottom = relleno + 'px';
      });
      if (arena.scrollHeight <= arena.clientHeight) break;
    }

    // Reparto del espacio sobrante: hasta 22 px extra de relleno por tarjeta;
    // lo que quede se convierte en separación (space-evenly en el CSS).
    var sobra = opciones.clientHeight - opciones.scrollHeight;
    if (sobra > 0) {
      var extra = Math.min(22, Math.floor(sobra / botones.length / 2));
      botones.forEach(function (b) {
        b.style.paddingTop = (relleno + extra) + 'px';
        b.style.paddingBottom = (relleno + extra) + 'px';
      });
    }
  }

  window.addEventListener('resize', function () {
    if (pantallas.juego.classList.contains('activa')) ajustarTexto();
  });

  /* ── cronómetro ── */

  function arrancarCrono() {
    var crono = $('crono');
    crono.classList.remove('medio', 'poco');
    estado.t0 = performance.now();
    estado.ultimoTick = SEGUNDOS + 1;

    cancelAnimationFrame(estado.raf);
    (function tick() {
      if (estado.respondida) return;
      var queda = segundosRestantes();
      var frac = queda / SEGUNDOS;

      $('crono-arco').style.strokeDashoffset = ARCO * (1 - frac);
      var entero = Math.ceil(queda);
      $('crono-num').textContent = entero;

      crono.classList.toggle('medio', frac <= .5 && frac > .2);
      crono.classList.toggle('poco', frac <= .2);

      if (entero <= 5 && entero !== estado.ultimoTick) {
        estado.ultimoTick = entero;
        if (entero > 0) audio.toca('tic');
      }

      if (queda <= 0) { responder(-1); return; }
      estado.raf = requestAnimationFrame(tick);
    })();
  }

  function segundosRestantes() {
    return Math.max(0, SEGUNDOS - (performance.now() - estado.t0) / 1000);
  }

  /* ── respuesta ── */

  function responder(idx) {
    if (estado.respondida) return;
    estado.respondida = true;
    cancelAnimationFrame(estado.raf);
    $('crono').classList.remove('medio', 'poco');

    var q = estado.ronda[estado.i];
    var bien = idx === q.correcta;
    var botones = $('opciones').querySelectorAll('.opcion');
    var sobra = segundosRestantes();

    botones.forEach(function (b, i) {
      b.disabled = true;
      if (i === q.correcta) {
        b.classList.add('buena');
        b.querySelector('.marca').textContent = '✓';
      } else if (i === idx) {
        b.classList.add('mala');
        b.querySelector('.marca').textContent = '✕';
      } else {
        b.classList.add('apagada');
      }
    });

    var ganados = 0;
    if (bien) {
      estado.aciertos++;
      estado.racha++;
      estado.mejorRacha = Math.max(estado.mejorRacha, estado.racha);
      var multi = multiplicador();
      ganados = Math.round((BASE + sobra / SEGUNDOS * BONO) * multi);
      estado.puntos += ganados;
      audio.toca('acierto');
      vibrar(35);
      volar(idx >= 0 ? botones[idx] : botones[q.correcta], '+' + ganados);
      animarMarcador();
    } else {
      estado.racha = 0;
      audio.toca('error');
      vibrar([25, 55, 25]);
    }
    pintarRacha();

    estado.historial.push({ q: q, bien: bien, sinResponder: idx === -1 });

    registrar('respuesta', {
      partida: estado.partida, pregunta: q.id, elegida: idx, correcta: bien,
      segundos: Math.round((SEGUNDOS - sobra) * 10) / 10
    });

    var v = $('veredicto');
    if (idx === -1) { v.textContent = 'Se acabó el tiempo'; v.className = 'veredicto no'; }
    else if (bien)  { v.textContent = estado.racha >= 3 ? '¡Van ' + estado.racha + ' seguidas!' : '¡Correcto!'; v.className = 'veredicto ok'; }
    else            { v.textContent = 'Incorrecto'; v.className = 'veredicto no'; }

    $('ganados').textContent = ganados ? '+' + ganados : '';
    $('correcta-txt').innerHTML = '<b>' + LETRAS[q.correcta] + ')</b> ' + escapar(q.opciones[q.correcta]);
    $('explica-txt').textContent = q.explicacion;
    var sheet = $('sheet');
    sheet.hidden = false;
    sheet.scrollTop = 0;
    requestAnimationFrame(function () {
      var arena = $('arena');
      arena.classList.add('con-panel');
      arena.style.paddingBottom = (sheet.offsetHeight + 14) + 'px';
    });

    // Las alternativas descartadas se repliegan una vez que se vio el resultado.
    setTimeout(function () {
      botones.forEach(function (b, i) {
        if (i !== q.correcta && i !== idx) {
          b.parentElement.style.maxHeight = b.parentElement.offsetHeight + 'px';
          b.parentElement.classList.add('fuera');
        }
      });
    }, 520);

    $('siguiente').focus({ preventScroll: true });
  }

  function multiplicador() {
    if (estado.racha >= 7) return 3;
    if (estado.racha >= 5) return 2;
    if (estado.racha >= 3) return 1.5;
    return 1;
  }

  function pintarRacha() {
    var chip = $('racha');
    var m = multiplicador();
    if (m > 1) {
      $('racha-x').textContent = '×' + m;
      if (chip.hidden) { chip.hidden = false; }
      else { chip.style.animation = 'none'; void chip.offsetWidth; chip.style.animation = ''; }
    } else {
      chip.hidden = true;
    }
  }

  /* ── puntos que suben al marcador ── */

  function volar(desde, texto) {
    var r = desde.getBoundingClientRect();
    var s = document.createElement('span');
    s.className = 'chispa';
    s.textContent = texto;
    s.style.left = (r.left + r.width / 2) + 'px';
    s.style.top = (r.top + 6) + 'px';
    document.body.appendChild(s);
    setTimeout(function () { s.remove(); }, 1000);
  }

  function animarMarcador() {
    var el = $('marcador');
    var desde = estado.mostrado, hasta = estado.puntos, t0 = performance.now();
    el.classList.add('salta');
    setTimeout(function () { el.classList.remove('salta'); }, 200);
    (function paso(ahora) {
      var k = Math.min(1, (ahora - t0) / 600);
      var v = Math.round(desde + (hasta - desde) * (1 - Math.pow(1 - k, 3)));
      el.textContent = v;
      estado.mostrado = v;
      if (k < 1) requestAnimationFrame(paso);
    })(performance.now());
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
    audio.toca('fin');
    $('fin-aciertos').textContent = n;
    $('fin-total').textContent = '/' + t;

    registrar('fin', {
      partida: estado.partida, aciertos: n, total: t, puntos: estado.puntos
    });

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
    $('fin-mensaje').textContent = mensaje +
      (estado.mejorRacha >= 3 ? ' Tu mejor racha fue de ' + estado.mejorRacha + ' respuestas seguidas.' : '');

    contarPuntos();

    var arco = $('arco');
    arco.style.transition = 'none';
    arco.style.strokeDashoffset = 327;
    void arco.getBoundingClientRect();
    setTimeout(function () {
      arco.style.transition = '';
      arco.style.strokeDashoffset = 327 * (1 - pct);
    }, 90);

    // El repaso lista solo lo que falló: es lo único accionable y deja la
    // pantalla final corta.
    var fallidas = estado.historial.filter(function (h) { return !h.bien; });
    var ul = $('repaso');
    ul.innerHTML = '';
    $('repaso-titulo').hidden = fallidas.length === 0;
    fallidas.forEach(function (h) {
      var li = document.createElement('li');
      var ico = document.createElement('span');
      ico.className = 'ico no';
      ico.textContent = '✕';
      var txt = document.createElement('span');
      txt.textContent = h.q.pregunta;
      li.appendChild(ico); li.appendChild(txt);
      ul.appendChild(li);
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
  }

  function contarPuntos() {
    var el = $('fin-puntos'), hasta = estado.puntos, t0 = performance.now();
    (function paso(ahora) {
      var k = Math.min(1, (ahora - t0) / 1100);
      el.textContent = Math.round(hasta * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(paso);
    })(performance.now());
  }
})();
