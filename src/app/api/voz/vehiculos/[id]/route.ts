import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vozAutorizado, vozUsuario } from "@/lib/voz-auth";
import { EstadoOT } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

// Ficha rápida de un vehículo para que el asistente arranque la charla: sus
// datos, el cliente dueño, las OT que todavía tiene abiertas (para preguntar
// "¿seguimos con la que ya está?" en vez de abrir una nueva) y las últimas
// visitas (abiertas o cerradas) para dar contexto de historial.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!vozAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!vozUsuario(request)) {
    return NextResponse.json({ error: "Falta el header X-Voz-Usuario." }, { status: 400 });
  }

  const { id } = await params;

  const vehiculo = await prisma.vehiculo.findUnique({
    where: { id },
    include: { cliente: { select: { id: true, nombre: true, telefono: true } } },
  });
  if (!vehiculo) {
    return NextResponse.json({ error: `No existe el vehículo ${id}.` }, { status: 404 });
  }

  const [otsAbiertas, ultimasVisitas] = await Promise.all([
    prisma.ordenTrabajo.findMany({
      where: { vehiculoId: id, estado: { notIn: [EstadoOT.ENTREGADO, EstadoOT.CANCELADA] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, numero: true, estado: true, motivo: true },
    }),
    prisma.ordenTrabajo.findMany({
      where: { vehiculoId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { createdAt: true, motivo: true, estado: true },
    }),
  ]);

  return NextResponse.json({
    vehiculo: {
      id: vehiculo.id,
      patente: vehiculo.patente,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      anio: vehiculo.anio,
      color: vehiculo.color,
    },
    cliente: {
      id: vehiculo.cliente.id,
      nombre: vehiculo.cliente.nombre,
      telefono: vehiculo.cliente.telefono,
    },
    otsAbiertas: otsAbiertas.map((ot) => ({ id: ot.id, numero: ot.numero, estado: ot.estado, motivo: ot.motivo })),
    ultimasVisitas: ultimasVisitas.map((ot) => ({ fecha: ot.createdAt, motivo: ot.motivo, estado: ot.estado })),
  });
}
