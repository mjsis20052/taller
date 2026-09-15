# Progreso del proyecto

## Fase actual: FASE 1 — MVP operativo
## Tarea actual: Tarea 2 — Modelo de datos inicial (NO INICIADA)

## Hecho
- [x] Sesión fundacional: documentación completa creada
  (AGENTS.md, CLAUDE.md, docker-compose.yml, docs 01 a 05)
- [x] Tarea 1: Infraestructura base (Docker + Next + Prisma + PWA)
- [ ] Tarea 2: Modelo de datos inicial
- [ ] Tarea 3: Módulo Clientes
- [ ] Tarea 4: Módulo Vehículos
- [ ] Tarea 5: Agenda de turnos
- [ ] Tarea 6: Órdenes de trabajo

## Decisiones tomadas
- Stack: Next.js + TypeScript + Prisma + PostgreSQL 16 en Docker
  (solo la base en Docker en dev).
- PWA mobile-first, un solo usuario, un solo taller.
- Dueño monotributista (factura C vía estudio). Este sistema no
  emite facturas ni calcula impuestos (importes netos).
- Facturación: entidad SolicitudFacturacion separada de la OT,
  desacoplada, idExterno determinístico = nro OT,
  FacturacionAdapter con ColaManualAdapter (v1) — según
  recomendaciones del responsable del sistema contable.
- WhatsApp: links wa.me en MVP.
- StorageAdapter local (uploads/) para fotos en MVP.
- (Tarea 1) Versiones instaladas: Next.js 16.3.5 (App Router,
  Turbopack), React 19, Tailwind CSS v4, Prisma 6.19.3.
- (Tarea 1) En ESTA máquina el 5432 del host está ocupado por otro
  proyecto: la base del taller se publica en 5435 vía
  compose.override.yml (docker-compose.yml original intacto) y
  .env apunta a localhost:5435. Si se libera el 5432, borrar el
  override y volver a "5432:5432".
- (Tarea 1) En el host el 3000 también está ocupado (otro
  proyecto): npm run dev cae en el primer puerto libre (3001 hoy).
- (Tarea 1) Prisma: generador "prisma-client" con salida en
  src/generated/prisma (en .gitignore) y prisma.config.ts que
  carga .env con dotenv para el CLI (migraciones de Tarea 2).
- (Tarea 1) PWA: manifest (src/app/manifest.ts), íconos 192/512
  en public/icons/, meta tags mobile/Apple y service worker
  mínimo en public/sw.js (solo instalabilidad; offline: fase
  futura).
- (Tarea 1) Layout: tema claro fijo (uso a la luz del día) y nav
  inferior fija Inicio/Agenda/+/OTs/Más. El botón + central queda
  sin función hasta Tareas 5 y 6. Páginas placeholder por sección.

## Pendientes de definición
- API del estudio contable (bloquea solo Fase 4/5; v1 usa cola manual).
- Deploy a producción (decisión posterior: VPS, PaaS, etc.).
