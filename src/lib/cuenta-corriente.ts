import { prisma } from "@/lib/prisma";
import { EstadoOT } from "@/generated/prisma/enums";

const ESTADOS_FACTURABLES = [EstadoOT.ENTREGADO, EstadoOT.FACTURADO];

export async function saldoCliente(clienteId: string): Promise<number> {
  const [ots, cobros] = await Promise.all([
    prisma.ordenTrabajo.findMany({
      where: { clienteId, estado: { in: ESTADOS_FACTURABLES } },
      select: { total: true },
    }),
    prisma.cobro.findMany({ where: { clienteId }, select: { monto: true } }),
  ]);

  const totalOts = ots.reduce((acc, ot) => acc + Number(ot.total), 0);
  const totalCobrado = cobros.reduce((acc, c) => acc + Number(c.monto), 0);
  return totalOts - totalCobrado;
}

export async function listarDeudores() {
  const clientes = await prisma.cliente.findMany({
    where: { activo: true },
    select: {
      id: true,
      nombre: true,
      telefono: true,
      ordenesTrabajo: {
        where: { estado: { in: ESTADOS_FACTURABLES } },
        select: { total: true },
      },
      cobros: { select: { monto: true } },
    },
  });

  return clientes
    .map((c) => {
      const totalOts = c.ordenesTrabajo.reduce((acc, ot) => acc + Number(ot.total), 0);
      const totalCobrado = c.cobros.reduce((acc, co) => acc + Number(co.monto), 0);
      return { id: c.id, nombre: c.nombre, telefono: c.telefono, deuda: totalOts - totalCobrado };
    })
    .filter((c) => c.deuda > 0)
    .sort((a, b) => b.deuda - a.deuda);
}
