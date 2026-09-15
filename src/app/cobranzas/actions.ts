"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

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
