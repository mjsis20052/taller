import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { vozAutorizado, vozUsuario } from "@/lib/voz-auth";

const CLAVE_ORIGINAL = process.env.VOZ_API_KEY;

describe("vozAutorizado", () => {
  beforeEach(() => {
    process.env.VOZ_API_KEY = "clave-de-test";
  });
  afterEach(() => {
    process.env.VOZ_API_KEY = CLAVE_ORIGINAL;
  });

  it("rechaza sin header", () => {
    const request = new Request("http://localhost/api/voz/ordenes/1");
    expect(vozAutorizado(request)).toBe(false);
  });

  it("rechaza con la clave equivocada", () => {
    const request = new Request("http://localhost/api/voz/ordenes/1", {
      headers: { "x-voz-key": "otra-cosa" },
    });
    expect(vozAutorizado(request)).toBe(false);
  });

  it("acepta con la clave correcta", () => {
    const request = new Request("http://localhost/api/voz/ordenes/1", {
      headers: { "x-voz-key": "clave-de-test" },
    });
    expect(vozAutorizado(request)).toBe(true);
  });

  it("queda cerrado si no hay VOZ_API_KEY configurada", () => {
    delete process.env.VOZ_API_KEY;
    const request = new Request("http://localhost/api/voz/ordenes/1", {
      headers: { "x-voz-key": "clave-de-test" },
    });
    expect(vozAutorizado(request)).toBe(false);
  });
});

describe("vozUsuario", () => {
  it("devuelve null sin el header X-Voz-Usuario", () => {
    const request = new Request("http://localhost/api/voz/ordenes/1");
    expect(vozUsuario(request)).toBeNull();
  });

  it("devuelve null si el header viene vacío", () => {
    const request = new Request("http://localhost/api/voz/ordenes/1", {
      headers: { "x-voz-usuario": "   " },
    });
    expect(vozUsuario(request)).toBeNull();
  });

  it("devuelve el usuario recortado", () => {
    const request = new Request("http://localhost/api/voz/ordenes/1", {
      headers: { "x-voz-usuario": "  maria  " },
    });
    expect(vozUsuario(request)).toBe("maria");
  });
});
