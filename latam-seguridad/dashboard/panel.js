/* ───────── Panel de la activación · LATAM Alcohol y Drogas ─────────
   Lee /latam-seguridad/api/stats (requiere la clave del panel) y pinta
   participación, desempeño por pregunta y actividad. El modo "datos de
   ejemplo" es simulado y está rotulado como tal en pantalla.          */

(function () {
  'use strict';

  var API = '../api/';
  var CANALES = ['totem', 'online'];
  var NOMBRE_CANAL = { totem: 'Tótem', online: 'Online' };
  var LETRAS = ['a', 'b', 'c', 'd'];
  var REFRESCO = 30000;

  var $ = function (s) { return document.querySelector(s); };
  var banco = window.PREGUNTAS || [];
  var porId = {};
  banco.forEach(function (q) { porId[q.id] = q; });

  var timer = 0;

  /* ── arranque ── */

  cargar();

  $('#gate-form').addEventListener('submit', function (e) {
    e.preventDefault();
    fetch(API + 'acceso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave: $('#clave').value })
    }).then(function (r) {
      if (!r.ok) { $('#gate-error').hidden = false; return; }
      $('#gate-error').hidden = true;
      cargar();
    }).catch(function () { $('#gate-error').hidden = false; });
  });

  $('#actualizar').addEventListener('click', function () { cargar(); });
  $('#orden').addEventListener('change', function () { if (ultimo) pintar(ultimo); });
  $('#demo-toggle').addEventListener('change', function () {
    $('#aviso-demo').hidden = !this.checked;
    if (this.checked) { clearInterval(timer); pintar(datosDeEjemplo()); }
    else cargar();
  });

  var ultimo = null;

  function cargar() {
    if ($('#demo-toggle').checked) { pintar(datosDeEjemplo()); return; }
    fetch(API + 'stats', { headers: { 'Accept': 'application/json' } })
      .then(function (r) {
        if (r.status === 401) { mostrarGate(); return null; }
        if (!r.ok) throw new Error('error ' + r.status);
        return r.json();
      })
      .then(function (d) {
        if (!d) return;
        mostrarPanel();
        pintar(d);
        clearInterval(timer);
        timer = setInterval(cargar, REFRESCO);
      })
      .catch(function (e) {
        mostrarPanel();
        $('#sello').textContent = 'Sin conexión con la API (' + e.message + ')';
      });
  }

  function mostrarGate() { $('#gate').hidden = false; $('#panel').hidden = true; }
  function mostrarPanel() { $('#gate').hidden = true; $('#panel').hidden = false; }

  /* ── normalización ── */

  function normalizar(d) {
    var res = { totem: vacioCanal(), online: vacioCanal() };
    (d.resumen || []).forEach(function (r) {
      if (!res[r.canal]) return;
      res[r.canal].partidas = r.partidas || 0;
      res[r.canal].completadas = r.completadas || 0;
      res[r.canal].aciertosProm = r.aciertos_prom;
      res[r.canal].totalProm = r.total_prom;
    });

    var preguntas = {};
    (d.preguntas || []).forEach(function (p) {
      var f = preguntas[p.pregunta] || (preguntas[p.pregunta] = {
        id: p.pregunta, totem: { n: 0, ok: 0, seg: null }, online: { n: 0, ok: 0, seg: null }
      });
      if (!f[p.canal]) return;
      f[p.canal] = { n: p.n || 0, ok: p.ok || 0, seg: p.segundos };
      res[p.canal].respuestas += p.n || 0;
      res[p.canal].correctas += p.ok || 0;
      if (p.segundos != null) {
        res[p.canal].segAcum += p.segundos * (p.n || 0);
        res[p.canal].segN += p.n || 0;
      }
    });

    var alts = {};
    (d.alternativas || []).forEach(function (a) {
      (alts[a.pregunta] || (alts[a.pregunta] = {}))[a.elegida] = a.n;
    });

    return {
      generado: d.generado,
      canales: res,
      preguntas: Object.keys(preguntas).map(function (k) { return preguntas[k]; }),
      alternativas: alts,
      actividad: d.actividad || [],
      ultimas: d.ultimas || []
    };
  }

  function vacioCanal() {
    return { partidas: 0, completadas: 0, respuestas: 0, correctas: 0, segAcum: 0, segN: 0,
             aciertosProm: null, totalProm: null };
  }

  /* ── pintado ── */

  function pintar(bruto) {
    ultimo = bruto;
    var d = normalizar(bruto);
    $('#sello').textContent = 'Actualizado ' + hora(d.generado || new Date().toISOString());
    kpis(d);
    tabla(d);
    actividad(d);
    ultimas(d);
  }

  function num(v, dec) {
    if (v == null || isNaN(v)) return '—';
    return Number(v).toLocaleString('es-CL', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  }
  function pct(ok, n) { return n ? Math.round(ok / n * 100) : null; }

  function kpis(d) {
    var t = d.canales.totem, o = d.canales.online;
    var partidas = t.partidas + o.partidas;
    var completadas = t.completadas + o.completadas;
    var resp = t.respuestas + o.respuestas;
    var corr = t.correctas + o.correctas;
    var segN = t.segN + o.segN;
    var seg = segN ? (t.segAcum + o.segAcum) / segN : null;
    var aciertoProm = completadas
      ? ((t.aciertosProm || 0) * t.completadas + (o.aciertosProm || 0) * o.completadas) / completadas
      : null;

    var tiles = [
      {
        rotulo: 'Participantes',
        cifra: num(partidas),
        desglose: [t.partidas, o.partidas].map(function (v) { return num(v); })
      },
      {
        rotulo: 'Partidas completadas',
        cifra: num(completadas),
        sufijo: partidas ? Math.round(completadas / partidas * 100) + '% de finalización' : '',
        desglose: [t.completadas, o.completadas].map(function (v) { return num(v); })
      },
      {
        rotulo: 'Respuestas correctas',
        cifra: pct(corr, resp) == null ? '—' : pct(corr, resp) + '%',
        sufijo: num(resp) + ' respuestas registradas',
        desglose: [pct(t.correctas, t.respuestas), pct(o.correctas, o.respuestas)]
          .map(function (v) { return v == null ? '—' : v + '%'; })
      },
      {
        rotulo: 'Aciertos por partida',
        cifra: aciertoProm == null ? '—' : num(aciertoProm, 1),
        unidad: '/ 10',
        desglose: [t.aciertosProm, o.aciertosProm].map(function (v) { return v == null ? '—' : num(v, 1); })
      },
      {
        rotulo: 'Tiempo por respuesta',
        cifra: seg == null ? '—' : num(seg, 1),
        unidad: 's',
        desglose: [t.segN ? num(t.segAcum / t.segN, 1) + 's' : '—',
                   o.segN ? num(o.segAcum / o.segN, 1) + 's' : '—']
      }
    ];

    $('#kpis').innerHTML = tiles.map(function (k) {
      return '<div class="kpi">' +
        '<div class="rotulo">' + k.rotulo + '</div>' +
        '<div class="cifra">' + k.cifra + (k.unidad ? ' <small>' + k.unidad + '</small>' : '') + '</div>' +
        (k.sufijo ? '<div class="sub">' + k.sufijo + '</div>' : '') +
        '<div class="desglose">' +
          '<span><i class="punto-totem"></i>Tótem ' + k.desglose[0] + '</span>' +
          '<span><i class="punto-online"></i>Online ' + k.desglose[1] + '</span>' +
        '</div></div>';
    }).join('');
  }

  function medidor(canal, dato) {
    if (!dato || !dato.n) return '<div class="medidor"><span class="vacio">Sin datos</span></div>';
    var p = pct(dato.ok, dato.n);
    var color = canal === 'totem' ? 'var(--totem)' : 'var(--online)';
    return '<div class="medidor" title="' + dato.ok + ' de ' + dato.n + ' correctas">' +
             '<div class="via"><i style="width:' + p + '%;background:' + color + '"></i></div>' +
             '<span class="pct">' + p + '%</span>' +
             '<span class="n">' + dato.n + '</span>' +
           '</div>';
  }

  function alternativas(q, mapa) {
    if (!mapa) return '<span class="vacio">—</span>';
    var total = 0;
    for (var k in mapa) total += mapa[k];
    if (!total) return '<span class="vacio">—</span>';
    var barras = LETRAS.map(function (letra, i) {
      var n = mapa[i] || 0;
      var alto = Math.round(n / total * 26) + 2;
      var esOk = q && q.correcta === i;
      return '<div class="alt' + (esOk ? ' ok' : '') + '" title="' + letra + ') ' +
             Math.round(n / total * 100) + '% · ' + n + ' respuestas">' +
             '<b style="height:' + alto + 'px"></b><span>' + letra + '</span></div>';
    }).join('');
    var sinResp = mapa[-1] || 0;
    return '<div class="alts">' + barras + '</div>' +
           (sinResp ? '<div class="sub">' + sinResp + ' sin responder</div>' : '');
  }

  function tabla(d) {
    var orden = $('#orden').value;
    var filas = d.preguntas.slice();

    var tasa = function (f) {
      var n = f.totem.n + f.online.n, ok = f.totem.ok + f.online.ok;
      return n ? ok / n : 2;                 // sin datos → al final
    };
    if (orden === 'falladas') filas.sort(function (a, b) { return tasa(a) - tasa(b); });
    else if (orden === 'volumen') filas.sort(function (a, b) {
      return (b.totem.n + b.online.n) - (a.totem.n + a.online.n);
    });
    else filas.sort(function (a, b) { return a.id - b.id; });

    var tbody = $('#tabla-preguntas tbody');
    if (!filas.length) {
      tbody.innerHTML = '<tr><td colspan="4"><div class="estado-vacio">' +
        'Todavía no hay respuestas registradas.<br>' +
        'Abre la trivia en el tótem con <code>?canal=totem&amp;punto=SCL-T2</code> ' +
        'y comparte el enlace online para empezar a medir.' +
        '</div></td></tr>';
      return;
    }

    tbody.innerHTML = filas.map(function (f) {
      var q = porId[f.id];
      return '<tr>' +
        '<td class="col-q"><span class="q-num">' + f.id + '</span>' +
        '<span class="q-texto">' + (q ? escapar(q.pregunta) : 'Pregunta ' + f.id) + '</span></td>' +
        '<td>' + medidor('totem', f.totem) + '</td>' +
        '<td>' + medidor('online', f.online) + '</td>' +
        '<td>' + alternativas(q, d.alternativas[f.id]) + '</td>' +
      '</tr>';
    }).join('');
  }

  function actividad(d) {
    var dias = {};
    d.actividad.forEach(function (a) {
      (dias[a.dia] || (dias[a.dia] = { totem: 0, online: 0 }))[a.canal] = a.n;
    });
    var claves = Object.keys(dias).sort();
    var cont = $('#actividad');

    if (!claves.length) {
      cont.innerHTML = '<div class="estado-vacio">Sin participaciones todavía.</div>';
      return;
    }

    var max = Math.max.apply(null, claves.map(function (k) {
      return dias[k].totem + dias[k].online;
    })) || 1;

    cont.innerHTML = claves.map(function (k) {
      var v = dias[k], total = v.totem + v.online;
      var alto = function (n) { return n ? Math.max(3, Math.round(n / max * 120)) : 0; };
      return '<div class="dia">' +
        '<span class="tot">' + total + '</span>' +
        '<div class="columna">' +
          (v.totem ? '<i class="totem" style="height:' + alto(v.totem) + 'px" title="Tótem: ' + v.totem + '"></i>' : '') +
          (v.online ? '<i class="online" style="height:' + alto(v.online) + 'px" title="Online: ' + v.online + '"></i>' : '') +
        '</div>' +
        '<span class="etq">' + diaCorto(k) + '</span>' +
      '</div>';
    }).join('');
  }

  function ultimas(d) {
    var ul = $('#ultimas');
    if (!d.ultimas.length) {
      ul.innerHTML = '<div class="estado-vacio">Sin participaciones todavía.</div>';
      return;
    }
    ul.innerHTML = d.ultimas.map(function (u) {
      var quien = escapar(u.nombre || 'Anónimo') +
        (u.punto ? ' · ' + escapar(u.punto) : '');
      var marca = u.completada
        ? u.aciertos + '/' + u.total
        : '<span class="incompleta">sin terminar</span>';
      return '<li>' +
        '<i class="punto-' + (u.canal === 'totem' ? 'totem' : 'online') + '"></i>' +
        '<span class="quien">' + quien + '</span>' +
        '<span class="marca">' + marca + '</span>' +
        '<span class="cuando">' + hora(u.momento) + '</span>' +
      '</li>';
    }).join('');
  }

  /* ── helpers ── */

  function escapar(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function hora(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
  function diaCorto(iso) {
    var d = new Date(iso + 'T12:00:00');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
  }

  /* ── datos de ejemplo (simulados, rotulados en pantalla) ── */

  function datosDeEjemplo() {
    var semilla = 7;
    var rnd = function () { semilla = (semilla * 1103515245 + 12345) % 2147483648; return semilla / 2147483648; };

    var dificultad = [.86, .91, .74, .62, .93, .95, .81, .58, .88, .69,
                      .72, .66, .97, .54, .63, .84, .59, .71];
    var resumen = [], preguntas = [], alternativas = [], actividad = [], ultimas = [];
    var partidas = { totem: 168, online: 94 };
    var completadas = { totem: 141, online: 71 };

    CANALES.forEach(function (canal) {
      resumen.push({
        canal: canal,
        partidas: partidas[canal],
        completadas: completadas[canal],
        aciertos_prom: canal === 'totem' ? 7.4 : 7.9,
        total_prom: 10,
        puntos_prom: canal === 'totem' ? 1045 : 1120
      });
    });

    banco.forEach(function (q, i) {
      var base = dificultad[i % dificultad.length];
      CANALES.forEach(function (canal) {
        var n = Math.round(completadas[canal] * 10 / banco.length * (0.75 + rnd() * 0.5));
        var tasa = Math.min(.99, Math.max(.25, base + (canal === 'online' ? .04 : 0) + (rnd() - .5) * .1));
        preguntas.push({
          pregunta: q.id, canal: canal, n: n,
          ok: Math.round(n * tasa),
          segundos: 6 + rnd() * 9
        });
      });
      var nTot = 0;
      preguntas.slice(-2).forEach(function (p) { nTot += p.n; });
      var okTot = 0;
      preguntas.slice(-2).forEach(function (p) { okTot += p.ok; });
      var resto = nTot - okTot;
      alternativas.push({ pregunta: q.id, elegida: q.correcta, n: okTot });
      [0, 1, 2, 3].filter(function (k) { return k !== q.correcta; }).forEach(function (k, j, arr) {
        alternativas.push({ pregunta: q.id, elegida: k, n: Math.round(resto / arr.length) });
      });
    });

    var hoy = new Date();
    for (var d = 4; d >= 0; d--) {
      var f = new Date(hoy.getTime() - d * 86400000).toISOString().slice(0, 10);
      actividad.push({ dia: f, canal: 'totem', n: Math.round(20 + rnd() * 26) });
      actividad.push({ dia: f, canal: 'online', n: Math.round(8 + rnd() * 18) });
    }

    var nombres = ['Camila', 'Rodrigo', 'Valentina', 'Matías', 'Francisca', 'Sebastián',
                   'Josefa', 'Cristóbal', 'Antonia', 'Diego', '', 'Paula'];
    var puntos = ['SCL-T2', 'SCL-Mantenimiento', 'SCL-Carga', ''];
    for (var i = 0; i < 14; i++) {
      var canal = rnd() > .38 ? 'totem' : 'online';
      var ok = Math.round(5 + rnd() * 5);
      ultimas.push({
        nombre: nombres[Math.floor(rnd() * nombres.length)],
        canal: canal,
        punto: canal === 'totem' ? puntos[Math.floor(rnd() * puntos.length)] : '',
        aciertos: ok, total: 10, puntos: ok * 135,
        completada: rnd() > .12 ? 1 : 0,
        momento: new Date(hoy.getTime() - i * 1000 * 60 * 17).toISOString()
      });
    }

    return { generado: new Date().toISOString(), resumen: resumen, preguntas: preguntas,
             alternativas: alternativas, actividad: actividad, ultimas: ultimas };
  }
})();
