# Integración con el estudio contable

## Principio
El taller NO emite facturas ni habla con ARCA. El estudio factura.
Este sistema transmite la venta y registra la respuesta. La
integración está diseñada para funcionar igual sin importar CÓMO
se conecte: API, archivo o carga manual.

## Decisiones (recomendaciones del responsable del sistema contable)
1. SolicitudFacturacion es una entidad SEPARADA de la OT. Cualquier
   mecanismo de integración futuro consume ese mismo objeto.
2. Envío y confirmación DESACOPLADOS: nunca asumir respuesta
   automática inmediata. La primera versión es cola manual.
3. Campos de aterrizaje fijos: numeroComprobante, cae,
   caeVencimiento, pdfUrl. El aviso por WhatsApp al cliente lee
   de ahí, sin importar cómo llegó la info.
4. Validar CUIT/DNI y condición fiscal desde el alta del cliente,
   no después. Capturar persona física vs razón social.
5. Este sistema NO calcula impuestos: manda importes netos. Quien
   factura decide alícuotas (evita divergencias entre sistemas).
6. ID determinístico: idExterno = número de OT. Un reintento jamás
   genera dos facturas del mismo trabajo.
7. Patrón adaptador: FacturacionAdapter con solicitarFactura() /
   consultarEstado(). Implementación actual ColaManualAdapter.
   Cuando el estudio tenga API: nuevo adaptador, cero cambios en
   el resto del sistema.

## Estado actual
- El estudio ya opera con ARCA desde su sistema.
- La facturación automática sin revisión humana es una decisión de
  control interno PENDIENTE en el estudio. Por eso el flujo v1 es
  manual del lado del estudio.
- API del estudio: todavía no definida. Cuando exista, se
  implementa ApiEstudioAdapter y se configura por variable de
  entorno (credentials en .env, nunca en el código).

## Flujo v1 (cola manual)
1. OT terminada → botón "Generar solicitud de facturación"
   → SolicitudFacturacion en PENDIENTE.
2. Dueño revisa y toca "Enviar al estudio" → ENVIADA (queda en cola).
3. El estudio procesa (hoy: la carga en su sistema contra ARCA).
4. El dueño recibe la factura y la registra en la pantalla
   "Solicitudes": carga número de comprobante, CAE, vencimiento
   y adjunta el PDF → FACTURADA.
5. La OT asociada pasa a facturado. Botón WhatsApp "acá tenés tu
   factura" usando pdfUrl.
Si hay error: estado ERROR + detalle, se puede reenviar (el
idExterno determinístico evita duplicados).
