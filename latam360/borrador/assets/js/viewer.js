// LATAM 360 — BORRADOR del visor de splats (una parada por ciudad).
// Misma tecnología que el demo (PlayCanvas 2.19.6 + GSplat + CameraControls) y el mismo
// sistema de call-outs (hotspots proyectados 3D→pantalla + tarjeta).
// Solo carga splats NUEVOS del proyecto: no hay splat, video ni música de demostración.
// Mientras el archivo de una ciudad no esté publicado, se muestra un estado
// "Splat en producción" (o "Próximamente") y NO se descarga PlayCanvas ni nada más.

// ===========================================================================
// CONFIGURACIÓN (único lugar a editar)
// ===========================================================================

// Splat por ciudad. Vacío = la ciudad aún no tiene splat ("Próximamente").
// Al publicar un archivo en esa ruta, el visor lo detecta y lo carga solo.
const SPLATS = {
  santiago: '/latam360/assets/splats/cco.sog',
  saopaulo: '',
  lima: '',
  bogota: '',
  quito: '',
  miami: ''
};

// Ciudades (mismo orden y textos que el mapa).
const CITIES = [
  {
    id: 'santiago', name: 'CCO', place: 'Santiago · Chile',
    title: 'CCO – Centro de Control de Operaciones',
    desc: 'La sala desde donde se controlan todos los vuelos de LATAM. Primer splat del recorrido.'
  },
  { id: 'saopaulo', name: 'São Paulo', place: 'São Paulo · Brasil' },
  { id: 'lima', name: 'Lima', place: 'Lima · Perú' },
  { id: 'bogota', name: 'Bogotá', place: 'Bogotá · Colombia' },
  { id: 'quito', name: 'Quito', place: 'Quito · Ecuador' },
  { id: 'miami', name: 'Miami', place: 'Miami · Estados Unidos' }
];

// Encuadre inicial por ciudad (coordenadas de mundo del splat, metros aprox., Y arriba,
// suelo en y=0). Calibrar por URL: ?cam=x,y,z&focus=x,y,z
// santiago (cco.sog nivelado 30-sep-2026): origen en el suelo bajo el centro del recorrido
// de la cámara; muro de pantallas en x≈8 (z≈-5..6.5, y≈1.4..2.9). Cámara a la altura de
// los ojos mirando al muro.
const VIEWS = {
  santiago: { camera: [-4, 1.6, 0.75], focus: [8, 2.0, 0.75] }
};
const DEFAULT_VIEW = { camera: [0, 1.6, 6], focus: [0, 1.4, 0] };

// Hotspots por ciudad. Regla de diseño: el splat es solo el espacio quieto; personas y
// pantallas en vivo van en videos 360 aparte, que se abren desde estos puntos.
// Formato: { pos: [x,y,z], label, title, subtitle, body (HTML), video (URL embebible), is360 }
// Vacío hasta tener el splat del CCO y sus videos 360.
const HOTSPOTS = {
  santiago: []
};

// Recorrido guiado por ciudad (locución + subtítulos). Vacío hasta tener la locución.
// Formato: { audio: '/latam360/assets/voice/cco.mp3', captions: ['texto', ...] }
const TOURS = {
  santiago: { audio: '', captions: [] }
};

// ===========================================================================
// Estado de la página
// ===========================================================================
const $ = (s) => document.querySelector(s);
const IS_TOUCH = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;
const params = new URLSearchParams(location.search);
const CITY = CITIES.find((c) => c.id === params.get('ciudad')) || CITIES[0];

const loader = {
  _raf: 0, _pct: 0, _t0: 0, _on: false,
  start() { this._on = true; this._t0 = performance.now(); this._tick(); },
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
  hide() { this._on = false; cancelAnimationFrame(this._raf); $('#loader').classList.add('hidden'); },
  done() { this._render(100); this.hide(); },
  error(msg) {
    this._on = false; cancelAnimationFrame(this._raf);
    $('#loader').classList.add('is-error');
    $('#loader-text').textContent = msg;
    $('#loader-pct').textContent = '';
  }
};

function buildMenu() {
  const wrap = $('#scenes');
  CITIES.forEach((c) => {
    const has = !!SPLATS[c.id];
    const el = document.createElement('button');
    el.className = 'scene-card' + (c.id === CITY.id ? ' active' : '');
    if (has) el.addEventListener('click', () => { if (c.id !== CITY.id) location.search = `?ciudad=${c.id}`; });
    else el.disabled = true;
    el.innerHTML =
      `<span class="scene-card__name">${c.name}</span>` +
      `<span class="scene-card__place">${c.place.split(' · ').pop()}</span>` +
      `<span class="scene-card__tag">${has ? 'En producción' : 'Próximamente'}</span>`;
    wrap.appendChild(el);
  });
}

function showInfo() {
  if (!CITY.title) return;
  $('#info-place').textContent = CITY.place;
  $('#info-name').textContent = CITY.title;
  $('#info-desc').textContent = CITY.desc || '';
  $('#info').hidden = false;
}

// Estado sin splat: no se carga nada más.
function showState(kind) {
  loader.hide();
  document.body.classList.add('no-splat');
  $('#state-place').textContent = CITY.place;
  $('#state-title').textContent = CITY.title || CITY.name;
  const badge = $('#state-badge');
  if (kind === 'production') {
    badge.textContent = 'Splat en producción';
    badge.className = 'splat-state__badge splat-state__badge--prod';
    $('#state-text').textContent =
      'El splat de esta locación se está produciendo. El visor lo cargará automáticamente en cuanto el archivo esté publicado.';
  } else {
    badge.textContent = 'Próximamente';
    badge.className = 'splat-state__badge';
    $('#state-text').textContent = 'Esta locación se sumará al recorrido más adelante.';
  }
  $('#splat-state').hidden = false;
}

// ¿Existe el archivo? HEAD sin descargarlo. Cloudflare Pages responde 200 + index.html
// (text/html) para rutas inexistentes, así que además se descarta cualquier respuesta HTML.
async function splatExists(url) {
  try {
    const r = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    const type = (r.headers.get('content-type') || '').toLowerCase();
    await r.text(); // consumir el cuerpo (vacío) para cerrar la petición limpiamente
    return r.ok && !type.includes('text/html');
  } catch (e) {
    return false;
  }
}

function setupWelcome() {
  const el = $('#welcome');
  const hasHotspots = (HOTSPOTS[CITY.id] || []).length > 0;
  const kbd = (k) => `<kbd class="welcome__kbd">${k}</kbd>`;
  const rows = IS_TOUCH
    ? [
        ['👆', 'Avanzar y retroceder', 'Desliza un dedo (izquierda) arriba y abajo'],
        ['✋', 'Cambiar la dirección', 'Desliza el otro dedo (derecha) a los lados']
      ]
    : [
        ['🖱️', 'Mirar alrededor', 'Arrastra con el mouse'],
        ['⌨️', 'Moverte', kbd('W') + kbd('A') + kbd('S') + kbd('D') + ' <i>o</i> ' + kbd('↑') + kbd('↓') + kbd('←') + kbd('→')],
        ['⚡', 'Ir más rápido', 'Mantén ' + kbd('Shift') + ' mientras te mueves']
      ];
  if (hasHotspots) rows.push(['●', 'Videos 360', (IS_TOUCH ? 'Toca' : 'Haz clic en') + ' los puntos para abrirlos']);
  $('#welcome-eyebrow').textContent = `360° Experience · ${CITY.name}`;
  $('#welcome-rows').innerHTML = rows
    .map((r) => `<div class="welcome__row"><span class="welcome__ico">${r[0]}</span><div><b>${r[1]}</b><span>${r[2]}</span></div></div>`)
    .join('');
  if (params.has('nowelcome')) return;
  el.hidden = false;
  $('#welcome-start').addEventListener('click', () => {
    el.classList.add('welcome--out');
    setTimeout(() => { el.hidden = true; }, 400);
  });
}

// ===========================================================================
// Call-outs (misma lógica que el demo, simplificada)
// ===========================================================================
function createCallouts(pc) {
  return {
    markers: [],
    scr: new pc.Vec3(),
    cam: null,
    init(camEntity, list) {
      this.cam = camEntity;
      const layer = $('#callout-markers');
      list.forEach((hs) => {
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
      $('#callout-media').innerHTML = hs.video
        ? `<div class="callout__video"><iframe src="${hs.video}" title="${hs.title}" frameborder="0" ` +
          `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
        : '';
      $('#callout-body').innerHTML =
        `<h3 class="callout__title">${hs.title}</h3>` +
        `<div class="callout__sub">${hs.is360 ? '<span class="callout__badge">360°</span> ' : ''}${hs.subtitle || ''}</div>${hs.body || ''}`;
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
}

// ===========================================================================
// Recorrido guiado (locución + subtítulos), solo si TOURS[ciudad] tiene contenido
// ===========================================================================
function setupTour(ctx) {
  const tour = TOURS[CITY.id] || {};
  const captions = tour.captions || [];
  if (!tour.audio && !captions.length) return;
  const btn = $('#tour-btn');
  const cap = $('#tour-caption');
  const audio = tour.audio ? new Audio(tour.audio) : null;
  let timers = [];
  btn.hidden = false;
  const stop = () => {
    ctx.touring = false;
    document.body.classList.remove('touring');
    timers.forEach(clearTimeout); timers = [];
    cap.classList.remove('show');
    if (audio) { audio.pause(); audio.currentTime = 0; }
    if (ctx.cc) {
      if (ctx.camera && ctx.focus) ctx.cc.reset(ctx.focus, ctx.camera.getPosition()); // continúa desde la pose actual
      ctx.cc.enabled = true;
    }
    btn.classList.remove('active');
    btn.querySelector('.tour-btn__label').textContent = 'Iniciar recorrido';
    btn.querySelector('.tour-btn__icon').textContent = '▶';
  };
  btn.addEventListener('click', () => {
    if (ctx.touring) return stop();
    ctx.touring = true;
    ctx.callouts.close();
    document.body.classList.add('touring');
    btn.classList.add('active');
    btn.querySelector('.tour-btn__label').textContent = 'Detener';
    btn.querySelector('.tour-btn__icon').textContent = '■';
    if (ctx.cc) ctx.cc.enabled = false;
    if (ctx.camera && ctx.focus) {
      const p = ctx.camera.getPosition();
      ctx.orbitA0 = Math.atan2(p.z - ctx.focus.z, p.x - ctx.focus.x);
      ctx.orbitT0 = performance.now();
    }
    if (audio) { audio.play().catch(() => {}); audio.onended = stop; }
    captions.forEach((msg, i) => {
      timers.push(setTimeout(() => { cap.innerHTML = msg; cap.classList.add('show'); }, 800 + i * 4500));
      timers.push(setTimeout(() => cap.classList.remove('show'), 800 + i * 4500 + 3800));
    });
    if (!audio) timers.push(setTimeout(stop, 800 + captions.length * 4500 + 400));
  });
}

// ===========================================================================
// App PlayCanvas (misma base que los visores del demo en /latam360/scenes/)
// ===========================================================================
async function startViewer(splatUrl) {
  loader.start();
  // Import dinámico: PlayCanvas solo se descarga cuando hay un splat que mostrar.
  const pc = await import('playcanvas');
  const { CameraControls } = await import('playcanvas/scripts/esm/camera-controls.mjs');

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

  const ctx = { touring: false, cc: null, camera: null, focus: null, orbitR: 10, orbitT0: 0, orbitA0: 0, callouts: createCallouts(pc) };

  const asset = new pc.Asset(CITY.id, 'gsplat', { url: splatUrl });
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

    const camera = new pc.Entity('camera');
    camera.addComponent('camera', { clearColor: new pc.Color(0.05, 0.04, 0.09), fov: 65, toneMapping: pc.TONEMAP_ACES });
    app.root.addChild(camera);
    camera.addComponent('script');
    const cc = camera.script.create(CameraControls);
    Object.assign(cc, { sceneSize: 10, moveSpeed: 4, moveFastSpeed: 15, enableOrbit: false, enablePan: false });
    ctx.camera = camera; ctx.cc = cc;

    const view = VIEWS[CITY.id] || DEFAULT_VIEW;
    const vec = (str, def) => {
      const a = (str || '').split(',').map(Number);
      return a.length === 3 && a.every(Number.isFinite) ? new pc.Vec3(a[0], a[1], a[2]) : def;
    };
    ctx.focus = vec(params.get('focus'), new pc.Vec3(...view.focus));
    const camPos = vec(params.get('cam'), new pc.Vec3(...view.camera));
    camera.setPosition(camPos);
    camera.lookAt(ctx.focus);
    cc.sceneSize = 12;
    cc.focusPoint = ctx.focus.clone();
    ctx.orbitR = Math.hypot(camPos.x - ctx.focus.x, camPos.z - ctx.focus.z);

    ctx.callouts.init(camera, HOTSPOTS[CITY.id] || []);
    setupTour(ctx);

    let frames = 0;
    app.on('update', () => {
      frames++;
      if (frames === 4) { // revela la escena en cuanto hay unos frames pintados
        loader.done();
        setupWelcome();
        window.__l360ready = true;
      }
      if (ctx.touring && ctx.focus) {
        const t = (performance.now() - ctx.orbitT0) / 1000;
        const a = ctx.orbitA0 + t * 0.12;
        camera.setPosition(ctx.focus.x + Math.cos(a) * ctx.orbitR, camera.getPosition().y, ctx.focus.z + Math.sin(a) * ctx.orbitR);
        camera.lookAt(ctx.focus.x, ctx.focus.y, ctx.focus.z);
      }
      ctx.callouts.update();
    });
  });
}

async function main() {
  buildMenu();
  showInfo();
  const url = SPLATS[CITY.id];
  if (!url) { showState('soon'); window.__l360state = 'soon'; return; }
  if (!(await splatExists(url))) { showState('production'); window.__l360state = 'production'; return; }
  window.__l360state = 'loading';
  await startViewer(url);
}

main().catch((e) => {
  console.error('[LATAM360]', e);
  loader.error('Ocurrió un error al iniciar la experiencia.');
});
