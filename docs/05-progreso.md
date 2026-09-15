# Progreso del proyecto

## Fase actual: FASE 1 — MVP operativo (Tareas 1 a 6 COMPLETAS)
## Tarea actual: ninguna pendiente en el backlog de Fase 1. Falta
## definir qué sigue: ¿pulir Fase 1 o arrancar Fase 2 (comunicación
## y presupuestos por WhatsApp, que ya tiene una primera versión)?

## Hecho
- [x] Sesión fundacional: documentación completa creada
  (AGENTS.md, CLAUDE.md, docker-compose.yml, docs 01 a 05)
- [x] Tarea 1: Infraestructura base (Docker + Next + Prisma + PWA)
- [x] Tarea 2: Modelo de datos inicial
- [x] Tarea 3: Módulo Clientes
- [x] Tarea 4: Módulo Vehículos
- [x] Tarea 5: Agenda de turnos
- [x] Tarea 6: Órdenes de trabajo — probado de punta a punta (ver
  nota "Tarea 6" más abajo)

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

- (Tarea 4) src/lib/validaciones/patente.ts: formato viejo (AAA123)
  y Mercosur (AA123BB), normalizando mayúsculas y sin espacios/guiones.
- (Tarea 4) Ampliación de alcance pedida por el dueño, más allá del
  roadmap original: además de cargar un vehículo nuevo, se puede
  "asignar" uno ya existente en el sistema a otro cliente (busca por
  patente y reasigna clienteId) — cubre el caso de un auto que
  cambia de dueño. Y fotos de vehículo: se agregó VEHICULO a
  EntidadFoto y Foto.vehiculoId (antes solo OT/GASTO), con
  StorageAdapter genérico (src/lib/storage/) + LocalAdapter
  (carpeta uploads/, fuera del repo) + route handler en
  src/app/uploads/[...path] que sirve los archivos.
- (Tarea 4) Detalle de vehículo con historial de km (alta rápida) y
  galería de fotos (sacar con cámara o subir, ampliar, eliminar).
  Página /vehiculos con búsqueda por patente/marca/modelo.
- (Tarea 5) Turno: CRUD completo. Vista día (con selector de semana
  tipo tira de 7 días) y vista lista de próximos turnos, por
  ?vista=lista. Alta con búsqueda de cliente existente (autocomplete
  con debounce) o link a alta rápida si no aparece, vehículo
  filtrado por ese cliente, y servicios frecuentes que precargan
  motivo + duración. Botón de recordatorio por WhatsApp (wa.me) con
  texto pre-armado. Cancelación de turno (soft, cambia estado).
  Simplificación: la conversión de horario usa el reloj del proceso
  Node sin librería de zonas horarias — server corriendo con la hora
  de Argentina, no se validó con otro huso horario.
- (Tarea 6) Simplificación deliberada del flujo: la creación de la
  OT (directa o desde un turno via "Recepcionar vehículo") ya
  incluye los datos de recepción (km, combustible) y la deja
  directo en estado INGRESADO — el estado TURNO_AGENDADO del enum
  nunca se usa en la práctica del MVP. Se documenta acá porque es
  una desviación consciente del PRD para no duplicar pasos.
  FACTURADO tampoco se usa todavía: TERMINADO pasa directo a
  ENTREGADO porque el módulo de facturación real es Fase 4 y no
  existe SolicitudFacturacion — lo dice el botón en pantalla.
- (Tarea 6) Numeración secuencial OT-0001 en src/lib/ordenes-trabajo.ts,
  dentro de una transacción Prisma. Timeline (insert-only) en cada
  cambio de estado. Ítems de repuestos/mano de obra con recálculo de
  totales en cada alta/baja (también en transacción). Presupuesto:
  snapshot de ítems + total al momento de enviar, con respuesta
  (aprobado vía WhatsApp/llamada/presencial, o rechazado). Atajo
  "trabajo chico" salta el presupuesto e ingresa directo a ejecución.
  Cancelación con motivo obligatorio, disponible en cualquier estado
  no terminal. Fotos de OT con el mismo StorageAdapter que vehículos.
- (Tarea 6) BUG REAL encontrado y corregido durante las pruebas: el
  selector de vehículo en el alta de OT quedaba `disabled` cuando
  venía precargado desde un turno (para bloquear el cambio de
  cliente/vehículo), y un `<select disabled>` no se envía en el
  FormData — la OT nunca recibía vehiculoId. Se sacó el `disabled`
  del select (src/components/selector-cliente-vehiculo.tsx); el
  cliente sigue bloqueado (no se puede "Cambiar"), el vehículo no.
- (Tarea 6) Se agregó un botón de "Volver" en el header
  (src/components/boton-volver.tsx) — no estaba contemplado en el
  roadmap original, lo pidió el dueño al ver que las pantallas de
  detalle/alta no tenían forma de volver salvo el botón atrás del
  celular. Aparece en cualquier ruta que no sea una de las 4
  pestañas principales (/, /agenda, /ots, /mas).
- (Tarea 6) El botón "+" central de la nav, que hasta la Tarea 3
  quedaba sin función, ahora abre un menú (Nuevo turno / Recepcionar
  vehículo / Nuevo cliente) — src/components/boton-nuevo.tsx.
  Búsqueda global agregada en el header (ícono de lupa) → /buscar,
  busca por patente y por nombre/teléfono de cliente a la vez.
- (Tarea 6) PROBADO de punta a punta en navegador contra la base
  real, con OT-0001: alta desde un turno (con el bug de arriba
  encontrado y corregido en el camino), numeración secuencial,
  carga de ítems con recálculo de totales ($15.000 + $8.000 =
  $23.000), presupuesto enviado y aprobado "vía WhatsApp" (queda en
  el timeline), ejecución, foto subida y verificada en disco
  (`uploads/ots/<id>/...`), terminado (ya no se pueden borrar
  ítems) y entrega final — con el mensaje en pantalla que aclara
  que la facturación real llega en Fase 4. Se verificó también que
  la OT entregada deja de aparecer en "OTs activas" de Inicio y en
  el filtro "Activas" de /ots, y que aparece correctamente en el
  detalle del cliente y del vehículo.
- OT-0001 (Roberto Gomez, Ford Fiesta patente AB123CD) se dejó
  cargada a propósito como dato de ejemplo para que el dueño tenga
  algo para ver al abrir la app — no es basura de test, se llegó a
  pedir explícitamente. Si se quiere una base 100% limpia para
  arrancar en serio, borrar ese cliente (borra en cascada vehículo,
  turno, OT, ítems, presupuesto, foto y kilometrajes) o pedirlo en
  la próxima sesión.

## Pendientes de definición
- API del estudio contable (bloquea solo Fase 4/5; v1 usa cola manual).
- Deploy a producción (decisión posterior: VPS, PaaS, etc.).
- Vulnerabilidad npm en @prisma/config (ver nota de Tarea 2 arriba):
  ¿actualizar Prisma ahora (breaking) o esperar a que salga un fix
  sin downgrade?
