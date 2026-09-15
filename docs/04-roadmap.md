# Roadmap

## Fases
1. MVP operativo: infra + clientes + vehículos + turnos + OT con
   recepción digital, fotos, estados e historial
2. Comunicación: presupuestos + WhatsApp (links wa.me)
3. Plata: stock, gastos, cobranzas/cuenta corriente, reportes
4. Facturación: SolicitudFacturacion + ColaManualAdapter
5. IA y mejoras: OCR, dictado, recordatorios, WhatsApp API,
   FacturacionAdapter por API del estudio

## Backlog FASE 1 (una tarea por sesión, en orden)

### Tarea 1 — Infraestructura base
- Levantar docker-compose (PostgreSQL).
- Crear proyecto Next.js + TypeScript + Tailwind en la raíz.
- Configurar Prisma con conexión a la base del compose.
- PWA básica: manifest, íconos, meta tags mobile.
- Layout base mobile-first con navegación inferior
  (Inicio / Agenda / + / OTs / Más).
- Criterio: `docker compose up -d` + `npm run dev` → app carga en
  mobile viewport sin errores.

### Tarea 2 — Modelo de datos inicial
- schema.prisma con entidades de Fase 1: Cliente, Vehiculo,
  KilometrajeRegistro, ServicioFrecuente, Turno, OrdenTrabajo,
  TimelineEvento, OTItem, Presupuesto, Foto, Config
  (+ enums; Fase 3/4 se agregan después según roadmap).
- Migración inicial + seed mínimo (servicios frecuentes de ejemplo).
- Criterio: migración corre limpia, seed carga datos.

### Tarea 3 — Módulo Clientes
- Alta/edición con validaciones: tipoPersona, DNI/CUIT formato,
  teléfono formato internacional obligatorio, condición fiscal
  default consumidor final.
- Lista con búsqueda por nombre/teléfono. Detalle del cliente:
  vehículos y OTs. Baja lógica.
- Criterio: alta rápida de cliente en <30 segundos desde el celu.

### Tarea 4 — Módulo Vehículos
- Alta/edición con validación de patente (AAA123 y AA123BB).
- Vínculo cliente titular. Registro de kilometraje.
- Detalle vehículo: datos + historial de km + (placeholder historial OT).
- Búsqueda por patente en header global.
- Criterio: alta de vehículo vinculado a cliente existente.

### Tarea 5 — Agenda de turnos
- CRUD de turnos. Vista día (default) y semana.
- Alta de turno: cliente (búsqueda o alta inline) + vehículo +
  motivo + hora/duración. Servicios frecuentes precargan duración
  y precio.
- Botón recordatorio WhatsApp (wa.me con texto pre-armado).
- Criterio: agendar turno desde el celu en pocos toques.

### Tarea 6 — Órdenes de trabajo
- Crear OT desde turno o directa. Numeración secuencial.
- Estados con transiciones válidas + TimelineEvento automático.
- Recepción digital: flujo guiado con cámara (fotos con fecha),
  km obligatorio, combustible, checklist de daños.
- StorageAdapter + LocalAdapter (carpeta uploads/).
- Ítems de OT (repuestos/mano de obra, libres), totales.
- Detalle de OT: timeline + ítems + fotos + botón contextual según
  estado. Cancelación con motivo.
- Historial del vehículo: timeline de sus OTs (inmutable).
- Criterio: flujo completo agendar → recepcionar → ejecutar →
  terminar → entregar, desde el celular.

## Backlog fases siguientes
Se detalla al cerrar cada fase. NO adelantar tareas.
