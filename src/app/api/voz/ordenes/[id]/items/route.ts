import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { vozAutorizado, vozUsuario } from "@/lib/voz-auth";
import { crearOTItem } from "@/lib/ordenes-trabajo";
import { conIdempotencia } from "@/lib/voz-idempotencia";
import { notaVoz, ORIGEN_VOZ } from "@/lib/voz-timeline";
import { TipoOTItem } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type CuerpoItem = {
  tipo?: string;
  descripcion?: string;
  cantidad?: number;
  falla?: string | null;
  idempotencyKey?: string;
  // precioUnitario: si viene, se ignora a propósito (ver abajo). El dueño
  // cotiza en el panel, nunca la voz.
};

// Agrega un ítem (trabajo o repuesto) a una OT existente. Reusa crearOTItem
// (src/lib/ordenes-trabajo.ts), la misma función que usan agregarTrabajoOT y
// agregarRepuestoOT del panel — no se duplica la lógica de negocio acá.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!vozAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const usuario = vozUsuario(request);
  if (!usuario) {
    return NextResponse.json({ error: "Falta el header X-Voz-Usuario." }, { status: 400 });
  }

  const { id: otId } = await params;

  let cuerpo: CuerpoItem;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const idempotencyKey = String(cuerpo.idempotencyKey ?? "").trim();
  if (!idempotencyKey) {
    return NextResponse.json({ error: "Falta idempotencyKey." }, { status: 400 });
  }

  const tipo =
    cuerpo.tipo === "REPUESTO" ? TipoOTItem.REPUESTO : cuerpo.tipo === "MANO_OBRA" ? TipoOTItem.MANO_OBRA : null;
  if (!tipo) {
    return NextResponse.json({ error: "tipo tiene que ser REPUESTO o MANO_OBRA." }, { status: 400 });
  }

  const descripcion = String(cuerpo.descripcion ?? "").trim();
  if (!descripcion) {
    return NextResponse.json({ error: "Falta la descripción del ítem." }, { status: 400 });
  }

  const cantidad = Number(cuerpo.cantidad);
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return NextResponse.json({ error: "La cantidad tiene que ser mayor a 0." }, { status: 400 });
  }

  const falla = cuerpo.falla ? String(cuerpo.falla).trim() || null : null;

  const respuesta = await conIdempotencia(`items:${otId}`, idempotencyKey, async () => {
    const ot = await prisma.ordenTrabajo.findUnique({ where: { id: otId }, select: { id: true, estado: true } });
    if (!ot) {
      return { status: 404, body: { error: `No existe la OT ${otId}.` } };
    }

    // precioUnitario SIEMPRE 0 acá: cualquier precio que haya mandado el
    // cliente ya quedó ignorado arriba, ni se lee del cuerpo.
    const item = await crearOTItem(otId, {
      tipo,
      descripcion,
      cantidad,
      precioUnitario: 0,
      falla,
    });

    await prisma.timelineEvento.create({
      data: {
        otId,
        estado: ot.estado,
        nota: notaVoz(usuario, `Agregó ${tipo === "REPUESTO" ? "repuesto" : "trabajo"}: ${descripcion}`),
        usuario,
        origen: ORIGEN_VOZ,
      },
    });

    revalidatePath(`/ots/${otId}`);

    return {
      status: 201,
      body: { itemId: item.id, otId, tipo: item.tipo, descripcion: item.descripcion, cantidad: Number(item.cantidad) },
    };
  });

  return NextResponse.json(respuesta.body, { status: respuesta.status });
}
