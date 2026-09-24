import { EstadoOT } from "@/generated/prisma/enums";

// Estados que la voz puede leer/mover en el flujo normal de una OT. Todo lo
// que quede afuera (PRESUPUESTADO, APROBADO, FACTURADO, ENTREGADO, CANCELADA)
// implica una decisión de precio, cobro o algo legal que se toma en el
// panel, nunca por voz (ver docs/CONTRATO-ASISTENTE.md, sección 1).
export const ESTADOS_VOZ: EstadoOT[] = [
  EstadoOT.INGRESADO,
  EstadoOT.EN_DIAGNOSTICO,
  EstadoOT.EN_EJECUCION,
  EstadoOT.TERMINADO,
];

const ORDEN_VOZ: Partial<Record<EstadoOT, number>> = {
  [EstadoOT.INGRESADO]: 0,
  [EstadoOT.EN_DIAGNOSTICO]: 1,
  [EstadoOT.EN_EJECUCION]: 2,
  [EstadoOT.TERMINADO]: 3,
};

export const MENSAJE_DERIVA_PANEL = "Eso se hace desde el panel, no por voz.";

export type ResultadoTransicionVoz = { permitido: true } | { permitido: false; motivo: string };

// Valida una transición de estado pedida por voz (POST /api/voz/ordenes/:id/estado).
// A diferencia de avanzarEstadoOT del panel (que solo sabe "avanzar un
// paso"), la voz puede necesitar saltar directo a cualquier estado de
// ESTADOS_VOZ — por eso esto no reusa SIGUIENTE_ESTADO de ots/actions.ts,
// es una validación distinta: whitelist server-side (nunca se confía en lo
// que mande el cliente) + sin retroceder.
export function validarTransicionVoz(estadoActual: EstadoOT, estadoNuevo: EstadoOT): ResultadoTransicionVoz {
  if (!ESTADOS_VOZ.includes(estadoNuevo)) {
    return { permitido: false, motivo: MENSAJE_DERIVA_PANEL };
  }

  // Caso especial de arranque: el turno agendado recién ahora ingresa.
  if (estadoActual === EstadoOT.TURNO_AGENDADO) {
    if (estadoNuevo === EstadoOT.INGRESADO) return { permitido: true };
    return {
      permitido: false,
      motivo: "Todavía no ingresó el vehículo: primero hay que pasarlo a INGRESADO.",
    };
  }

  const posicionActual = ORDEN_VOZ[estadoActual];
  if (posicionActual === undefined) {
    // La OT está en un estado que la voz no maneja (PRESUPUESTADO, APROBADO,
    // FACTURADO, ENTREGADO, CANCELADA): cualquier movimiento desde ahí es
    // del panel.
    return { permitido: false, motivo: MENSAJE_DERIVA_PANEL };
  }

  const posicionNueva = ORDEN_VOZ[estadoNuevo]!;
  if (posicionNueva < posicionActual) {
    return { permitido: false, motivo: "No se puede retroceder de estado por voz." };
  }

  return { permitido: true };
}

// Para POST /api/voz/ordenes/:id/diagnostico: solo mueve la OT a
// EN_DIAGNOSTICO si todavía no llegó (o ya pasó) ese punto de la secuencia
// que maneja la voz. Un diagnóstico agregado con la OT ya en EN_EJECUCION o
// TERMINADO no la hace retroceder.
export function debeAvanzarADiagnostico(estadoActual: EstadoOT): boolean {
  return estadoActual === EstadoOT.TURNO_AGENDADO || estadoActual === EstadoOT.INGRESADO;
}
