"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// Pago o seña de una OT puntual (el cliente se toma de la propia OT).
export async function registrarPagoOT(otId: string, formData: FormData) {
  const monto = Number(formData.get("monto") ?? 0);
  const metodo = String(formData.get("metodo") ?? "").trim() || null;
  const notas = String(formData.get("notas") ?? "").trim() || null;
  const concepto = formData.get("concepto") === "SENA" ? "SENA" : "PAGO";

  if (!monto || monto <= 0) return;

  const ot = await prisma.ordenTrabajo.findUniqueOrThrow({ where: { id: otId }, select: { clienteId: true } });

  await prisma.cobro.create({
    data: { clienteId: ot.clienteId, otId, monto, metodo, notas, concepto },
  });

  revalidatePath("/cobranzas");
  revalidatePath(`/clientes/${ot.clienteId}`);
  revalidatePath(`/ots/${otId}`);
  revalidatePath("/");
}

export async function eliminarPagoOT(cobroId: string, otId: string) {
  const cobro = await prisma.cobro.delete({ where: { id: cobroId } });

  revalidatePath("/cobranzas");
  revalidatePath(`/clientes/${cobro.clienteId}`);
  revalidatePath(`/ots/${otId}`);
  revalidatePath("/");
}

export async function registrarCobro(clienteId: string, otId: string | null, formData: FormData) {
  const monto = Number(formData.get("monto") ?? 0);
  const metodo = String(formData.get("metodo") ?? "").trim() || null;
  const notas = String(formData.get("notas") ?? "").trim() || null;

  if (!monto || monto <= 0) return;

  await prisma.cobro.create({
    data: { clienteId, otId, monto, metodo, notas },
  });

  revalidatePath("/cobranzas");
  revalidatePath(`/clientes/${clienteId}`);
  if (otId) revalidatePath(`/ots/${otId}`);
}
