# Progreso del proyecto

## Fase actual: FASE 1 — MVP operativo
## Tarea actual: Tarea 4 — Módulo Vehículos (NO INICIADA)

## Hecho
- [x] Sesión fundacional: documentación completa creada
  (AGENTS.md, CLAUDE.md, docker-compose.yml, docs 01 a 05)
- [x] Tarea 1: Infraestructura base (Docker + Next + Prisma + PWA)
- [x] Tarea 2: Modelo de datos inicial
- [x] Tarea 3: Módulo Clientes
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

- (Tarea 2) schema.prisma con las 11 entidades de Fase 1 (Cliente,
  Vehiculo, KilometrajeRegistro, ServicioFrecuente, Turno,
  OrdenTrabajo, TimelineEvento, OTItem, Foto, Presupuesto, Config)
  + enums. Repuesto/MovimientoStock/Gasto/Cobro/SolicitudFacturacion
  quedan para Fase 3/4, como marca el roadmap.
- (Tarea 2) IDs con cuid(). Montos con Decimal(12,2). Soft-delete
  (activo) en Cliente y Vehiculo. ServicioFrecuente.nombre único
  (necesario para el seed idempotente).
- (Tarea 2) Dos migraciones aplicadas: modelo_inicial y
  servicio_frecuente_nombre_unico (esta última se generó a mano
  con `prisma migrate diff` porque `migrate dev` no corre en modo
  no interactivo; se confirmó antes que la tabla estaba vacía, sin
  riesgo de pérdida de datos).
- (Tarea 2) Seed en prisma/seed.ts (5 servicios frecuentes de
  ejemplo), corrido con tsx. Se agregó tsx como devDependency y
  `migrations.seed` en prisma.config.ts. Verificado con una
  consulta SQL directa contra la base — los 5 registros están.
- (Tarea 2) `npm install` de tsx destapó 3 vulnerabilidades high
  preexistentes en @prisma/config (deepmerge-ts, GHSA-ggr8-5vv4-36mx,
  DoS por stack exhaustion). El fix automático baja Prisma a 6.12.0
  (breaking change, stack técnico no se toca sin consultar) — queda
  pendiente de decisión del usuario, no se tocó.

- (Tarea 3) src/lib/prisma.ts: singleton de PrismaClient (evita
  abrir conexión nueva en cada hot-reload de dev).
- (Tarea 3) src/lib/validaciones/dni-cuit.ts y telefono.ts:
  validaciones compartidas. DNI 6-8 dígitos. CUIT con dígito
  verificador real (mod 11), no solo longitud. Teléfono formato
  internacional E.164 (+ código de país), obligatorio.
- (Tarea 3) Server actions en src/app/clientes/actions.ts
  (crearCliente, actualizarCliente, cambiarActivoCliente) +
  FormularioCliente (src/components) compartido entre alta y
  edición con useActionState. Baja lógica simple (toggle activo),
  sin bloquear por OTs asociadas — todavía no hay módulo de OTs
  con el que chocar.
- (Tarea 3) Páginas: /clientes (lista + búsqueda por nombre o
  teléfono, ?q=), /clientes/nuevo, /clientes/[id] (detalle con
  vehículos y OTs, hoy vacíos a la espera de Tareas 4 y 6),
  /clientes/[id]/editar. Entrada agregada en "Más" (todavía no hay
  tab propio de Clientes en la nav inferior).
- (Tarea 3) Probado en navegador contra la base real: alta válida,
  alta rechazada por CUIT inválido y por teléfono sin formato
  internacional (no se crea el registro), búsqueda con y sin
  resultados, baja lógica y reactivación, edición — verificado con
  consultas SQL directas, no solo por pantalla. Registro de prueba
  borrado al terminar.
- (Tarea 3) Docker Desktop no estaba corriendo al arrancar esta
  sesión (se había cerrado); se volvió a levantar a mano. Si el
  dueño ve que `docker ps` no encuentra nada, es por esto — no
  arranca solo con Windows en esta máquina.

## Pendientes de definición
- API del estudio contable (bloquea solo Fase 4/5; v1 usa cola manual).
- Deploy a producción (decisión posterior: VPS, PaaS, etc.).
- Vulnerabilidad npm en @prisma/config (ver nota de Tarea 2 arriba):
  ¿actualizar Prisma ahora (breaking) o esperar a que salga un fix
  sin downgrade?
