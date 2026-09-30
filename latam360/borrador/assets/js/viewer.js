// LATAM 360 — BORRADOR del visor (CCO · Santiago).
// Misma tecnología que el demo (PlayCanvas 2.19.6 + GSplat + CameraControls) y el mismo
// sistema de call-outs (hotspots proyectados 3D→pantalla + tarjeta). Versión reducida a
// una sola parada. El splat del CCO está en entrenamiento: mientras tanto se carga, POR
// REFERENCIA, el splat de demostración CF-100 del demo (/latam360/assets/splats/).
import * as pc from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

// ---------------------------------------------------------------------------
// Configuración de la parada
// ---------------------------------------------------------------------------
// Assets compartidos con el demo (mismo sitio; /latam360/assets/ se sirve sin clave).
const ASSETS = '/latam360/assets';

const STOP = {
  id: 'cco',
  // TODO: reemplazar por el splat del CCO cuando termine el entrenamiento (ej. /latam360/assets/splats/cco.sog)
  splatUrl: `${ASSETS}/splats/cf100-lite.sog`,
  placeholder: true,
  // Encuadre inicial (coordenadas de mundo del splat provisional; re-medir con el del CCO)
  focus: [-8.5, 4.5, -16.5],
  camera: [3.5, 8.5, -4.5]
};

// Paradas del recorrido (una por país). Solo el CCO tiene contenido.
const STOPS_MENU = [
  { name: 'CCO', place: 'Santiago · Chile', tag: 'En producción', active: true },
  { name: 'São Paulo', place: 'Brasil', tag: 'Próximamente' },
  { name: 'Lima', place: 'Perú', tag: 'Próximamente' },
  { name: 'Bogotá', place: 'Colombia', tag: 'Próximamente' },
  { name: 'Quito', place: 'Ecuador', tag: 'Próximamente' },
  { name: 'Miami', place: 'Estados Unidos', tag: 'Próximamente' }
];

// Mensajes del recorrido guiado (la locución del CCO aún no existe).
const TOUR_MESSAGES = [
  'Bienvenido a <b>LATAM 360°</b>',
  'Santiago de Chile · <b>CCO</b>',
  'Desde aquí se controlan todos los vuelos de LATAM',
  'Toca los puntos para abrir los <b>videos 360</b>'
];

// Hotspots. Regla de diseño: el splat es solo el espacio quieto; personas y pantallas
// en vivo van en videos 360 aparte, que se abren desde estos puntos.
// Las posiciones son las del demo (anclajes del CF-100) y se re-medirán sobre el splat
// del CCO. El video es el de ejemplo del demo (Vimeo, plano) hasta tener los 360.
const SAMPLE_VIDEO = 'https://player.vimeo.com/video/1206534909?h=e572ee7fb2';
const HOTSPOTS = [
  {
    pos: [-8.5, 5.5, -17],
    label: '▶ Video 360 · El equipo',
    title: 'El equipo del CCO',
    subtitle: 'Video 360 · próximamente',
    video: SAMPLE_VIDEO,
    is360: true,
    body:
      '<p>Aquí se abrirá un video 360 con las personas que trabajan en la sala.</p>' +
      '<p class="callout__note">Borrador: se muestra el video de ejemplo del demo (plano).</p>'
  },
  {
    pos: [-8.5, 8, -15.5],
    label: '▶ Video 360 · Pantallas en vivo',
    title: 'Pantallas en vivo',
    subtitle: 'Video 360 · próximamente',
    video: SAMPLE_VIDEO,
    is360: true,
    body:
      '<p>Las pantallas del CCO se verán en funcionamiento en un video 360 propio: el splat solo muestra el espacio.</p>' +
      '<p class="callout__note">Borrador: se muestra el video de ejemplo del demo (plano).</p>'
  },
  {
    pos: [-8.5, 1.5, -15],
    label: 'El espacio',
    title: 'La sala',
    subtitle: 'CCO · Santiago',
    body:
      '<p>El splat reconstruye la sala quieta, tal como es. Muévete libremente para recorrerla.</p>' +
      '<p class="callout__note">Borrador: punto de información de ejemplo.</p>'
  }
];

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------
const $ = (s) => document.querySelector(s);
const IS_TOUCH = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;

const loader = {
  _raf: 0, _pct: 0, _t0: 0, _on: false,
  start() {
    this._on = true; this._t0 = performance.now(); this._tick();
  },
  _tick() {
    if (!this._on) return;
    const t = (performance.now() - this._t0) / 1000;
    const target = 96 * (1 - Math.exp(-t / 3.5));
    if (target > this._pct) this._pct = target;
    this._render(this._pct);
    this._raf = requestAnimationFrame(() => this._tick());
  },
  _render(p) {
    $('#loader-pct').textContent = `${Math.round(p)}%`;
    $('#loader-bar').style.width = `${p}%`;
  },
  done() {
    this._on = false; cancelAnimationFrame(this._raf); this._render(100);
    $('#loader').classList.add('hidden');
  },
  error(msg) {
    this._on = false; cancelAnimationFrame(this._raf);
    const el = $('#loader');
    el.classList.add('is-error');
    $('#loader-text').textContent = msg;
    $('#loader-pct').textContent = '';
  }
};

function buildMenu() {
  const wrap = $('#scenes');
  STOPS_MENU.forEach((s) => {
    const b = document.createElement('button');
    b.className = 'scene-card' + (s.active ? ' active' : '');
    if (!s.active) b.disabled = true;
    b.innerHTML =
      `<span class="scene-card__name">${s.name}</span>` +
      `<span class="scene-card__place">${s.place}</span>` +
      `<span class="scene-card__tag">${s.tag}</span>`;
    wrap.appendChild(b);
  });
}

function setupWelcome() {
  const el = $('#welcome');
  const kbd = (k) => `<kbd class="welcome__kbd">${k}</kbd>`;
  const rows = IS_TOUCH
    ? [
        ['👆', 'Avanzar y retroceder', 'Desliza un dedo (izquierda) arriba y abajo'],
        ['✋', 'Cambiar la dirección', 'Desliza el otro dedo (derecha) a los lados'],
        ['●', 'Videos 360', 'Toca los puntos para abrirlos']
      ]
    : [
        ['🖱️', 'Mirar alrededor', 'Arrastra con el mouse'],
        ['⌨️', 'Moverte', kbd('W') + kbd('A') + kbd('S') + kbd('D') + ' <i>o</i> ' + kbd('↑') + kbd('↓') + kbd('←') + kbd('→')],
        ['⚡', 'Ir más rápido', 'Mantén ' + kbd('Shift') + ' mientras te mueves'],
        ['●', 'Videos 360', 'Haz clic en los puntos para abrirlos']
      ];
  $('#welcome-rows').innerHTML = rows
    .map((r) => `<div class="welcome__row"><span class="welcome__ico">${r[0]}</span><div><b>${r[1]}</b><span>${r[2]}</span></div></div>`)
    .join('');
  $('#welcome-note').textContent = 'O inicia el recorrido guiado desde la barra superior.';
  if (new URLSearchParams(location.search).has('nowelcome')) return;
  el.hidden = false;
  $('#welcome-start').addEventListener('click', () => {
    el.classList.add('welcome--out');
    setTimeout(() => { el.hidden = true; }, 400);
  });
}

// ---------------------------------------------------------------------------
// Call-outs (misma lógica que el demo, simplificada)
// ---------------------------------------------------------------------------
const callouts = {
  markers: [],
  scr: new pc.Vec3(),
  cam: null,
  init(camEntity) {
    this.cam = camEntity;
    const layer = $('#callout-markers');
    HOTSPOTS.forEach((hs) => {
      const el = document.createElement('button');
      el.className = 'hotspot';
      el.innerHTML = `<span class="hotspot__dot"></span><span class="hotspot__label">${hs.label}</span>`;
      el.style.display = 'none';
      layer.appendChild(el);
      const m = { el, hs, pos: new pc.Vec3(hs.pos[0], hs.pos[1], hs.pos[2]), x: 0, y: 0 };
      el.addEventListener('click', () => this.open(m));
      this.markers.push(m);
    });
    $('#callout-close').addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
  },
  update() {
    if (!this.cam) return;
    const ready = $('#loader').classList.contains('hidden');
    const hidden = document.body.classList.contains('touring');
    for (const m of this.markers) {
      if (!ready || hidden) { m.el.style.display = 'none'; continue; }
      this.cam.camera.worldToScreen(m.pos, this.scr);
      if (this.scr.z <= 0) { m.el.style.display = 'none'; continue; }
      m.x = this.scr.x; m.y = this.scr.y;
      m.el.style.display = '';
      m.el.style.transform = `translate(-50%, -50%) translate(${m.x}px, ${m.y}px)`;
    }
  },
  open(m) {
    const hs = m.hs;
    let media = '';
    if (hs.video) {
      media +=
        `<div class="callout__video"><iframe src="${hs.video}" title="${hs.title}" frameborder="0" ` +
        `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    }
    $('#callout-media').innerHTML = media;
    $('#callout-body').innerHTML =
      `<h3 class="callout__title">${hs.title}</h3>` +
      `<div class="callout__sub">${hs.is360 ? '<span class="callout__badge">360°</span> ' : ''}${hs.subtitle}</div>${hs.body}`;
    const card = $('#callout');
    card.hidden = false;
    // Anclar junto al punto en escritorio; hoja inferior en móvil (CSS).
    if (window.innerWidth > 820) {
      card.style.right = 'auto'; card.style.bottom = 'auto';
      const w = card.offsetWidth, h = card.offsetHeight, pad = 16;
      let left = m.x + 22;
      if (left + w > window.innerWidth - pad) left = m.x - 22 - w;
      if (left < pad) left = pad;
      let top = m.y - h / 2;
      if (top + h > window.innerHeight - pad) top = window.innerHeight - pad - h;
      if (top < 80) top = 80;
      card.style.left = `${left}px`; card.style.top = `${top}px`;
    }
  },
  close() {
    $('#callout-media').innerHTML = ''; // detiene el video
    $('#callout').hidden = true;
  }
};

// ---------------------------------------------------------------------------
// Recorrido guiado: subtítulos + música (la locución del CCO está pendiente)
// ---------------------------------------------------------------------------
let touring = false, tourTimers = [], cc = null, camera = null, focus = null, orbitR = 10, orbitT0 = 0, orbitA0 = 0;
function setupTour() {
  const btn = $('#tour-btn');
  const audio = $('#tour-audio');
  const cap = $('#tour-caption');
  btn.hidden = false;
  const stop = () => {
    touring = false;
    document.body.classList.remove('touring');
    tourTimers.forEach(clearTimeout); tourTimers = [];
    cap.classList.remove('show');
    audio.pause();
    if (cc) {
      if (camera && focus) cc.reset(focus, camera.getPosition()); // continúa desde la pose actual
      cc.enabled = true;
    }
    btn.classList.remove('active');
    btn.querySelector('.tour-btn__label').textContent = 'Iniciar recorrido';
    btn.querySelector('.tour-btn__icon').textContent = '▶';
  };
  btn.addEventListener('click', () => {
    if (touring) return stop();
    touring = true;
    callouts.close();
    document.body.classList.add('touring');
    btn.classList.add('active');
    btn.querySelector('.tour-btn__label').textContent = 'Detener';
    btn.querySelector('.tour-btn__icon').textContent = '■';
    if (!$('#mute-btn').classList.contains('muted')) audio.play().catch(() => {});
    if (cc) cc.enabled = false;
    if (camera && focus) {
      const p = camera.getPosition();
      orbitA0 = Math.atan2(p.z - focus.z, p.x - focus.x);
      orbitT0 = performance.now();
    }
    TOUR_MESSAGES.forEach((msg, i) => {
      tourTimers.push(setTimeout(() => { cap.innerHTML = msg; cap.classList.add('show'); }, 800 + i * 4500));
      tourTimers.push(setTimeout(() => cap.classList.remove('show'), 800 + i * 4500 + 3800));
    });
    tourTimers.push(setTimeout(stop, 800 + TOUR_MESSAGES.length * 4500 + 400));
  });
  $('#mute-btn').addEventListener('click', () => {
    const b = $('#mute-btn');
    const muted = !b.classList.contains('muted');
    b.classList.toggle('muted', muted);
    $('#mute-icon').textContent = muted ? '🔇' : '🔊';
    if (muted) audio.pause(); else if (touring) audio.play().catch(() => {});
  });
}

// ---------------------------------------------------------------------------
// App PlayCanvas (basado en scenes/cf100.mjs del demo)
// ---------------------------------------------------------------------------
async function main() {
  buildMenu();
  setupWelcome();
  loader.start();

  const canvas = document.getElementById('application-canvas');
  // WebGPU solo si hay adaptador real (evita el intento fallido + error en consola
  // en navegadores que exponen navigator.gpu sin adaptador); si no, WebGL2 (como el demo).
  let useWebgpu = false;
  try { useWebgpu = !!(navigator.gpu && (await navigator.gpu.requestAdapter())); } catch (e) { useWebgpu = false; }
  let device;
  try {
    device = await pc.createGraphicsDevice(canvas, {
      deviceTypes: useWebgpu ? ['webgpu', 'webgl2'] : ['webgl2'],
      antialias: false
    });
  } catch (e) {
    console.warn('[LATAM360] Sin dispositivo gráfico:', e);
    loader.error('Este navegador no soporta WebGL2/WebGPU.');
    return;
  }
  device.maxPixelRatio = pc.platform.mobile ? 1 : Math.min(window.devicePixelRatio, 1.25);

  const opts = new pc.AppOptions();
  opts.graphicsDevice = device;
  opts.mouse = new pc.Mouse(document.body);
  opts.touch = new pc.TouchDevice(document.body);
  opts.keyboard = new pc.Keyboard(window);
  opts.componentSystems = [pc.RenderComponentSystem, pc.CameraComponentSystem, pc.ScriptComponentSystem, pc.GSplatComponentSystem];
  opts.resourceHandlers = [pc.TextureHandler, pc.ContainerHandler, pc.ScriptHandler, pc.GSplatHandler];

  const app = new pc.AppBase(canvas);
  app.init(opts);
  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);
  window.addEventListener('resize', () => app.resizeCanvas());

  const asset = new pc.Asset('cco', 'gsplat', { url: STOP.splatUrl });
  asset.on('error', (err) => {
    console.warn('[LATAM360] Error cargando splat:', err);
    loader.error('No se pudo cargar el splat. Revisa la conexión.');
  });
  const all = new pc.AssetListLoader([asset], app.assets);
  all.load((err) => {
    if (err) return;
    app.start();

    const ent = new pc.Entity('splat');
    ent.addComponent('gsplat', { asset });
    ent.setLocalEulerAngles(180, 0, 0); // convención SuperSplat (igual que el demo)
    app.root.addChild(ent);

    camera = new pc.Entity('camera');
    camera.addComponent('camera', { clearColor: new pc.Color(0.05, 0.04, 0.09), fov: 65, toneMapping: pc.TONEMAP_ACES });
    camera.setLocalPosition(10, 3, 10);
    app.root.addChild(camera);
    camera.addComponent('script');
    cc = camera.script.create(CameraControls);
    Object.assign(cc, { sceneSize: 10, moveSpeed: 4, moveFastSpeed: 15, enableOrbit: false, enablePan: false });

    callouts.init(camera);
    setupTour();

    // Encuadre: posición FIJA de cámara (los anclajes del demo son coordenadas fijas de
    // mundo; el aabb del splat no es fiable — ver nota en app.js del demo). Ajustable por
    // URL para calibrar: ?cam=x,y,z&focus=x,y,z
    const q = new URLSearchParams(location.search);
    const vec = (str, def) => {
      const a = (str || '').split(',').map(Number);
      return a.length === 3 && a.every(Number.isFinite) ? new pc.Vec3(a[0], a[1], a[2]) : def;
    };
    focus = vec(q.get('focus'), new pc.Vec3(...STOP.focus));
    const camPos = vec(q.get('cam'), new pc.Vec3(...STOP.camera));
    camera.setPosition(camPos);
    camera.lookAt(focus);
    cc.sceneSize = 12;
    cc.focusPoint = focus.clone();
    orbitR = Math.hypot(camPos.x - focus.x, camPos.z - focus.z);

    let frames = 0;
    app.on('update', () => {
      frames++;
      window.__l360dbg = { frames };
      // Revela la escena en cuanto hay unos frames pintados.
      if (frames === 4) {
        loader.done();
        window.__l360ready = true;
      }
      if (touring && focus) {
        const t = (performance.now() - orbitT0) / 1000;
        const a = orbitA0 + t * 0.12;
        camera.setPosition(focus.x + Math.cos(a) * orbitR, camera.getPosition().y, focus.z + Math.sin(a) * orbitR);
        camera.lookAt(focus.x, focus.y, focus.z);
      }
      callouts.update();
    });
  });
}

main().catch((e) => {
  console.error('[LATAM360]', e);
  loader.error('Ocurrió un error al iniciar la experiencia.');
});
