"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { EstadoOT, EstadoPresupuesto } from "@/generated/prisma/enums";

// El cliente aprueba o rechaza el presupuesto desde su informe. Se identifica por el enlace
// secreto de la OT, sin sesión: solo puede tocar el presupuesto vigente de esa orden.
export async function responderPresupuestoCliente(
  token: string,
  presupuestoId: string,
  resultado: "APROBADO" | "RECHAZADO",
): Promise<{ ok: boolean; error?: string }> {
  if (!/^[a-f0-9]{32}$/.test(token)) return { ok: false, error: "Enlace inválido." };

  const ot = await prisma.ordenTrabajo.findUnique({
    where: { tokenInforme: token },
    include: { presupuestos: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  const presupuesto = ot?.presupuestos[0];
  if (!ot || !presupuesto || presupuesto.id !== presupuestoId) return { ok: false, error: "No encontramos ese presupuesto." };
  if (presupuesto.estado !== EstadoPresupuesto.ENVIADO || ot.estado !== EstadoOT.PRESUPUESTADO) {
    return { ok: false, error: "Este presupuesto ya fue respondido." };
  }

  const aprobado = resultado === "APROBADO";
  await prisma.$transaction(async (tx) => {
    await tx.presupuesto.update({
      where: { id: presupuestoId },
      data: {
        estado: aprobado ? EstadoPresupuesto.APROBADO : EstadoPresupuesto.RECHAZADO,
        respondidoAt: new Date(),
        metodoRespuesta: "Desde el informe",
      },
    });
    if (aprobado) await tx.ordenTrabajo.update({ where: { id: ot.id }, data: { estado: EstadoOT.APROBADO } });
    await tx.timelineEvento.create({
      data: {
        otId: ot.id,
        estado: aprobado ? EstadoOT.APROBADO : EstadoOT.PRESUPUESTADO,
        nota: aprobado ? "El cliente aprobó el presupuesto desde el informe" : "El cliente rechazó el presupuesto desde el informe",
      },
    });
  });

  revalidatePath(`/ots/${ot.id}`);
  revalidatePath(`/informe/${token}`);
  return { ok: true };
}
