import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function siguienteNumeroOT(
  tx: Prisma.TransactionClient = prisma,
): Promise<string> {
  const ultima = await tx.ordenTrabajo.findFirst({
    orderBy: { numero: "desc" },
    select: { numero: true },
  });

  const ultimoNumero = ultima ? Number(ultima.numero.replace("OT-", "")) : 0;
  return `OT-${String(ultimoNumero + 1).padStart(4, "0")}`;
}

export async function recalcularTotalesOT(otId: string, tx: Prisma.TransactionClient = prisma) {
  const items = await tx.oTItem.findMany({ where: { otId } });

  const totalRepuestos = items
    .filter((i) => i.tipo === "REPUESTO")
    .reduce((acc, i) => acc + Number(i.cantidad) * Number(i.precioUnitario), 0);
  const totalManoObra = items
    .filter((i) => i.tipo === "MANO_OBRA")
    .reduce((acc, i) => acc + Number(i.cantidad) * Number(i.precioUnitario), 0);

  await tx.ordenTrabajo.update({
    where: { id: otId },
    data: {
      totalRepuestos,
      totalManoObra,
      total: totalRepuestos + totalManoObra,
    },
  });
}
