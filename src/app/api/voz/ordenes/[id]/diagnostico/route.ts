import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { vozAutorizado, vozUsuario } from "@/lib/voz-auth";
import { crearOTItem } from "@/lib/ordenes-trabajo";
import { conIdempotencia } from "@/lib/voz-idempotencia";
import { notaVoz, ORIGEN_VOZ } from "@/lib/voz-timeline";
import { debeAvanzarADiagnostico } from "@/lib/voz-estados";
import { EstadoOT, TipoOTItem } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type CuerpoDiagnostico = {
  falla?: string;
  updatedAt?: string;
  idempotencyKey?: string;
};

// Registra un diagnóstico y mueve la OT a EN_DIAGNOSTICO si todavía no
// estaba ahí (o más adelante) en la secuencia que maneja la voz (ver
// src/lib/voz-estados.ts). El diagnóstico en sí queda en el campo `falla` de
// un OTItem (mismo campo que usan los trabajos del panel para la falla
// encontrada, ver agregarTrabajoOT en ots/actions.ts): no hay un modelo
// separado para "diagnóstico suelto" y agregar uno sería más cambio de
// esquema del que hace falta — se crea un OTItem de tipo MANO_OBRA con
// precioUnitario 0 (todavía no hay solución ni precio, eso lo carga el
// mecánico después en el panel) para que quede visible en la lista de
// ítems de la OT igual que cualquier otro trabajo.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!vozAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const usuario = vozUsuario(request);
  if (!usuario) {
    return NextResponse.json({ error: "Falta el header X-Voz-Usuario." }, { status: 400 });
  }

  const { id: otId } = await params;

  let cuerpo: CuerpoDiagnostico;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const idempotencyKey = String(cuerpo.idempotencyKey ?? "").trim();
  if (!idempotencyKey) {
    return NextResponse.json({ error: "Falta idempotencyKey." }, { status: 400 });
  }

  const falla = String(cuerpo.falla ?? "").trim();
  if (!falla) {
    return NextResponse.json({ error: "Falta el diagnóstico." }, { status: 400 });
  }

  const updatedAtTexto = String(cuerpo.updatedAt ?? "").trim();
  if (!updatedAtTexto) {
    return NextResponse.json({ error: "Falta updatedAt." }, { status: 400 });
  }

  const respuesta = await conIdempotencia(`diagnostico:${otId}`, idempotencyKey, async () => {
    const ot = await prisma.ordenTrabajo.findUnique({ where: { id: otId } });
    if (!ot) {
      return { status: 404, body: { error: `No existe la OT ${otId}.` } };
    }

    if (ot.updatedAt.toISOString() !== updatedAtTexto) {
      return {
        status: 409,
        body: {
          error: "La OT cambió mientras tanto (la tocó otro usuario): releé el estado actual y volvé a confirmar.",
          estadoActual: ot.estado,
          updatedAt: ot.updatedAt,
        },
      };
    }

    const item = await crearOTItem(otId, {
      tipo: TipoOTItem.MANO_OBRA,
      descripcion: "Diagnóstico (por voz)",
      falla,
      cantidad: 1,
      precioUnitario: 0,
    });

    let otFinal = ot;
    if (debeAvanzarADiagnostico(ot.estado)) {
      otFinal = await prisma.ordenTrabajo.update({
        where: { id: otId },
        data: { estado: EstadoOT.EN_DIAGNOSTICO },
      });
    }

    await prisma.timelineEvento.create({
      data: {
        otId,
        estado: otFinal.estado,
        nota: notaVoz(usuario, `Diagnóstico: ${falla}`),
        usuario,
        origen: ORIGEN_VOZ,
      },
    });

    revalidatePath(`/ots/${otId}`);
    revalidatePath("/ots");

    return {
      status: 200,
      body: { otId, itemId: item.id, estado: otFinal.estado, updatedAt: otFinal.updatedAt },
    };
  });

  return NextResponse.json(respuesta.body, { status: respuesta.status });
}
