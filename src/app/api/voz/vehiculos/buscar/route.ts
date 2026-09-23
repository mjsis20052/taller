import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vozAutorizado } from "@/lib/voz-auth";
import { normalizarPatente } from "@/lib/validaciones/patente";
import { distanciaLevenshtein } from "@/lib/similaridad";

export const dynamic = "force-dynamic";

type CuerpoBusqueda = {
  patente?: string;
  marca?: string;
  modelo?: string;
  pistasIdentificacion?: string[];
};

export type CandidatoVehiculo = {
  vehiculoId: string;
  clienteId: string;
  patente: string;
  marca: string;
  modelo: string;
  anio: number | null;
  clienteNombre: string;
  clienteTelefono: string;
  exacto: boolean;
};

const INCLUIR_CLIENTE = { cliente: { select: { id: true, nombre: true, telefono: true } } } as const;

function aCandidato(v: {
  id: string;
  patente: string;
  marca: string;
  modelo: string;
  anio: number | null;
  cliente: { id: string; nombre: string; telefono: string };
}, exacto: boolean): CandidatoVehiculo {
  return {
    vehiculoId: v.id,
    clienteId: v.cliente.id,
    patente: v.patente,
    marca: v.marca,
    modelo: v.modelo,
    anio: v.anio,
    clienteNombre: v.cliente.nombre,
    clienteTelefono: v.cliente.telefono,
    exacto,
  };
}

// Busca el vehículo que menciona el audio: primero por patente exacta; si no
// hay, por parecido (la transcripción puede traer algún carácter mal) dentro
// de los que coinciden con marca/modelo si se dieron; y si no hay ni patente
// ni marca/modelo, por el nombre del dueño en pistasIdentificacion (ver
// docs/ARQUITECTURA.md del módulo taller-carga-voz).
export async function POST(request: Request) {
  if (!vozAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let cuerpo: CuerpoBusqueda;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const patente = cuerpo.patente ? normalizarPatente(cuerpo.patente) : "";
  const marca = (cuerpo.marca ?? "").trim();
  const modelo = (cuerpo.modelo ?? "").trim();

  if (patente) {
    const exacto = await prisma.vehiculo.findUnique({ where: { patente }, include: INCLUIR_CLIENTE });
    if (exacto) {
      return NextResponse.json({ candidatos: [aCandidato(exacto, true)] });
    }
  }

  // Pool de vehículos activos a comparar: si hay marca/modelo se filtra por
  // ahí (más barato y más relevante); si no, se trae un lote razonable.
  const condicionesTexto: { marca: { contains: string; mode: "insensitive" } }[] = [];
  const condicionesModelo: { modelo: { contains: string; mode: "insensitive" } }[] = [];
  if (marca) condicionesTexto.push({ marca: { contains: marca, mode: "insensitive" } });
  if (modelo) condicionesModelo.push({ modelo: { contains: modelo, mode: "insensitive" } });
  const or = [...condicionesTexto, ...condicionesModelo];

  const pool = await prisma.vehiculo.findMany({
    where: or.length > 0 ? { activo: true, OR: or } : { activo: true },
    include: INCLUIR_CLIENTE,
    orderBy: { updatedAt: "desc" },
    take: 300,
  });

  let candidatos: CandidatoVehiculo[];

  if (patente) {
    candidatos = pool
      .map((v) => ({ v, distancia: distanciaLevenshtein(patente, v.patente) }))
      .filter(({ distancia }) => distancia <= 2)
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, 5)
      .map(({ v }) => aCandidato(v, false));
  } else if (marca || modelo) {
    candidatos = pool.slice(0, 5).map((v) => aCandidato(v, false));
  } else {
    // Sin patente ni marca/modelo: la única pista posible es el dueño, si se
    // mencionó en pistasIdentificacion ("dueño: García").
    const pistaDueño = (cuerpo.pistasIdentificacion ?? [])
      .map((p) => /due[nñ]o:\s*(.+)/i.exec(p)?.[1]?.trim())
      .find((nombre): nombre is string => Boolean(nombre));

    if (!pistaDueño) return NextResponse.json({ candidatos: [] });

    const porDueño = await prisma.vehiculo.findMany({
      where: { activo: true, cliente: { nombre: { contains: pistaDueño, mode: "insensitive" } } },
      include: INCLUIR_CLIENTE,
      orderBy: { updatedAt: "desc" },
      take: 5,
    });
    candidatos = porDueño.map((v) => aCandidato(v, false));
  }

  return NextResponse.json({ candidatos });
}
