# AGENTS.md — Reglas del proyecto (LECTURA OBLIGATORIA)

## PROTOCOLO DE SESIÓN (obligatorio, SIEMPRE, sin excepción)
1. ANTES de responder cualquier tarea: leer docs/05-progreso.md,
   docs/04-roadmap.md (fase y tarea actual) y las secciones
   relevantes de docs/01-PRD.md y docs/02-arquitectura.md.
2. Confirmar en UNA línea: fase actual + qué vas a hacer.
3. Ejecutar SOLO esa tarea. Nada de fases futuras.
4. Al terminar: actualizar docs/05-progreso.md (hecho / pendiente /
   decisiones nuevas).
5. Si algo no está definido en los docs: PREGUNTAR, no inventar.

## Descripción
Sistema de gestión integral para un taller mecánico de Argentina.
Un solo taller, un solo usuario (el dueño, MONOTRIBUTISTA).
PWA mobile-first: se usa desde el celular, en el taller, con las
manos ocupadas. Botones grandes, mínimo tipeo, pocos toques.

## Stack técnico (NO cambiar sin consultar)
- Next.js (App Router) + TypeScript
- PostgreSQL 16 vía Docker (docker-compose.yml incluido)
- Prisma ORM
- Tailwind CSS
- Fotos: adaptador de storage (local en MVP, S3/R2 después).
  NUNCA guardar fotos en la base de datos.
- PWA instalable. Offline avanzado: fase futura.

## Entidad central: la Orden de Trabajo (OT)
Estados (enum fijo):
turno_agendado → ingresado → en_diagnostico → presupuestado →
aprobado → en_ejecucion → terminado → facturado → entregado
Estado adicional: cancelada (motivo obligatorio). Las OT nunca
se borran. Numeración: OT-0001, OT-0002... secuencial.
No agregar estados sin actualizar docs/01-PRD.md primero.

## Reglas de negocio críticas
1. Patente argentina: validar AMBOS formatos (viejo AAA123 y
   Mercosur AA123BB).
2. El dueño es MONOTRIBUTISTA → factura C. Pero ESTE SISTEMA NO
   EMITE FACTURAS y NO se integra directo con ARCA/AFIP.
   PROHIBIDO implementar integración directa con ARCA.
3. ESTE SISTEMA NUNCA CALCULA IMPUESTOS. Se trabajan con importes
   netos/finales y el sistema que factura decide alícuotas.
4. Facturación: la OT terminada genera una SOLICITUD DE FACTURACIÓN
   (entidad separada, estados: pendiente → enviada → facturada →
   error). "Enviar" y "recibir confirmación" son pasos
   DESACOPLADOS. Detalles en docs/03-integracion-estudio.md.
5. ID determinístico para facturación: el identificador externo de
   la solicitud es el número de OT. Reintentar el envío no puede
   generar dos facturas del mismo trabajo.
6. Cliente: desde el alta se captura tipoPersona (física o
   razón social), DNI/CUIT con validación de formato, y condición
   fiscal (default: consumidor final). El teléfono es dato
   OBLIGATORIO (formato internacional para WhatsApp).
7. WhatsApp en MVP: SOLO links wa.me con texto pre-armado.
   NO usar WhatsApp Business API (fase futura).
8. Cuenta corriente: los clientes pueden tener saldo pendiente y
   pagar en partes. Es funcionalidad, no error.
9. Historial del vehículo y timeline de la OT: INMUTABLES.
   Solo se agregan entradas, nunca se edita ni borra lo histórico.
10. Fotos de gastos: guardar archivo original sin comprimir
    (punto de extensión para OCR futuro). Campo notas libres de
    la OT: no cambiar su forma (punto de extensión IA futura).

## Patrones de arquitectura obligatorios
- StorageAdapter (fotos): hoy LocalAdapter (carpeta uploads/),
  mañana S3Adapter. El resto del sistema no sabe cuál se usa.
- FacturacionAdapter: interfaz solicitarFactura(solicitudId) /
  consultarEstado(solicitudId). Hoy: ColaManualAdapter (deja la
  solicitud en cola para proceso humano). Mañana: API del estudio.
  Cambia solo la implementación, nada más.

## Convenciones
- Idioma: español de Argentina en UI, comentarios, commits y docs.
- Mobile-first: todo se diseña primero para pantalla de celular.
- Mínimo tipeo: selects, autocompletado y servicios frecuentes
  por encima del texto libre.
- Commits en español, convencionales (feat:, fix:, docs:, chore:).
- Zona horaria: America/Argentina/Buenos_Aires.
- Moneda: pesos argentinos, precios finales al público.
- Un solo usuario: NO sobre-ingenierizar (nada de roles,
  multi-tenancy ni abstracciones sin motivo).

## Mapa de documentación
- docs/01-PRD.md → requisitos y reglas completas de negocio
- docs/02-arquitectura.md → modelo de datos y decisiones técnicas
- docs/03-integracion-estudio.md → integración facturación estudio
- docs/04-roadmap.md → fases y backlog tarea por tarea
- docs/05-progreso.md → estado actual (fuente de verdad de dónde
  está parado el proyecto)
- docker-compose.yml → base PostgreSQL de desarrollo

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
