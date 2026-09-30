// LATAM 360 — BORRADOR. Landing: pager de puntos (igual que el demo) + mapa Leaflet.
(function () {
  'use strict';

  // ---- Dots pager (copiado del demo): uno por sección ----
  var slides = Array.from(document.querySelectorAll('.slide'));
  var dots = document.getElementById('dots');
  slides.forEach(function (s, i) {
    var b = document.createElement('button');
    b.setAttribute('aria-label', 'Sección ' + (i + 1));
    b.addEventListener('click', function () { s.scrollIntoView({ behavior: 'smooth' }); });
    dots.appendChild(b);
  });
  var obs = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        var i = slides.indexOf(e.target);
        dots.querySelectorAll('button').forEach(function (b, j) { b.classList.toggle('on', i === j); });
      }
    });
  }, { threshold: 0.55 });
  slides.forEach(function (s) { obs.observe(s); });

  // ---- Locaciones del proyecto: exactamente seis, una por país ----
  // Coordenadas = centro de cada ciudad (no la ubicación de una instalación).
  // Solo Santiago tiene contenido; el resto queda "Próximamente" a propósito
  // (no se inventan instalaciones ni datos para las demás ciudades).
  var CITIES = [
    {
      id: 'santiago', city: 'Santiago', country: 'Chile', lat: -33.4489, lon: -70.6693,
      title: 'CCO – Centro de Control de Operaciones',
      html:
        '<span class="badge badge--prod">En producción</span><span class="badge badge--first">Primer splat del recorrido</span>' +
        '<p>La sala desde donde se controlan <b>todos los vuelos de LATAM</b>.</p>' +
        '<p>Es la primera parada del recorrido: el splat reconstruye el espacio, y las personas y las pantallas en vivo se verán en videos 360 que se abren desde los hotspots.</p>',
      url: 'tour/'
    },
    { id: 'saopaulo', city: 'São Paulo', country: 'Brasil', lat: -23.5505, lon: -46.6333, soon: true },
    { id: 'lima', city: 'Lima', country: 'Perú', lat: -12.0464, lon: -77.0428, soon: true },
    { id: 'bogota', city: 'Bogotá', country: 'Colombia', lat: 4.711, lon: -74.0721, soon: true },
    { id: 'quito', city: 'Quito', country: 'Ecuador', lat: -0.1807, lon: -78.4678, soon: true },
    { id: 'miami', city: 'Miami', country: 'Estados Unidos', lat: 25.7617, lon: -80.1918, soon: true }
  ];

  var list = document.getElementById('city-list');
  var card = document.getElementById('citycard');
  var cardBody = document.getElementById('citycard-body');
  var markers = {};
  var rows = {};
  var current = null;

  CITIES.forEach(function (c) {
    var row = document.createElement('div');
    row.className = 'p';
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.innerHTML =
      '<b>' + c.country.toUpperCase() + '</b><span>' + c.city + '</span>' +
      (c.soon ? '<em class="soon">Próximamente</em>' : '<em>En producción</em>');
    row.addEventListener('click', function () { select(c.id, true); });
    row.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(c.id, true); } });
    list.appendChild(row);
    rows[c.id] = row;
  });

  if (typeof L === 'undefined') {
    document.getElementById('map').innerHTML =
      '<p style="padding:24px;color:#fff;opacity:.7">No se pudo cargar el mapa (Leaflet).</p>';
    return;
  }

  var map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: false, // no secuestrar el scroll de la página
    worldCopyJump: false,
    minZoom: 2,
    maxZoom: 12
  });
  // Teselas gratuitas sin API key: Esri World Dark Gray Canvas (requiere atribución).
  // (Se probó CARTO dark_all: hoy responde "API KEY REQUIRED".)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,
    attribution: 'Teselas &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
  }).addTo(map);

  var bounds = L.latLngBounds(CITIES.map(function (c) { return [c.lat, c.lon]; }));
  map.fitBounds(bounds, { padding: [50, 50] });

  function icon(c, on) {
    return L.divIcon({
      className: '',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      html:
        '<div class="pin' + (c.soon ? ' pin--soon' : '') + (on ? ' pin--on' : '') + '">' +
        '<span class="pin__dot"></span><span class="pin__lbl">' + c.city + '</span></div>'
    });
  }

  CITIES.forEach(function (c) {
    var m = L.marker([c.lat, c.lon], { icon: icon(c, false), title: c.city + ', ' + c.country, keyboard: true });
    m.on('click', function () { select(c.id, false); });
    m.addTo(map);
    markers[c.id] = m;
  });

  function render(c) {
    var html =
      '<div class="citycard__place">' + c.city + ' · ' + c.country + '</div>';
    if (c.soon) {
      html +=
        '<h3 class="citycard__title">' + c.city + '</h3>' +
        '<span class="badge badge--soon">Próximamente</span>' +
        '<p>Esta locación se sumará al recorrido más adelante.</p>';
    } else {
      html +=
        '<h3 class="citycard__title">' + c.title + '</h3>' + c.html +
        '<a class="cta" href="' + c.url + '">▶ Abrir el recorrido</a>';
    }
    cardBody.innerHTML = html;
  }

  function select(id, fly) {
    var c = CITIES.find(function (x) { return x.id === id; });
    if (!c) return;
    if (current && markers[current]) {
      var prev = CITIES.find(function (x) { return x.id === current; });
      markers[current].setIcon(icon(prev, false));
    }
    current = id;
    markers[id].setIcon(icon(c, true));
    Object.keys(rows).forEach(function (k) { rows[k].classList.toggle('on', k === id); });
    render(c);
    card.hidden = false;
    if (fly) map.flyTo([c.lat, c.lon], Math.max(map.getZoom(), 4), { duration: 0.8 });
  }

  function closeCard() {
    card.hidden = true;
    if (current && markers[current]) {
      var prev = CITIES.find(function (x) { return x.id === current; });
      markers[current].setIcon(icon(prev, false));
    }
    Object.keys(rows).forEach(function (k) { rows[k].classList.remove('on'); });
    current = null;
  }
  document.getElementById('citycard-close').addEventListener('click', closeCard);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !card.hidden) closeCard(); });

  // Enlace directo: ?ciudad=santiago abre esa tarjeta al cargar.
  var want = new URLSearchParams(location.search).get('ciudad');
  if (want && markers[want]) select(want, false);

  // Re-medir el mapa si cambia el tamaño del contenedor.
  window.addEventListener('resize', function () { map.invalidateSize(); });

  window.__l360map = { map: map, select: select, close: closeCard, cities: CITIES };
})();
