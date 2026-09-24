import { describe, expect, it } from "vitest";
import { EstadoOT } from "@/generated/prisma/enums";
import { MENSAJE_DERIVA_PANEL, debeAvanzarADiagnostico, validarTransicionVoz } from "@/lib/voz-estados";

describe("validarTransicionVoz", () => {
  it("permite el arranque especial TURNO_AGENDADO -> INGRESADO", () => {
    expect(validarTransicionVoz(EstadoOT.TURNO_AGENDADO, EstadoOT.INGRESADO)).toEqual({ permitido: true });
  });

  it("rechaza TURNO_AGENDADO -> cualquier otra cosa que no sea INGRESADO", () => {
    const resultado = validarTransicionVoz(EstadoOT.TURNO_AGENDADO, EstadoOT.EN_DIAGNOSTICO);
    expect(resultado.permitido).toBe(false);
  });

  it("permite moverse hacia adelante dentro de los estados de voz", () => {
    expect(validarTransicionVoz(EstadoOT.INGRESADO, EstadoOT.EN_DIAGNOSTICO)).toEqual({ permitido: true });
    expect(validarTransicionVoz(EstadoOT.INGRESADO, EstadoOT.TERMINADO)).toEqual({ permitido: true });
  });

  it("no deja retroceder de estado", () => {
    const resultado = validarTransicionVoz(EstadoOT.EN_EJECUCION, EstadoOT.INGRESADO);
    expect(resultado).toEqual({ permitido: false, motivo: "No se puede retroceder de estado por voz." });
  });

  it.each([
    EstadoOT.PRESUPUESTADO,
    EstadoOT.APROBADO,
    EstadoOT.FACTURADO,
    EstadoOT.ENTREGADO,
    EstadoOT.CANCELADA,
  ])("rechaza %s como destino con el mensaje que deriva al panel", (estadoProhibido) => {
    const resultado = validarTransicionVoz(EstadoOT.INGRESADO, estadoProhibido);
    expect(resultado).toEqual({ permitido: false, motivo: MENSAJE_DERIVA_PANEL });
  });

  it("rechaza cualquier movimiento si la OT ya está en un estado que la voz no maneja", () => {
    const resultado = validarTransicionVoz(EstadoOT.APROBADO, EstadoOT.EN_EJECUCION);
    expect(resultado).toEqual({ permitido: false, motivo: MENSAJE_DERIVA_PANEL });
  });
});

describe("debeAvanzarADiagnostico", () => {
  it("avanza desde TURNO_AGENDADO e INGRESADO", () => {
    expect(debeAvanzarADiagnostico(EstadoOT.TURNO_AGENDADO)).toBe(true);
    expect(debeAvanzarADiagnostico(EstadoOT.INGRESADO)).toBe(true);
  });

  it("no retrocede si ya está en o después de EN_DIAGNOSTICO", () => {
    expect(debeAvanzarADiagnostico(EstadoOT.EN_DIAGNOSTICO)).toBe(false);
    expect(debeAvanzarADiagnostico(EstadoOT.EN_EJECUCION)).toBe(false);
    expect(debeAvanzarADiagnostico(EstadoOT.TERMINADO)).toBe(false);
  });
});
