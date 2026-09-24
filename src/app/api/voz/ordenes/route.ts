import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { vozAutorizado, vozUsuario } from "@/lib/voz-auth";
import { crearOTDesdeDatos, recalcularTotalesOT } from "@/lib/ordenes-trabajo";
import { normalizarPatente } from "@/lib/validaciones/patente";
import { normalizarTelefono } from "@/lib/validaciones/telefono";
import { EstadoOT, TipoOTItem, type NivelCombustible } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const NIVELES_VALIDOS = new Set(["VACIO", "UN_CUARTO", "MEDIO", "TRES_CUARTOS", "LLENO"]);

type ItemEntrada = {
  tipo: "MANO_OBRA" | "REPUESTO";
  descripcion: string;
  falla?: string | null;
  cantidad: number;
  precioUnitario: number;
  aPedir?: boolean;
};

type CuerpoOrden = {
  borradorId: string;
  vehiculoId?: string;
  clienteId?: string;
  vehiculo?: { patente?: string | null; marca?: string | null; modelo?: string | null; anio?: number | null; nivelCombustible?: string | null };
  cliente?: { nombre?: string | null; telefono?: string | null };
  motivo?: string | null;
  kmIngreso?: number | null;
  estadoInicial?: "INGRESADO" | "EN_DIAGNOSTICO";
  items?: ItemEntrada[];
  origen?: string;
};

function respuestaOT(ot: { id: string; numero: string }, creada: boolean) {
  return NextResponse.json({ otId: ot.id, numero: ot.numero, url: `/ots/${ot.id}`, creada });
}

// Lista de OTs "en reparación" para la pantalla del asistente de voz
// (botón "Vehículos en reparación") — no confundir con GET /ordenes/:id,
// que trae el detalle de UNA. "Abierta" = no ENTREGADO ni CANCELADA, mismo
// criterio que ya usa GET /vehiculos/:id para "otsAbiertas".
export async function GET(request: Request) {
  if (!vozAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!vozUsuario(request)) {
    return NextResponse.json({ error: "Falta el header X-Voz-Usuario." }, { status: 400 });
  }

  const ordenes = await prisma.ordenTrabajo.findMany({
    where: { estado: { notIn: [EstadoOT.ENTREGADO, EstadoOT.CANCELADA] } },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      numero: true,
      estado: true,
      motivo: true,
      updatedAt: true,
      vehiculo: { select: { id: true, patente: true, marca: true, modelo: true } },
      cliente: { select: { id: true, nombre: true } },
    },
  });

  return NextResponse.json({
    ordenes: ordenes.map((ot) => ({
      otId: ot.id,
      numero: ot.numero,
      estado: ot.estado,
      motivo: ot.motivo,
      updatedAt: ot.updatedAt,
      vehiculoId: ot.vehiculo.id,
      patente: ot.vehiculo.patente,
      marca: ot.vehiculo.marca,
      modelo: ot.vehiculo.modelo,
      clienteId: ot.cliente.id,
      clienteNombre: ot.cliente.nombre,
    })),
  });
}

// Crea la OT que armó el módulo de carga por voz (o, si `borradorId` ya se
// procesó antes, devuelve la que ya existe: ver la columna
// OrdenTrabajo.origenBorradorVozId y docs/ARQUITECTURA.md del otro repo).
export async function POST(request: Request) {
  if (!vozAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let cuerpo: CuerpoOrden;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const borradorId = String(cuerpo.borradorId ?? "").trim();
  if (!borradorId) {
    return NextResponse.json({ error: "Falta borradorId." }, { status: 400 });
  }

  // Idempotencia (chequeo rápido; la garantía real es el índice único de la
  // columna, ver el catch de P2002 más abajo).
  const existente = await prisma.ordenTrabajo.findUnique({
    where: { origenBorradorVozId: borradorId },
    select: { id: true, numero: true },
  });
  if (existente) return respuestaOT(existente, false);

  // Resolver vehículo/cliente: por id ya elegido, por patente exacta, o nuevo.
  let vehiculoId: string | null = null;
  let clienteId: string | null = null;
  let clienteNuevo: { nombre: string; telefono: string } | null = null;
  let vehiculoNuevo: { patente: string; marca: string; modelo: string } | null = null;

  if (cuerpo.vehiculoId) {
    const vehiculo = await prisma.vehiculo.findUnique({ where: { id: cuerpo.vehiculoId }, select: { id: true, clienteId: true } });
    if (!vehiculo) return NextResponse.json({ error: `No existe el vehículo ${cuerpo.vehiculoId}.` }, { status: 400 });
    vehiculoId = vehiculo.id;
    clienteId = vehiculo.clienteId;
  } else {
    const patente = cuerpo.vehiculo?.patente ? normalizarPatente(cuerpo.vehiculo.patente) : "";
    const existenteExacto = patente ? await prisma.vehiculo.findUnique({ where: { patente }, select: { id: true, clienteId: true } }) : null;
    if (existenteExacto) {
      vehiculoId = existenteExacto.id;
      clienteId = existenteExacto.clienteId;
    } else {
      const marca = (cuerpo.vehiculo?.marca ?? "").trim();
      const modelo = (cuerpo.vehiculo?.modelo ?? "").trim();
      if (!marca || !modelo) {
        return NextResponse.json({ error: "Vehículo nuevo: faltan marca y modelo." }, { status: 400 });
      }
      // Sin patente conocida (ej: "no sé la patente"): se genera un placeholder
      // único y reconocible; el mecánico la corrige después desde la ficha del
      // vehículo cuando la vea.
      vehiculoNuevo = { patente: patente || `SINPAT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, marca, modelo };

      if (cuerpo.clienteId) {
        clienteId = cuerpo.clienteId;
      } else {
        const nombre = (cuerpo.cliente?.nombre ?? "").trim();
        const telefono = normalizarTelefono(cuerpo.cliente?.telefono ?? "");
        if (!nombre || !telefono) {
          return NextResponse.json({ error: "Cliente nuevo: faltan nombre y teléfono." }, { status: 400 });
        }
        clienteNuevo = { nombre, telefono };
      }
    }
  }

  const nivelCombustibleTexto = cuerpo.vehiculo?.nivelCombustible ?? null;
  const nivelCombustible: NivelCombustible | null =
    nivelCombustibleTexto && NIVELES_VALIDOS.has(nivelCombustibleTexto) ? (nivelCombustibleTexto as NivelCombustible) : null;

  const estado = cuerpo.estadoInicial === "EN_DIAGNOSTICO" ? EstadoOT.EN_DIAGNOSTICO : EstadoOT.INGRESADO;

  let creada: { otId: string; numero: string };
  try {
    const resultado = await crearOTDesdeDatos({
      clienteId,
      clienteNuevo,
      vehiculoId,
      vehiculoNuevo,
      estado,
      motivo: cuerpo.motivo ?? null,
      kmIngreso: cuerpo.kmIngreso ?? null,
      nivelCombustible,
      origenBorradorVozId: borradorId,
      notaTimeline: "Creada por carga de voz",
    });
    creada = resultado;
  } catch (error) {
    // Carrera: dos pedidos con el mismo borradorId llegaron casi juntos y el
    // índice único de la columna frenó al segundo. Se devuelve la que ganó.
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002") {
      const ganadora = await prisma.ordenTrabajo.findUnique({
        where: { origenBorradorVozId: borradorId },
        select: { id: true, numero: true },
      });
      if (ganadora) return respuestaOT(ganadora, false);
    }
    throw error;
  }

  const items = (cuerpo.items ?? []).filter((i) => i.descripcion?.trim() && i.cantidad > 0 && i.precioUnitario >= 0);
  if (items.length > 0) {
    await prisma.$transaction(async (tx) => {
      await tx.oTItem.createMany({
        data: items.map((item) => ({
          otId: creada.otId,
          tipo: item.tipo === "REPUESTO" ? TipoOTItem.REPUESTO : TipoOTItem.MANO_OBRA,
          descripcion: item.descripcion.trim(),
          falla: item.falla?.trim() || null,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          aPedir: Boolean(item.aPedir),
          estadoPedido: item.aPedir ? "A_PEDIR" : "NO",
        })),
      });
      await recalcularTotalesOT(creada.otId, tx);
    });
  }

  revalidatePath("/ots");
  revalidatePath("/");
  revalidatePath("/agenda");

  return respuestaOT({ id: creada.otId, numero: creada.numero }, true);
}
