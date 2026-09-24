import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { vozAutorizado, vozUsuario } from "@/lib/voz-auth";
import { conIdempotencia } from "@/lib/voz-idempotencia";
import { notaVoz, ORIGEN_VOZ } from "@/lib/voz-timeline";

export const dynamic = "force-dynamic";

type CuerpoNota = {
  nota?: string;
  idempotencyKey?: string;
};

// Evento de timeline sin cambiar de estado. TimelineEvento.estado es NOT
// NULL (no hay "nota suelta" sin estado en el modelo, ver comentario en
// schema.prisma): se reusa el estado ACTUAL de la OT en el evento, igual
// que ya hace publicarNovedadOT en el panel para las novedades — no es un
// cambio de estado real, y origen="VOZ" lo distingue de uno. Por eso no
// hace falta updatedAt acá: a diferencia de /estado y /diagnostico, una
// nota no puede pisar un cambio de estado de otro usuario.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!vozAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const usuario = vozUsuario(request);
  if (!usuario) {
    return NextResponse.json({ error: "Falta el header X-Voz-Usuario." }, { status: 400 });
  }

  const { id: otId } = await params;

  let cuerpo: CuerpoNota;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const idempotencyKey = String(cuerpo.idempotencyKey ?? "").trim();
  if (!idempotencyKey) {
    return NextResponse.json({ error: "Falta idempotencyKey." }, { status: 400 });
  }

  const nota = String(cuerpo.nota ?? "").trim();
  if (!nota) {
    return NextResponse.json({ error: "Falta la nota." }, { status: 400 });
  }

  const respuesta = await conIdempotencia(`notas:${otId}`, idempotencyKey, async () => {
    const ot = await prisma.ordenTrabajo.findUnique({ where: { id: otId }, select: { estado: true } });
    if (!ot) {
      return { status: 404, body: { error: `No existe la OT ${otId}.` } };
    }

    const evento = await prisma.timelineEvento.create({
      data: {
        otId,
        estado: ot.estado,
        nota: notaVoz(usuario, nota),
        usuario,
        origen: ORIGEN_VOZ,
      },
    });

    revalidatePath(`/ots/${otId}`);

    return { status: 201, body: { eventoId: evento.id, otId } };
  });

  return NextResponse.json(respuesta.body, { status: respuesta.status });
}
