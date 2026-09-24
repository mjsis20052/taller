import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vozAutorizado, vozUsuario } from "@/lib/voz-auth";

export const dynamic = "force-dynamic";

// Detalle completo de una OT para que el asistente la relea antes de
// proponer un cambio (y para comparar el `updatedAt` que va en cada
// escritura, ver src/lib/voz-idempotencia.ts y voz-estados.ts).
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!vozAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!vozUsuario(request)) {
    return NextResponse.json({ error: "Falta el header X-Voz-Usuario." }, { status: 400 });
  }

  const { id } = await params;

  const ot = await prisma.ordenTrabajo.findUnique({ where: { id } });
  if (!ot) {
    return NextResponse.json({ error: `No existe la OT ${id}.` }, { status: 404 });
  }

  const [items, timeline] = await Promise.all([
    prisma.oTItem.findMany({ where: { otId: id }, orderBy: { createdAt: "asc" } }),
    prisma.timelineEvento.findMany({ where: { otId: id }, orderBy: { fecha: "asc" } }),
  ]);

  return NextResponse.json({ ot, items, timeline });
}
