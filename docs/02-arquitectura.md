# Arquitectura — Sistema Taller Mecánico

## 1. Stack y decisiones
- Next.js App Router + TypeScript: un solo proyecto para UI y API.
- PostgreSQL 16 en Docker (docker-compose.yml en la raíz). En dev
  corre solo la base; la app corre con npm run dev en el host.
  Containerizar la app: decisión de deploy, fase futura.
- Prisma como ORM: schema único, migraciones versionadas.
- Tailwind CSS mobile-first.
- PWA instalable (manifest + service worker básico). Offline
  avanzado de fotos: fase futura, no bloquea el MVP.

## 2. Estructura de carpetas
src/app/          → rutas y páginas (App Router)
src/app/api/      → endpoints (route handlers)
src/components/   → componentes UI
src/lib/          → lógica de negocio
src/lib/facturacion/ → FacturacionAdapter + ColaManualAdapter
src/lib/storage/     → StorageAdapter + LocalAdapter
prisma/           → schema.prisma + migraciones
uploads/          → archivos de fotos (LocalAdapter, en .gitignore
                     salvo .gitkeep)
docs/             → documentación del proyecto

## 3. Modelo de datos (entidades principales)
- Cliente: id, nombre, tipoPersona (FISICA|JURIDICA), dni?, cuit?,
  condicionFiscal (default CONSUMIDOR_FINAL), telefono (obligatorio),
  email?, domicilio?, notas?, activo, timestamps
- Vehiculo: id, clienteId FK, patente (única, validada 2 formatos),
  marca, modelo, año?, color?, vin?, activo, timestamps
- KilometrajeRegistro: id, vehiculoId FK, km, fecha, otId? FK
- ServicioFrecuente: id, nombre, duracionMin, precioSugerido?, activo
- Turno: id, clienteId FK, vehiculoId FK, fechaHora, duracionMin,
  motivo, estado (AGENDADO|CANCELADO|CONVERTIDO_OT), otId? FK
- OrdenTrabajo: id, numero (único, secuencial, formato OT-0001),
  clienteId FK, vehiculoId FK, estado (enum de 10 estados), motivo,
  kmIngreso?, nivelCombustible?, totalRepuestos, totalManoObra,
  total, timestamps, cerradaAt?
- TimelineEvento: id, otId FK, estado, nota?, fecha (inmutable,
  solo INSERT)
- OTItem: id, otId FK, tipo (REPUESTO|MANO_OBRA), descripcion,
  cantidad, precioUnitario, repuestoId? FK (nullable, Fase 3)
- Foto: id, entidad (OT|GASTO), otId? FK, gastoId? FK, url/path,
  fechaTomada, tipo?
- Presupuesto: id, otId FK, itemsSnapshot (JSON), total, validezDias,
  estado (ENVIADO|APROBADO|RECHAZADO|SIN_RESPUESTA), enviadoAt?,
  respondidoAt?, metodoRespuesta?
- Repuesto (Fase 3): id, descripcion, codigo?, proveedor?, stock,
  stockMinimo, costo, precioVenta
- MovimientoStock (Fase 3): id, repuestoId FK, tipo (ENTRADA|SALIDA|
  AJUSTE), cantidad, otId? FK, fecha
- Gasto (Fase 3): id, fecha, proveedor, categoria (enum), monto,
  fotoId?, notas?
- Cobro (Fase 3): id, clienteId FK, otId? FK, monto, fecha, metodo?,
  notas?
- SolicitudFacturacion (Fase 4): id, otId FK ÚNICO, idExterno
  (= numero de OT, determinístico), clienteSnapshot (JSON), items
  (JSON, importes netos SIN impuestos), total, fechaVenta, estado
  (PENDIENTE|ENVIADA|FACTURADA|ERROR), numeroComprobante?, cae?,
  caeVencimiento?, pdfUrl?, errorDetalle?, enviadoAt?, facturadaAt?
- Config: clave/valor (datos del taller, plantillas de mensajes)

Reglas del modelo:
- Todo lo histórico (TimelineEvento, MovimientoStock, Cobro, Foto)
  es inmutable: solo INSERT, nunca UPDATE ni DELETE.
- Los snapshots (presupuesto, solicitud de facturación) congelan los
  datos al momento del envío: cambios posteriores no los alteran.
- SolicitudFacturacion tiene otId ÚNICO: imposible duplicar factura
  por el mismo trabajo.

## 4. Patrones clave
- StorageAdapter (fotos): interfaz guardar/obtenerURL/eliminar.
  Hoy LocalAdapter (uploads/ servida por route handler).
  Después S3Adapter. El resto del sistema no cambia.
- FacturacionAdapter: solicitarFactura(solicitudId) /
  consultarEstado(solicitudId). Hoy ColaManualAdapter (marca
  ENVIADA y la deja en cola; personal del estudio procesa y
  alguien carga número/CAE/PDF en pantalla de carga manual).
  Después: ApiEstudioAdapter. Solo cambia la implementación.
- Numeración OT: tabla de secuencia o max+1 en transacción.

## 5. Convenciones técnicas
- Validaciones de patente/CUIT/DNI/teléfono en src/lib/validaciones/,
  compartidas entre cliente y servidor.
- Fechas guardadas en UTC, mostradas en America/Argentina/Buenos_Aires.
- IDs con UUID o cuid; número de OT legible para humanos.
- Delete lógico (activo=false) para clientes y vehículos con historia.
