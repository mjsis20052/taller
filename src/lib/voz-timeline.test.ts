import { describe, expect, it } from "vitest";
import { ORIGEN_VOZ, notaVoz } from "@/lib/voz-timeline";

describe("notaVoz", () => {
  it("prefija la nota con el usuario para que se vea el origen en el panel", () => {
    expect(notaVoz("juan", "Cambio de estado a EN_DIAGNOSTICO")).toBe(
      "[voz — juan] Cambio de estado a EN_DIAGNOSTICO",
    );
  });

  it("ORIGEN_VOZ es el valor fijo que se guarda en TimelineEvento.origen", () => {
    expect(ORIGEN_VOZ).toBe("VOZ");
  });
});
