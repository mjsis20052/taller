import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { vozAutorizado, vozUsuario } from "@/lib/voz-auth";
import { conIdempotencia } from "@/lib/voz-idempotencia";
import { notaVoz, ORIGEN_VOZ } from "@/lib/voz-timeline";
import { validarTransicionVoz } from "@/lib/voz-estados";
import { EstadoOT } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type CuerpoEstado = {
  estadoNuevo?: string;
  updatedAt?: string;
  idempotencyKey?: string;
};

const ESTADOS_OT_VALIDOS = new Set<string>(Object.values(EstadoOT));

// Cambia el estado de una OT desde la voz. Whitelist server-side (nunca se
// confía en lo que manda el cliente, ver src/lib/voz-estados.ts) +
// concurrencia optimista con updatedAt: si otro usuario tocó la OT mientras
// tanto, 409 con el estado fresco para que el asistente relea y confirme de
// nuevo en vez de pisar nada.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!vozAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const usuario = vozUsuario(request);
  if (!usuario) {
    return NextResponse.json({ error: "Falta el header X-Voz-Usuario." }, { status: 400 });
  }

  const { id: otId } = await params;

  let cuerpo: CuerpoEstado;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const idempotencyKey = String(cuerpo.idempotencyKey ?? "").trim();
  if (!idempotencyKey) {
    return NextResponse.json({ error: "Falta idempotencyKey." }, { status: 400 });
  }

  const estadoNuevoTexto = String(cuerpo.estadoNuevo ?? "").trim();
  if (!ESTADOS_OT_VALIDOS.has(estadoNuevoTexto)) {
    return NextResponse.json({ error: "estadoNuevo no es un estado válido." }, { status: 400 });
  }
  const estadoNuevo = estadoNuevoTexto as EstadoOT;

  const updatedAtTexto = String(cuerpo.updatedAt ?? "").trim();
  if (!updatedAtTexto) {
    return NextResponse.json({ error: "Falta updatedAt." }, { status: 400 });
  }

  const respuesta = await conIdempotencia(`estado:${otId}`, idempotencyKey, async () => {
    const ot = await prisma.ordenTrabajo.findUnique({ where: { id: otId } });
    if (!ot) {
      return { status: 404, body: { error: `No existe la OT ${otId}.` } };
    }

    const validacion = validarTransicionVoz(ot.estado, estadoNuevo);
    if (!validacion.permitido) {
      return { status: 403, body: { error: validacion.motivo } };
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

    const actualizada = await prisma.ordenTrabajo.update({
      where: { id: otId },
      data: { estado: estadoNuevo },
    });

    await prisma.timelineEvento.create({
      data: {
        otId,
        estado: estadoNuevo,
        nota: notaVoz(usuario, `Cambio de estado a ${estadoNuevo}`),
        usuario,
        origen: ORIGEN_VOZ,
      },
    });

    revalidatePath(`/ots/${otId}`);
    revalidatePath("/ots");
    revalidatePath("/");

    return {
      status: 200,
      body: { otId, estado: actualizada.estado, updatedAt: actualizada.updatedAt },
    };
  });

  return NextResponse.json(respuesta.body, { status: respuesta.status });
}
