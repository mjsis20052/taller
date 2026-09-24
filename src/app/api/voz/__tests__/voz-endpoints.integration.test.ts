import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { EstadoOT } from "@/generated/prisma/enums";

// revalidatePath necesita el contexto de un request real de Next.js (App
// Router); fuera de un servidor corriendo (como acá, invocando los route
// handlers directo) no hay "static generation store" y tira. Se mockea: no
// es lo que se está probando, y Next ya se encarga de que funcione en runtime.
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

import { GET as GET_vehiculo } from "@/app/api/voz/vehiculos/[id]/route";
import { GET as GET_ot } from "@/app/api/voz/ordenes/[id]/route";
import { GET as GET_ordenes_lista } from "@/app/api/voz/ordenes/route";
import { POST as POST_items } from "@/app/api/voz/ordenes/[id]/items/route";
import { POST as POST_estado } from "@/app/api/voz/ordenes/[id]/estado/route";
import { POST as POST_diagnostico } from "@/app/api/voz/ordenes/[id]/diagnostico/route";
import { POST as POST_notas } from "@/app/api/voz/ordenes/[id]/notas/route";

// Integración contra la base real de desarrollo (taller-db, ver .env): estos
// endpoints hacen demasiadas cosas en cadena (transacciones, timeline,
// concurrencia optimista, idempotencia) como para que mockear Prisma valga
// la pena. Crea sus propios datos y los borra al final.

const CLAVE = "clave-test-voz-endpoints";
const USUARIO = "mecanico-test";

function req(url: string, init?: RequestInit & { sinKey?: boolean; sinUsuario?: boolean }): Request {
  const headers = new Headers(init?.headers);
  if (!init?.sinKey) headers.set("x-voz-key", CLAVE);
  if (!init?.sinUsuario) headers.set("x-voz-usuario", USUARIO);
  if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  return new Request(url, { ...init, headers });
}

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("endpoints /api/voz/*", () => {
  let claveOriginal: string | undefined;
  let clienteId: string;
  let vehiculoId: string;
  let otId: string;

  beforeAll(async () => {
    claveOriginal = process.env.VOZ_API_KEY;
    process.env.VOZ_API_KEY = CLAVE;

    const cliente = await prisma.cliente.create({
      data: {
        nombre: "Cliente Test Voz",
        tipoPersona: "FISICA",
        condicionFiscal: "CONSUMIDOR_FINAL",
        telefono: `test-${randomUUID().slice(0, 8)}`,
      },
    });
    clienteId = cliente.id;

    const vehiculo = await prisma.vehiculo.create({
      data: {
        clienteId,
        patente: `TEST${randomUUID().slice(0, 4).toUpperCase()}`,
        marca: "Test",
        modelo: "Voz",
      },
    });
    vehiculoId = vehiculo.id;

    const ot = await prisma.ordenTrabajo.create({
      data: {
        numero: `OT-TEST-${randomUUID().slice(0, 8)}`,
        clienteId,
        vehiculoId,
        estado: EstadoOT.INGRESADO,
        motivo: "Prueba automática",
      },
    });
    otId = ot.id;
  });

  afterAll(async () => {
    process.env.VOZ_API_KEY = claveOriginal;

    await prisma.vozIdempotencia.deleteMany({
      where: { endpoint: { in: [`items:${otId}`, `estado:${otId}`, `diagnostico:${otId}`, `notas:${otId}`] } },
    });
    await prisma.timelineEvento.deleteMany({ where: { otId } });
    await prisma.oTItem.deleteMany({ where: { otId } });
    await prisma.ordenTrabajo.delete({ where: { id: otId } });
    await prisma.vehiculo.delete({ where: { id: vehiculoId } });
    await prisma.cliente.delete({ where: { id: clienteId } });
  });

  describe("autenticación y header de usuario, comunes a todos los endpoints nuevos", () => {
    it("GET vehiculos/:id sin X-Voz-Key -> 401", async () => {
      const res = await GET_vehiculo(req(`http://x/api/voz/vehiculos/${vehiculoId}`, { sinKey: true }), params(vehiculoId));
      expect(res.status).toBe(401);
      expect((await res.json()).error).toBeTruthy();
    });

    it("GET vehiculos/:id con key pero sin X-Voz-Usuario -> 400", async () => {
      const res = await GET_vehiculo(
        req(`http://x/api/voz/vehiculos/${vehiculoId}`, { sinUsuario: true }),
        params(vehiculoId),
      );
      expect(res.status).toBe(400);
      expect((await res.json()).error).toMatch(/X-Voz-Usuario/);
    });
  });

  describe("GET /api/voz/vehiculos/:id", () => {
    it("devuelve vehículo + cliente + OT abierta + últimas visitas", async () => {
      const res = await GET_vehiculo(req(`http://x/api/voz/vehiculos/${vehiculoId}`), params(vehiculoId));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.vehiculo.id).toBe(vehiculoId);
      expect(body.cliente.id).toBe(clienteId);
      expect(body.otsAbiertas).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: otId, estado: "INGRESADO" })]),
      );
      expect(body.ultimasVisitas.length).toBeGreaterThan(0);
    });

    it("404 si el vehículo no existe", async () => {
      const res = await GET_vehiculo(req("http://x/api/voz/vehiculos/no-existe"), params("no-existe"));
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/voz/ordenes/:id", () => {
    it("devuelve ot, items y timeline", async () => {
      const res = await GET_ot(req(`http://x/api/voz/ordenes/${otId}`), params(otId));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ot.id).toBe(otId);
      expect(body.ot.updatedAt).toBeTruthy();
      expect(Array.isArray(body.items)).toBe(true);
      expect(Array.isArray(body.timeline)).toBe(true);
    });
  });

  describe("GET /api/voz/ordenes (lista, para \"Vehículos en reparación\")", () => {
    it("incluye la OT de prueba (abierta) con patente y cliente", async () => {
      const res = await GET_ordenes_lista(req("http://x/api/voz/ordenes"));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.ordenes)).toBe(true);
      expect(body.ordenes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ otId, estado: "INGRESADO", clienteId, vehiculoId }),
        ]),
      );
    });

    it("sin X-Voz-Usuario -> 400", async () => {
      const res = await GET_ordenes_lista(req("http://x/api/voz/ordenes", { sinUsuario: true }));
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/voz/ordenes/:id/items", () => {
    it("crea un ítem con precioUnitario 0 aunque el cliente mande un precio, e ignora idempotencyKey faltante", async () => {
      const sinKey = await POST_items(
        req(`http://x/api/voz/ordenes/${otId}/items`, {
          method: "POST",
          body: JSON.stringify({ tipo: "MANO_OBRA", descripcion: "Cambio de aceite", cantidad: 1 }),
        }),
        params(otId),
      );
      expect(sinKey.status).toBe(400);

      const key = randomUUID();
      const res = await POST_items(
        req(`http://x/api/voz/ordenes/${otId}/items`, {
          method: "POST",
          body: JSON.stringify({
            tipo: "MANO_OBRA",
            descripcion: "Cambio de aceite",
            cantidad: 1,
            falla: "Ruido en el motor",
            precioUnitario: 999999,
            idempotencyKey: key,
          }),
        }),
        params(otId),
      );
      expect(res.status).toBe(201);
      const body = await res.json();

      const item = await prisma.oTItem.findUniqueOrThrow({ where: { id: body.itemId } });
      expect(Number(item.precioUnitario)).toBe(0);
      expect(item.descripcion).toBe("Cambio de aceite");

      // Reintento con la misma key: misma respuesta, no duplica el ítem.
      const cantidadAntes = await prisma.oTItem.count({ where: { otId } });
      const reintento = await POST_items(
        req(`http://x/api/voz/ordenes/${otId}/items`, {
          method: "POST",
          body: JSON.stringify({
            tipo: "MANO_OBRA",
            descripcion: "Cambio de aceite",
            cantidad: 1,
            precioUnitario: 999999,
            idempotencyKey: key,
          }),
        }),
        params(otId),
      );
      expect(reintento.status).toBe(201);
      expect(await reintento.json()).toEqual(body);
      const cantidadDespues = await prisma.oTItem.count({ where: { otId } });
      expect(cantidadDespues).toBe(cantidadAntes);
    });
  });

  describe("POST /api/voz/ordenes/:id/estado", () => {
    it("rechaza un destino fuera de la whitelist con 403 y deriva al panel", async () => {
      const ot = await prisma.ordenTrabajo.findUniqueOrThrow({ where: { id: otId } });
      const res = await POST_estado(
        req(`http://x/api/voz/ordenes/${otId}/estado`, {
          method: "POST",
          body: JSON.stringify({
            estadoNuevo: "FACTURADO",
            updatedAt: ot.updatedAt.toISOString(),
            idempotencyKey: randomUUID(),
          }),
        }),
        params(otId),
      );
      expect(res.status).toBe(403);
      expect((await res.json()).error).toMatch(/panel/i);
    });

    it("409 con el estado fresco si updatedAt no coincide (conflicto de concurrencia)", async () => {
      const res = await POST_estado(
        req(`http://x/api/voz/ordenes/${otId}/estado`, {
          method: "POST",
          body: JSON.stringify({
            estadoNuevo: "EN_DIAGNOSTICO",
            updatedAt: new Date(0).toISOString(),
            idempotencyKey: randomUUID(),
          }),
        }),
        params(otId),
      );
      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.estadoActual).toBe("INGRESADO");
      expect(body.updatedAt).toBeTruthy();
    });

    it("mueve el estado con updatedAt correcto y deja el evento de timeline con usuario/origen", async () => {
      const ot = await prisma.ordenTrabajo.findUniqueOrThrow({ where: { id: otId } });
      const res = await POST_estado(
        req(`http://x/api/voz/ordenes/${otId}/estado`, {
          method: "POST",
          body: JSON.stringify({
            estadoNuevo: "EN_DIAGNOSTICO",
            updatedAt: ot.updatedAt.toISOString(),
            idempotencyKey: randomUUID(),
          }),
        }),
        params(otId),
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.estado).toBe("EN_DIAGNOSTICO");

      const actualizada = await prisma.ordenTrabajo.findUniqueOrThrow({ where: { id: otId } });
      expect(actualizada.estado).toBe(EstadoOT.EN_DIAGNOSTICO);

      const evento = await prisma.timelineEvento.findFirst({
        where: { otId, estado: EstadoOT.EN_DIAGNOSTICO },
        orderBy: { fecha: "desc" },
      });
      expect(evento?.usuario).toBe(USUARIO);
      expect(evento?.origen).toBe("VOZ");
      expect(evento?.nota).toMatch(/^\[voz — mecanico-test\]/);
    });
  });

  describe("POST /api/voz/ordenes/:id/diagnostico", () => {
    it("agrega el diagnóstico como OTItem y no retrocede el estado si ya pasó EN_DIAGNOSTICO", async () => {
      const ot = await prisma.ordenTrabajo.findUniqueOrThrow({ where: { id: otId } });
      expect(ot.estado).toBe(EstadoOT.EN_DIAGNOSTICO); // dejado así por el test anterior

      const res = await POST_diagnostico(
        req(`http://x/api/voz/ordenes/${otId}/diagnostico`, {
          method: "POST",
          body: JSON.stringify({
            falla: "Pastillas de freno gastadas",
            updatedAt: ot.updatedAt.toISOString(),
            idempotencyKey: randomUUID(),
          }),
        }),
        params(otId),
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.estado).toBe("EN_DIAGNOSTICO"); // ya estaba ahí, no retrocede ni hace nada raro

      const item = await prisma.oTItem.findUniqueOrThrow({ where: { id: body.itemId } });
      expect(item.falla).toBe("Pastillas de freno gastadas");
      expect(Number(item.precioUnitario)).toBe(0);
    });
  });

  describe("POST /api/voz/ordenes/:id/notas", () => {
    it("agrega una nota sin cambiar el estado actual de la OT", async () => {
      const antes = await prisma.ordenTrabajo.findUniqueOrThrow({ where: { id: otId } });

      const res = await POST_notas(
        req(`http://x/api/voz/ordenes/${otId}/notas`, {
          method: "POST",
          body: JSON.stringify({ nota: "El cliente llama a las 18hs", idempotencyKey: randomUUID() }),
        }),
        params(otId),
      );
      expect(res.status).toBe(201);
      const body = await res.json();

      const evento = await prisma.timelineEvento.findUniqueOrThrow({ where: { id: body.eventoId } });
      expect(evento.estado).toBe(antes.estado);
      expect(evento.origen).toBe("VOZ");
      expect(evento.usuario).toBe(USUARIO);
      expect(evento.nota).toBe("[voz — mecanico-test] El cliente llama a las 18hs");

      const despues = await prisma.ordenTrabajo.findUniqueOrThrow({ where: { id: otId } });
      expect(despues.estado).toBe(antes.estado);
    });
  });
});
