"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { EstadoOT } from "@/generated/prisma/enums";
import { montoFirmado } from "@/lib/formato";

const CONCEPTOS = ["SENA", "PAGO", "DEVOLUCION"] as const;
type Concepto = (typeof CONCEPTOS)[number];

function leerConcepto(valor: FormDataEntryValue | null): Concepto {
  return CONCEPTOS.includes(valor as Concepto) ? (valor as Concepto) : "PAGO";
}

function refrescar(clienteId: string, otId?: string | null) {
  revalidatePath("/cobranzas");
  revalidatePath("/caja");
  revalidatePath("/reportes");
  revalidatePath("/");
  revalidatePath(`/clientes/${clienteId}`);
  if (otId) revalidatePath(`/ots/${otId}`);
}

// Pago, seña o devolución de una OT puntual (el cliente se toma de la propia OT).
export async function registrarPagoOT(otId: string, formData: FormData) {
  const monto = Number(formData.get("monto") ?? 0);
  const metodo = String(formData.get("metodo") ?? "").trim() || null;
  const notas = String(formData.get("notas") ?? "").trim() || null;
  const concepto = leerConcepto(formData.get("concepto"));

  if (!monto || monto <= 0) return;

  const ot = await prisma.ordenTrabajo.findUniqueOrThrow({ where: { id: otId }, select: { clienteId: true } });

  await prisma.cobro.create({
    data: { clienteId: ot.clienteId, otId, monto, metodo, notas, concepto },
  });

  refrescar(ot.clienteId, otId);
}

export async function eliminarPagoOT(cobroId: string, otId: string) {
  const cobro = await prisma.cobro.delete({ where: { id: cobroId } });
  refrescar(cobro.clienteId, otId);
}

// Cobro desde la cuenta del cliente. "auto" reparte entre sus OT con saldo, las más
// viejas primero; lo que sobra queda "a cuenta". También puede ir a una OT puntual
// o directo "a cuenta". Una devolución resta y va siempre a nombre del cliente.
export async function registrarCobroCliente(clienteId: string, formData: FormData) {
  const monto = Number(formData.get("monto") ?? 0);
  const metodo = String(formData.get("metodo") ?? "").trim() || null;
  const notas = String(formData.get("notas") ?? "").trim() || null;
  const destino = String(formData.get("destino") ?? "auto");
  const concepto = leerConcepto(formData.get("concepto"));

  if (!monto || monto <= 0) return;

  if (concepto === "DEVOLUCION" || destino === "cuenta") {
    await prisma.cobro.create({ data: { clienteId, otId: null, monto, metodo, notas, concepto } });
    refrescar(clienteId);
    return;
  }

  if (destino !== "auto") {
    const ot = await prisma.ordenTrabajo.findFirst({ where: { id: destino, clienteId }, select: { id: true } });
    if (!ot) return;
    await prisma.cobro.create({ data: { clienteId, otId: ot.id, monto, metodo, notas, concepto } });
    refrescar(clienteId, ot.id);
    return;
  }

  await prisma.$transaction(async (tx) => {
    const ots = await tx.ordenTrabajo.findMany({
      where: { clienteId, estado: { notIn: [EstadoOT.TURNO_AGENDADO, EstadoOT.CANCELADA] } },
      select: { id: true, total: true, cobros: { select: { monto: true, concepto: true } } },
      orderBy: { createdAt: "asc" },
    });

    let restante = monto;
    for (const ot of ots) {
      if (restante <= 0) break;
      const pagado = ot.cobros.reduce((acc, c) => acc + montoFirmado(c), 0);
      const saldo = Number(ot.total) - pagado;
      if (saldo <= 0) continue;
      const aplicar = Math.min(restante, saldo);
      await tx.cobro.create({ data: { clienteId, otId: ot.id, monto: aplicar, metodo, notas, concepto } });
      restante = Math.round((restante - aplicar) * 100) / 100;
    }

    if (restante > 0) {
      await tx.cobro.create({ data: { clienteId, otId: null, monto: restante, metodo, notas, concepto } });
    }
  });

  refrescar(clienteId);
}
