import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { EstadoOT } from "@/generated/prisma/enums";

// Verifica que el refactor de agregarTrabajoOT/agregarRepuestoOT (ots/actions.ts)
// para reusar crearOTItem (ordenes-trabajo.ts) no cambió el comportamiento del
// panel: mismo resultado que antes del refactor (ítem creado, totales
// recalculados, stock descontado cuando corresponde).
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({ redirect: () => {} }));

const { agregarTrabajoOT, agregarRepuestoOT } = await import("@/app/(interno)/ots/actions");

function formData(campos: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [clave, valor] of Object.entries(campos)) fd.set(clave, valor);
  return fd;
}

describe("agregarTrabajoOT / agregarRepuestoOT (panel) tras el refactor a crearOTItem", () => {
  let clienteId: string;
  let vehiculoId: string;
  let otId: string;
  let repuestoId: string;

  beforeAll(async () => {
    const cliente = await prisma.cliente.create({
      data: {
        nombre: "Cliente Test Refactor",
        tipoPersona: "FISICA",
        condicionFiscal: "CONSUMIDOR_FINAL",
        telefono: `test-${randomUUID().slice(0, 8)}`,
      },
    });
    clienteId = cliente.id;

    const vehiculo = await prisma.vehiculo.create({
      data: { clienteId, patente: `TREF${randomUUID().slice(0, 4).toUpperCase()}`, marca: "Test", modelo: "Refactor" },
    });
    vehiculoId = vehiculo.id;

    const ot = await prisma.ordenTrabajo.create({
      data: {
        numero: `OT-TREF-${randomUUID().slice(0, 8)}`,
        clienteId,
        vehiculoId,
        estado: EstadoOT.EN_DIAGNOSTICO,
      },
    });
    otId = ot.id;

    const repuesto = await prisma.repuesto.create({
      data: { descripcion: `Repuesto test ${randomUUID().slice(0, 6)}`, stock: 10, costo: 500, precioVenta: 1000 },
    });
    repuestoId = repuesto.id;
  });

  afterAll(async () => {
    await prisma.movimientoStock.deleteMany({ where: { otId } });
    await prisma.oTItem.deleteMany({ where: { otId } });
    await prisma.ordenTrabajo.delete({ where: { id: otId } });
    await prisma.vehiculo.delete({ where: { id: vehiculoId } });
    await prisma.cliente.delete({ where: { id: clienteId } });
    await prisma.repuesto.delete({ where: { id: repuestoId } });
  });

  it("agregarTrabajoOT crea el ítem de mano de obra con el precio cargado y recalcula totales", async () => {
    await agregarTrabajoOT(
      otId,
      formData({ falla: "Ruido en la suspensión", solucion: "Cambio de amortiguadores", precio: "50000" }),
    );

    const items = await prisma.oTItem.findMany({ where: { otId, tipo: "MANO_OBRA" } });
    expect(items).toHaveLength(1);
    expect(items[0].descripcion).toBe("Cambio de amortiguadores");
    expect(items[0].falla).toBe("Ruido en la suspensión");
    expect(Number(items[0].precioUnitario)).toBe(50000);

    const ot = await prisma.ordenTrabajo.findUniqueOrThrow({ where: { id: otId } });
    expect(Number(ot.totalManoObra)).toBe(50000);
    expect(Number(ot.total)).toBe(50000);
  });

  it("agregarRepuestoOT crea el ítem de repuesto, descuenta stock y deja el movimiento", async () => {
    await agregarRepuestoOT(
      otId,
      formData({
        repuestoId,
        descripcion: "Filtro de aceite",
        cantidad: "2",
        precioUnitario: "3000",
      }),
    );

    const items = await prisma.oTItem.findMany({ where: { otId, tipo: "REPUESTO" } });
    expect(items).toHaveLength(1);
    expect(Number(items[0].cantidad)).toBe(2);
    expect(Number(items[0].precioUnitario)).toBe(3000);
    expect(items[0].repuestoId).toBe(repuestoId);

    const repuesto = await prisma.repuesto.findUniqueOrThrow({ where: { id: repuestoId } });
    expect(repuesto.stock).toBe(8); // 10 - 2

    const movimiento = await prisma.movimientoStock.findFirst({ where: { otId, repuestoId } });
    expect(movimiento?.tipo).toBe("SALIDA");
    expect(movimiento?.cantidad).toBe(2);

    const ot = await prisma.ordenTrabajo.findUniqueOrThrow({ where: { id: otId } });
    expect(Number(ot.totalRepuestos)).toBe(6000);
    expect(Number(ot.total)).toBe(50000 + 6000);
  });
});
