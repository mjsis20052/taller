# PRD — Sistema de Gestión para Taller Mecánico

## 1. Resumen
Sistema de gestión integral para un taller mecánico en Argentina.
Reemplaza planillas papel y memoria del dueño. Un solo usuario
(el dueño, monotributista). Uso principal desde el celular en el
taller: resolver todo en pocos toques y con mínimo tipeo.

## 2. Contexto de uso
- Teléfono Android, PWA instalable.
- Señal intermitente: la app debe tolerar desconexión básica.
- El dueño opera parado junto a un auto, a veces con el cliente al lado.

## 3. Entidad central: la Orden de Trabajo (OT)
Estados (enum fijo):
1. turno_agendado — fecha/hora reservada, el auto no ingresó
2. ingresado — llegó, recepción completada (fotos + kilometraje)
3. en_diagnostico — viendo qué tiene
4. presupuestado — presupuesto enviado al cliente, esperando respuesta
5. aprobado — cliente aprobó (registrar quién y cómo: WhatsApp,
   llamada o en persona)
6. en_ejecucion — trabajando el auto
7. terminado — listo, ítems completos y total calculado
8. facturado — solicitud facturada por el estudio (número + CAE + PDF)
9. entregado — retirado. Final. Permite cobrado total, parcial o
   sin cobrar (queda registro)
cancelada: motivo obligatorio. Las OT nunca se borran.

Transiciones especiales:
- Trabajos chicos: ingresado → en_ejecucion directo (sin
  presupuesto), decisión del dueño.
- terminado exige todos los ítems cargados (repuestos + mano de obra)
  y total calculado.
- facturado SOLO cuando la solicitud de facturación asociada llega
  a estado facturada (con número de comprobante).
- Todo cambio de estado genera un evento en el timeline (inmutable).

## 4. Módulos

### 4.1 Clientes
Campos: nombre, tipoPersona (física / razón social), DNI y/o CUIT
(validación de formato en el alta), condición fiscal (default:
consumidor final), teléfono OBLIGATORIO en formato internacional
(WhatsApp), email opcional, domicilio opcional, notas.
Detalle del cliente: vehículos, OTs, saldo de cuenta corriente.
Baja lógica si tiene OTs asociadas.

### 4.2 Vehículos
Patente (validar AAA123 y AA123BB), marca, modelo, año, color y
VIN opcionales, cliente titular. Cada ingreso registra kilometraje
(historia de km). Historial completo inmutable: OTs, fotos,
trabajos, repuestos.

### 4.3 Agenda de turnos
Vista día (default) y semana, mobile-first. Crear turno: cliente
existente con búsqueda o alta rápida inline, vehículo, motivo,
hora y duración estimada. Servicios frecuentes con duración y
precio sugerido predefinidos (lista editable por el dueño, ej:
"Service 10.000 km — 2 hs"). Recordatorio por WhatsApp al agendar.

### 4.4 Recepción digital
Flujo guiado con cámara: fotos del vehículo (sugerido 4 ángulos +
tablero, fecha/hora automáticas), kilometraje obligatorio, nivel
de combustible (select: vacío/1/4/1/2/3/4/lleno), checklist de
daños visibles tocable + observación libre. Protección legal del
taller ante reclamos por daños previos.

### 4.5 Presupuestos
Desde OT en en_diagnostico: ítems de repuestos (libres en Fase 2;
vinculados al inventario en Fase 3) + mano de obra (servicios
frecuentes o libres). Totales en pesos, precios finales. Envío
por WhatsApp con texto armado que el dueño revisa. Registro de
respuesta: aprobado / rechazado / sin respuesta. Si aprueba →
OT pasa a aprobado con un toque.

### 4.6 Ejecución y cierre
Timeline de eventos con fecha/hora. Carga de ítems (repuestos y
mano de obra). Fotos de avance opcionales. Notas libres del
mecánico (punto de extensión IA futuro: no cambiar su forma).
Al terminar: botón "Avisar que está listo" → WhatsApp.

### 4.7 Cuenta corriente y cobros (Fase 3)
Cobros contra una OT o a cuenta del cliente. Pagos parciales.
Saldo siempre visible. Listado de deudores con antigüedad.
Botón WhatsApp recordatorio de deuda (tono respetuoso).

### 4.8 Stock de repuestos (Fase 3)
Descripción, código opcional, proveedor, cantidad, costo, precio
de venta, stock mínimo. Entradas por compra, salidas por consumo
en OT (descuenta stock; si no alcanza, alertar y permitir igual:
compra directa para el trabajo). Alerta de stock bajo en inicio.

### 4.9 Gastos (Fase 3)
Fecha, proveedor, categoría (repuestos/herramientas/alquiler/
servicios/otros), monto, foto opcional del ticket (guardar
original sin comprimir — punto de extensión OCR).

### 4.10 Facturación — Solicitud de Facturación (Fase 4)
ESTE SISTEMA NO EMITE FACTURAS NI HABLA CON ARCA.
Al terminar una OT (o al decidir el dueño) se genera una
SolicitudFacturacion: entidad separada de la OT con:
- datos del cliente (nombre, CUIT/DNI, condición fiscal, domicilio)
- ítems (descripción, cantidad, precio unitario) e importes netos
  — SIN cálculo de impuestos por parte de este sistema
- total, fecha de venta
- idExterno = número de OT (determinístico: reintentos no duplican)
- estados: pendiente → enviada → facturada → error (con detalle)
- campos de aterrizaje de la respuesta: numeroComprobante, cae,
  caeVencimiento, pdfUrl — se carguen por carga manual o por API
  futura, todo lo demás lee de ahí
Flujo: OT terminada → generar solicitud (pendiente) → enviar
(enviada, queda en cola) → el estudio factura → se registra
número/CAE/PDF (facturada) → la OT pasa a facturado → aviso al
cliente por WhatsApp. Detalle técnico: docs/03-integracion-estudio.md.

### 4.11 Reportes mínimos (Fase 3)
Cobranzas y ventas del mes, trabajos por tipo de servicio, deudas
pendientes, rentabilidad por OT (cobrado menos costo de repuestos).

### 4.12 WhatsApp (transversal)
MVP: solo links wa.me con texto pre-armado que el dueño revisa
antes de enviar. Mensajes: recordatorio de turno, presupuesto,
listo para retirar, factura lista, deuda. El teléfono del cliente
es obligatorio por esto. Fase futura: WhatsApp Business API con
aprobación interactiva.

## 5. Pantallas (mobile-first)
1. Inicio: turnos de hoy, OTs activas por estado (chips tocables),
   alertas (stock bajo, presupuestos sin respuesta, deudores,
   solicitudes de facturación pendientes)
2. Agenda día/semana
3. Detalle de OT: timeline, ítems, fotos, botón principal según
   estado (Recepcionar / Presupuestar / Avisar listo / Generar
   solicitud de factura / Registrar entrega)
4. Recepción con cámara (flujo guiado)
5. Cliente / Vehículo con historial
6. Stock / Gastos / Cobranzas / Solicitudes de facturación
7. Búsqueda global por patente, nombre o teléfono

## 6. Reglas de datos
Pesos argentinos, precios finales. Numeración OT-0001 secuencial.
Zona horaria America/Argentina/Buenos_Aires. Soft-delete para
clientes/vehículos con historia. OTs nunca se borran. Fotos en
storage (adaptador), metadata en la base.

## 7. Fuera de alcance
Multiusuario con roles, multi-taller, integración directa ARCA,
cálculo de impuestos en este sistema, WhatsApp Business API,
contabilidad (la hace el estudio), app nativa, e-commerce.

## 8. Fases futuras (diseñar puntos de enganche, NO implementar)
- IA con GLM: OCR de tickets, dictado de trabajos por voz,
  estructura de notas libres, recordatorios por km/fecha.
- WhatsApp Business API con aprobación interactiva.
- Offline completo de fotos (cola local).
- API del estudio contable como FacturacionAdapter.
