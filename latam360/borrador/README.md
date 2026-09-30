# LATAM 360 · BORRADOR (no publicado)

Borrador del proyecto definitivo, servido en `https://doppel.cl/latam360/borrador/`
detrás de la misma clave que `/latam360` (`functions/latam360/_middleware.js`).
Páginas con `<meta name="robots" content="noindex, nofollow">` y etiqueta "Borrador · no publicado".

Contiene SOLO el mapa y el visor de los splats nuevos (nada del demo: sin splat CF-100,
sin video de Vimeo, sin fotos de mockup, sin música).

- `index.html` + `assets/js/site.js` + `assets/css/site.css` — mapa Leaflet con las 6 ciudades
  (Santiago, São Paulo, Lima, Bogotá, Quito, Miami) y su tarjeta. `?ciudad=santiago` abre la tarjeta.
- `tour/index.html` + `assets/js/viewer.js` + `assets/css/viewer.css` (base: `latam360/style.css`
  del demo, podado) + `assets/css/viewer-draft.css` — visor PlayCanvas 2.19.6 (GSplat).
  `tour/?ciudad=<id>` elige la ciudad (por defecto Santiago).

## Configuración (arriba de `assets/js/viewer.js`)
- `SPLATS` — ruta del splat por ciudad. `santiago: '/latam360/assets/splats/cco.sog'`, resto vacío.
  El visor hace un `HEAD` al archivo: si no existe (Cloudflare Pages responde 200 + HTML para
  rutas inexistentes, por eso se descarta `text/html`) muestra "Splat en producción" y no descarga
  PlayCanvas ni nada más. Ciudad sin ruta → "Próximamente".
- `VIEWS` — encuadre inicial por ciudad (calibrar con `?cam=x,y,z&focus=x,y,z`).
- `HOTSPOTS` — call-outs por ciudad (vacío). `TOURS` — locución/subtítulos por ciudad (vacío;
  el botón "Iniciar recorrido" aparece solo si hay contenido).

Assets compartidos del demo que se reutilizan: `/latam360/assets/LatamSans-Bold.otf` y
`/latam360/assets/latam-logo.svg`. CDNs: PlayCanvas (jsDelivr), Leaflet (unpkg), Google Fonts, teselas Esri.

`cco.sog` (CCO Santiago, 1,22 M gaussianas, SH 0, 13,6 MB): nivelado (suelo en y=0, Y arriba en el visor,
escala aprox. en metros suponiendo cámara a ~1,5 m), `VIEWS.santiago` mirando al muro de pantallas.

Pendiente: cargar `HOTSPOTS` y videos 360, locución (`TOURS`).
