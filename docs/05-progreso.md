# Progreso del proyecto

## ⚠️ LEER ANTES DE DESPLEGAR: este sistema NO TIENE LOGIN. Ninguna
## ruta del panel interno pide contraseña — quien tenga la URL entra
## y ve todo (clientes, teléfonos, totales de OT, cobranzas). Hasta
## ahora esto no importaba porque solo corría en localhost. Ahora que
## existe /portal (landing pública) pensada para internet, el panel
## de gestión NO puede quedar detrás de la misma URL pública sin
## alguna forma de login — aunque sea básico (un solo usuario, no
## hace falta roles). Ver nota completa en "Landing pública" abajo.

## Fase actual: FASES 1 a 4 COMPLETAS. FASE 5 deliberadamente NO
## implementada (el PRD pide solo diseñar puntos de enganche: OCR,
## dictado, WhatsApp Business API, API real del estudio).
## Tarea actual: ninguna pendiente en el roadmap original. Antes de
## desplegar en el VPS de compromiso, resolver el login (ver arriba).

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
- [x] Fase 2 (comunicación/presupuestos WhatsApp): cubierta dentro
  de la Tarea 6 + un botón "avisar que está listo" agregado después.
- [x] Fase 3 (stock, gastos, cobranzas/cuenta corriente, reportes)
- [x] Fase 4 (SolicitudFacturacion + FacturacionAdapter/ColaManualAdapter)

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

- (Fase 3) prisma/schema.prisma: Repuesto, MovimientoStock (insert-only,
  como TimelineEvento), Gasto, Cobro — según lo definido en
  docs/02-arquitectura.md. OTItem.repuestoId y Foto.gastoId, que eran
  campos sueltos desde la Tarea 2, ahora tienen relación real.
- (Fase 3) Stock: alta de repuesto con stock inicial, movimientos
  (entrada/salida/ajuste) con historial, alerta de stock bajo. Al
  cargar un ítem de tipo REPUESTO en una OT se puede elegir del
  inventario (autocompleta descripción/precio) y esto genera una
  SALIDA que descuenta stock automáticamente; eliminar el ítem genera
  la ENTRADA inversa. Un ítem "libre" (sin vincular) no toca stock.
- (Fase 3) Gastos: alta con categoría, monto, foto opcional del
  ticket (mismo StorageAdapter). Total del mes en la lista.
- (Fase 3) Cuenta corriente (src/lib/cuenta-corriente.ts): saldo por
  cliente = suma de OT.total en estado ENTREGADO/FACTURADO menos
  suma de Cobro.monto. /cobranzas lista deudores con recordatorio
  WhatsApp y cobro rápido (a cuenta, sin atar a una OT puntual);
  también se puede cobrar contra una OT específica desde su detalle.
- (Fase 3) Reportes: ventas y cobrado del mes, gastado del mes, total
  adeudado, alerta de stock bajo, y rentabilidad por OT (total menos
  costo de los repuestos vinculados al inventario — los ítems libres
  no tienen costo cargado, se advierte en pantalla).
- (Fase 4) FacturacionAdapter (interfaz) + ColaManualAdapter (v1) en
  src/lib/facturacion/, tal cual lo pedía la arquitectura: cambiar a
  una API real del estudio el día de mañana es reemplazar un archivo,
  nada más. SolicitudFacturacion con idExterno = numero de OT
  (determinístico, otId único — no se puede duplicar factura).
- (Fase 4) Flujo real de la OT: TERMINADO ya NO salta directo a
  ENTREGADO. Ahora exige (o permite saltear a propósito):
  "Generar solicitud de facturación" → "Enviar a la cola del
  estudio" (/facturacion) → carga manual de número/CAE/vencimiento/
  PDF → OT pasa a FACTURADO → "Registrar entrega" → ENTREGADO. Queda
  un botón "Entregar sin facturar/sin esperar la factura" en
  TERMINADO y en el estado con solicitud pendiente, como escape
  manual — el dueño decide, no queda trabado esperando al estudio.
- (Fase 4) Botones de WhatsApp "avisar que está listo" (TERMINADO) y
  "avisar que la factura está lista" (FACTURADO) agregados en el
  header de la OT — parte de Fase 2 que quedó floja en la Tarea 6.
- PROBADO en navegador contra la base real: repuesto nuevo con
  movimiento de entrada, gasto con foto verificada en disco, cobro
  parcial que reduce el saldo en /cobranzas y en Inicio, una OT
  nueva (OT-0002) completa con ítem de repuesto de inventario
  (stock bajó de 10 a 9), solicitud de facturación generada con
  snapshot correcto, enviada a la cola, comprobante/CAE cargados
  (la OT pasó a FACTURADO), y reportes con los números cruzados
  (ventas, cobrado, adeudado, rentabilidad por OT) verificados a
  mano contra lo cargado.
- Durante esa prueba, OT-0002 terminó en ENTREGADO con una nota de
  timeline que no correspondía ("entregado sin facturar" estando ya
  facturada) — no encontré una acción mía que lo explique; podría
  ser una interferencia del entorno de pruebas del navegador
  automatizado (hay indicios de otra sesión tocando la misma
  pestaña) más que un bug de la app. Se corrigió el texto a mano en
  la base. Si el dueño ve un salto de estado raro en una OT real,
  vale la pena mirarlo con más cuidado — no quedó 100% explicado.
- Fase 5 (OCR de tickets, dictado por voz, WhatsApp Business API,
  FacturacionAdapter por API real) NO se tocó — el PRD explícitamente
  pide diseñar puntos de enganche, no implementar. Los puntos de
  enganche ya existen: StorageAdapter y FacturacionAdapter son
  interfaces reemplazables sin tocar el resto del sistema.

- (Diseño) Se agregaron `framer-motion` y `vaul` (deps nuevas).
  Transición de página global (fade + slide sutil) en
  src/components/transicion-pagina.tsx, envolviendo el `<main>` del
  layout. Listas animadas (stagger fade-in) en Clientes, Vehículos y
  OTs vía src/components/lista-animada.tsx. El botón "+" central
  ahora abre un bottom sheet real (Vaul) en vez de un popover chico.
  Paleta con sombras sutiles en tarjetas y botones primarios,
  aplicadas globalmente por combinación de clases en globals.css
  (sin tocar cada componente uno por uno).
- (Diseño) BUG encontrado y corregido probando: los links del nuevo
  bottom sheet no navegaban. Causa: el onClick hacía
  `preventDefault()` + `router.push()` manual, lo que se pisaba con
  el cierre del Drawer. Se sacó el manejo manual y se dejó que
  `next/link` navegue solo — Vaul se cierra por el cambio de ruta.
- (Diseño) Todavía NO está desplegado en ningún lado — sigue
  corriendo solo en esta máquina (`npm run dev` + Postgres en
  Docker). El dueño lo probó desde su propio navegador en algún
  momento de esta sesión (apareció un cliente "Mauricio sisti" que
  no cargué yo), así que el server sí es alcanzable en la red local
  mientras corre `npm run dev` — pero no hay nada público ni
  persistente. Definir dónde y cómo desplegar queda pendiente.

- (PWA) Set completo de íconos generado con `next/og` (ImageResponse,
  ya viene con Next, no se sumó dependencia nueva): 72 a 512px "any"
  con esquinas redondeadas, uno "maskable" 512 sin bordes propios
  (Android/Chrome aplica su propia máscara), y apple-touch-icon
  180x180 sin transparencia (como pide iOS). El script que los generó
  era temporal (`.tmp-scripts/`, borrado) — si hay que regenerarlos
  con otro diseño, no quedó guardado, avisar para rehacerlo.
- (PWA) manifest.ts ampliado: `scope`, `display_override`,
  `categories`, `dir`, y el set completo de íconos con su `purpose`.
- (PWA) layout.tsx: favicon 180x180 propio para iOS (antes reusaba el
  de 192 sin redimensionar), agregado el meta tag viejo
  `apple-mobile-web-app-capable` (necesario en iOS < 11.3; Next ya
  emite el moderno `mobile-web-app-capable` solo) y
  `formatDetection.telephone: false` (evita que iOS auto-detecte
  números de teléfono como links y rompa el diseño).
- (PWA) Página /offline + sw.js con manejo real: en vez de solo
  instalar/activar (lo de antes), ahora intercepta navegaciones y
  si falla el fetch por falta de red muestra /offline en vez del
  error feo del navegador. Deliberadamente NO cachea datos del
  taller (clientes, OTs, etc.) — mostrar información vieja como si
  fuera actual sería peor que mostrar que no hay conexión; eso
  sigue siendo "fase futura" como ya decía la Tarea 1.
- (PWA) LIMITADO: no pude verificar el registro real del service
  worker en el navegador de pruebas de esta sesión — devuelve
  "unknown error fetching the script" al registrar, aunque `curl`
  confirma que `/sw.js` se sirve bien (200, content-type correcto)
  y el archivo tiene sintaxis JS válida. Es probable que sea una
  restricción del navegador automatizado en modo sandbox (común que
  bloqueen Service Workers), no un bug de la app — pero no lo pude
  confirmar de forma concluyente. Habría que probarlo en un Chrome
  o Safari real, y sobre todo instalar la app en un Android y un
  iPhone de verdad ("Agregar a inicio") para confirmar que funciona
  como PWA instalada — eso no se puede hacer desde acá.
- (PWA) NO se generaron pantallas de splash específicas para iOS
  (`apple-touch-startup-image`, que requiere una imagen por cada
  resolución de iPhone/iPad). iOS 16.4+ arma una pantalla de carga
  básica sola a partir del manifest (background_color + ícono), así
  que no debería verse roto, pero no es una splash a medida.

- (Estructura) Todas las rutas del panel de gestión se movieron a
  src/app/(interno)/ — un "route group" de Next.js, no cambia
  ninguna URL (/clientes sigue siendo /clientes). Se hizo para poder
  meter la landing pública en su propio grupo con su propio layout
  (sin el header/nav del panel), sin que se pisen entre sí. El
  layout raíz (src/app/layout.tsx) quedó como shell mínimo (html/
  body/fuentes); el header, la nav inferior y las alertas se movieron
  a src/app/(interno)/layout.tsx. Se aprovechó para ensanchar el
  panel en pantallas grandes (max-w-4xl en vez de max-w-lg).
- (Panel para PC) /stock tiene un formulario de "carga rápida" arriba
  de la lista: guarda y se queda en la misma pantalla (en vez de ir
  al detalle) para poder cargar repuestos uno atrás de otro sin
  interrupciones — pensado para tipear rápido con teclado. Además la
  lista se ve como tabla en pantallas grandes (lg:) y como tarjetas
  en mobile, mismo patrón que se puede repetir en otras listas si
  hace falta más adelante.
- (Mobile más simple) Formularios de Cliente y Vehículo: los campos
  secundarios quedan detrás de un "+ Más datos" colapsable
  (src/components/campos-opcionales.tsx). Alta rápida en mobile:
  Nombre+Teléfono (cliente) o Patente+Marca+Modelo (vehículo). Si el
  registro que se edita ya tiene esos datos opcionales cargados, la
  sección arranca abierta para no esconder información existente.
- (Landing pública) src/app/(publico)/portal/ — nueva sección SIN
  LOGIN, con su propio layout (sin el header/nav del panel interno):
  - /portal: hero animado con framer-motion + consulta de vehículo
    por patente. A propósito devuelve lo mínimo: patente, marca,
    modelo y el estado en lenguaje simple ("listo para retirar",
    etc.) — NUNCA nombre, teléfono, DNI/CUIT, fotos ni montos.
    Conocer una patente no debería alcanzar para saber quién es el
    dueño ni cuánto pagó.
  - /portal/turno: pedido de turno público. Busca o crea el cliente
    por teléfono y el vehículo por patente; si la patente ya
    pertenece a otro cliente, NO se reasigna — se usa el vehículo tal
    cual está, sin tocar su dueño (evita que alguien "robe" la
    asignación de un auto adivinando la patente). El turno se crea
    directo en AGENDADO, sin paso de confirmación previo — no hay
    CAPTCHA ni verificación por SMS/email: para el tamaño de este
    negocio agregar eso sería sobre-ingeniería, pero significa que
    un pedido falso/de prueba entra igual que uno real (se cancela
    fácil desde la Agenda si pasa).
  - Como no existe integración con la API de WhatsApp Business (Fase
    5), la "confirmación por WhatsApp" que se promete en la pantalla
    de éxito la hace el DUEÑO a mano: los turnos que vienen del
    portal se marcan (src/lib/turno-portal.ts) con un badge "Pedido
    web" en la Agenda y un botón "Confirmar por WhatsApp" que abre
    wa.me con el mensaje ya armado — un toque y listo, no hay que
    escribir nada. El marcador técnico del motivo se limpia antes de
    mostrarlo en cualquier pantalla (Agenda, editar turno, alta de
    OT desde turno).
  - **Riesgo real, no resuelto**: el panel interno completo (clientes,
    teléfonos, totales de OT, cobranzas) sigue sin ningún login. Deployar
    ambas cosas (portal público + panel interno) bajo el mismo dominio
    público tal cual está hoy dejaría todos los datos del negocio
    abiertos a cualquiera con la URL. Antes de desplegar en el VPS de
    compromiso hay que decidir cómo proteger `(interno)` — lo más
    simple: una sola contraseña compartida (matcheable con un
    middleware de Next y una cookie), sin necesidad de un sistema de
    usuarios completo dado que sigue siendo un solo dueño. No se
    implementó porque no se pidió explícitamente y agregarlo sin
    acuerdo hubiera sido una decisión de seguridad tomada por mi
    cuenta — se las dejo planteada para decidir antes del despliegue.
  - Tampoco se tocó el proyecto `compromiso-main` (el "diario") ni se
    investigaron los datos del VPS mencionados — el pedido explícito
    fue terminar esto primero y desplegar después, así que no entré
    a ese proyecto todavía.

- (Portal, ajustes tras uso real) El dueño probó el formulario público
  con su propio teléfono/patente reales y la validación estricta
  (formato internacional +54... / patente AAA123-AA123BB) los
  rechazaba. Se sacó esa validación específicamente del portal
  público — ahí ahora solo se pide que no estén vacíos, se normaliza
  (mayúsculas, sin espacios/guiones) y listo. La validación estricta
  SIGUE existiendo para el panel interno (src/lib/validaciones/), no
  se tocó ahí.
- (Portal) Horarios de atención configurables: nueva pantalla
  /configuracion (Más → "Horarios de atención") donde el dueño define
  apertura, cierre, duración de cada turno y qué días está cerrado
  (guardado en el modelo Config, clave "horarios_turnos" —
  src/lib/horarios.ts). El selector de horario del portal público ya
  no es un campo de hora libre: es un <select> con los horarios que
  salen de esa config, sacando los que ya están ocupados y los que ya
  pasaron si la fecha es hoy. Se revalida en el servidor al enviar
  (no alcanza con lo que mande el navegador).
- (Portal) BUG real encontrado por el dueño: los pedidos de turno del
  portal se guardaban bien pero no eran visibles a simple vista — la
  Agenda por defecto muestra el día de hoy, y el pedido puede ser
  para cualquier fecha futura. Se agregó una alerta en la campanita
  ("N pedidos de turno desde la web sin confirmar") que linkea a
  /agenda?vista=lista, contando turnos AGENDADO cuyo motivo todavía
  tiene la marca de portal. Y como tocar "Confirmar por WhatsApp"
  antes no dejaba ningún rastro (la alerta iba a quedar para
  siempre), ahora también saca la marca del motivo al confirmar
  (confirmarPedidoWeb en agenda/actions.ts) — se probó que el
  contador de la campanita baja de verdad después de confirmar.
- (Diagnóstico de red) El dueño no podía abrir la app desde el
  celular con la IP que le había pasado (172.25.208.1) — es la IP de
  un adaptador virtual de WSL/Hyper-V, no existe fuera de esta
  máquina. La IP real de la placa Wi-Fi es otra (verificar con
  `Get-NetIPAddress` — la de `InterfaceAlias "Wi-Fi"`, no la de
  `vEthernet (WSL...)`). De paso quedó anotado algo raro en el
  firewall de Windows: hay reglas para "Node.js JavaScript Runtime"
  que BLOQUEAN entrante en redes "Privadas" y lo PERMITEN en
  "Públicas" (al revés de lo esperable) — hoy no importa porque la
  red de este equipo está categorizada como Pública, pero si en
  algún momento Windows la recategoriza como Privada, la app va a
  dejar de ser alcanzable desde el celular otra vez y va a hacer
  falta revisar esas reglas (`Get-NetFirewallRule -DisplayName
  "*node*"`).
- (Landing) Se agregó una ilustración vectorial propia de un auto
  (src/components/ilustracion-auto.tsx, con flotación suave vía
  framer-motion) y una sección de 3 features con scroll-reveal —
  a propósito NO son fotos del taller real ni fotos de stock
  genéricas haciéndose pasar por el negocio; son placeholders fáciles
  de reemplazar el día que haya fotos de verdad.
- (Portal) "Pedir turno" ahora abre un modal (bottom sheet con Vaul)
  en vez de navegar a /portal/turno — se puede pedir el turno sin
  perder el lugar en la landing, desde el header, el hero o el banner
  final (src/components/boton-pedir-turno.tsx, reutiliza el mismo
  FormularioTurnoPublico de siempre). La página /portal/turno se dejó
  intacta como acceso directo por si alguien llega a esa URL.

- (Horarios) Ahora cada día de la semana tiene sus horas EXACTAS
  (ej: martes 10:00, 12:00 y 15:00) en /configuracion, como etiquetas
  que se agregan y quitan; un día sin horas queda cerrado. El portal
  ofrece solo esas (src/lib/horarios.ts + horarios-comunes.ts). La
  config vieja (apertura/cierre/duración) se convierte sola al leerla.
  La landing muestra los horarios reales en "Cuándo atendemos".
- (Agenda) Sección "Turnos por confirmar" arriba de todo con los
  pedidos de la web (no se repiten en la lista de abajo); la campanita
  linkea a /agenda#por-confirmar.
- (Teléfonos) Al cargar clientes (panel y portal) el +549 se agrega
  solo: "2245506078" queda "+5492245506078" (normalizarTelefono en
  src/lib/validaciones/telefono.ts). El wa.me de confirmación usa ese
  número.
- (OT) Rediseño de ítems. Los "trabajos" (TipoOTItem.MANO_OBRA en la
  base, "Diagnóstico y trabajos" en pantalla) tienen falla encontrada +
  solución propuesta + precio (OTItem.falla; descripcion = solución;
  cantidad 1). Los repuestos se agregan con el botón "Agregar
  repuesto": de la lista de stock (descuenta) o uno nuevo con precio
  (libre, sin stock), con casilla "hay que pedirlo" y nota de cómo
  pedirlo (OTItem.aPedir / notaPedido), y se puede marcar "ya pedido".
- (OT) Sección "Importes y pagos": total, pagado, falta pagar (o saldo
  a favor) y lista de pagos de ESA OT, con seña o pago parcial en
  cualquier estado salvo cancelada (Cobro.concepto SENA|PAGO,
  registrarPagoOT / eliminarPagoOT). Reemplaza el cobro que solo
  aparecía al entregar. La cuenta corriente del cliente sigue igual:
  una seña de una OT sin entregar queda como crédito a favor.
  Migración: 20260918164835_ot_diagnostico_repuestos_pagos.
- (Landing) Engranajes que giran, cinta de servicios, sección oscura
  "Lo que hacemos" con ilustraciones vectoriales propias (no son fotos
  del taller real; reemplazables) y horarios reales.

## Despliegue en el VPS (2026-09-18) — LEER ANTES DE TOCARLO
- Servidor: 149.50.138.149 (DattaWeb, Ubuntu 22.04, SOLO 1.9 GB de RAM,
  sin swap), compartido con el diario (compromiso-main, pm2, mongo,
  qdrant) y con otros proyectos (ej: mascotas).
- Taller corre en Docker: /opt/taller/app/docker-compose.yml (servicios
  db + app, límites de RAM 256m/512m, app publicada en el puerto 3010).
  La clave de la base vive SOLO en ese archivo del servidor.
- Público: https://taller.compromisodiario.com.ar (Cloudflare con
  proxy activado + nginx: /etc/nginx/sites-available/taller, con
  certbot). Solo abren los puertos 80/443: el proveedor bloquea el
  resto (3010, 8080, 8085… no responden desde afuera).
- NUNCA compilar (next build / docker build) en el VPS: el 2026-09-18
  un build se comió la RAM y el servidor quedó colgado ~15 min (cayó
  también el diario) hasta reiniciarlo desde el panel. Se compila en
  la PC (Dockerfile multi-stage, output standalone), se sube con
  `docker save | gzip` + `docker load`, y se recrea el contenedor.
- Las migraciones de Prisma no van dentro de la imagen: se aplican
  con el SQL de prisma/migrations directo en el contenedor de la base
  (y se registran en _prisma_migrations).
- Login propio (2026-09-18): pantalla /login con cookie firmada
  (HMAC, 30 días, httpOnly) y src/proxy.ts que cierra todo salvo
  /portal, /login, /_next, /icons, /sw.js, /manifest.webmanifest y
  /offline (GET → redirige a /login; otros métodos → 401). Cerrar
  sesión está en Más. Freno de 8 intentos cada 15 min por IP. Se
  configura con ADMIN_USER, ADMIN_PASSWORD y SESSION_SECRET en el
  environment del contenedor (solo en el docker-compose del servidor,
  nunca en el repo). Sin ADMIN_PASSWORD en desarrollo no se pide nada;
  en producción sin configurar, el panel queda cerrado. Reemplazó el
  basic auth de nginx. La clave actual es PROVISORIA y débil
  (admin/admin): cambiar ADMIN_PASSWORD en ese compose y recrear el
  contenedor. Límite conocido: el proxy filtra por ruta; una acción
  de servidor se puede invocar por su ID desde una ruta pública, así
  que conviene reforzar con chequeo de sesión dentro de las acciones.

## Pendientes de definición
- Repositorio remoto: https://github.com/mjsis20052/taller.git
  (rama master, todo el historial subido el 2026-09-15).
- API del estudio contable (bloquea solo Fase 4/5; v1 usa cola manual).
- Deploy a producción (decisión posterior: VPS, PaaS, etc.).
- Vulnerabilidad npm en @prisma/config (ver nota de Tarea 2 arriba):
  ¿actualizar Prisma ahora (breaking) o esperar a que salga un fix
  sin downgrade?
