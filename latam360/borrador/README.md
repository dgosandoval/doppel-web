# LATAM 360 · BORRADOR (no publicado)

Borrador del proyecto definitivo, servido en `https://doppel.cl/latam360/borrador/`
detrás de la misma clave que `/latam360` (`functions/latam360/_middleware.js`).
Páginas con `<meta name="robots" content="noindex, nofollow">`.

- `index.html` — landing (hero, Sobre el proyecto, La experiencia, Mapa Leaflet, cierre)
- `tour/index.html` — visor PlayCanvas 2.19.6 (GSplat) con hotspots, parada CCO
- `assets/css/site.css` — estilos del landing del demo + mapa/tarjetas
- `assets/css/viewer.css` — copia de `latam360/style.css` (solo cambia la ruta de la fuente)
- `assets/css/viewer-draft.css` — ajustes del borrador
- `assets/js/site.js` — pager + mapa (6 locaciones)
- `assets/js/viewer.js` — visor (basado en `scenes/cf100.mjs` + call-outs de `app.js`)

Reutiliza los assets del demo en `/latam360/assets/` (fuente LatamSans, logos, imágenes
`img/*.jpg`, splat provisional `splats/cf100-lite.sog`, `tour-music.mp3`). Video de hotspot:
Vimeo del demo. CDNs: PlayCanvas (jsDelivr), Leaflet (unpkg), Google Fonts, teselas ArcGIS.

Pendiente: splat del CCO (`STOP.splatUrl` en `assets/js/viewer.js`), re-medir `pos` de
hotspots y encuadre (`?cam=x,y,z&focus=x,y,z` para calibrar), videos 360 reales, locución del CCO.
