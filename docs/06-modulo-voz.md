# Módulo de carga por voz

Repo aparte: `taller-carga-voz` (carpeta hermana de esta, `mjsis20052/taller-carga-voz`,
privado). Estado completo, arquitectura, deploy y pendientes:
**`../../taller-carga-voz/docs/ESTADO-PROYECTO.md`** — leer ahí, no acá.

Lo único que toca a este repo: los endpoints `src/app/api/voz/*`
(autenticados con `X-Voz-Key` contra `VOZ_API_KEY`), `src/lib/ordenes-trabajo.ts`
(`crearOTDesdeDatos`), el botón "Carga por voz" en Más (`CARGA_VOZ_URL`), y la
columna `OrdenTrabajo.origenBorradorVozId` (migración
`20260923133716_voz_origen_borrador`).
