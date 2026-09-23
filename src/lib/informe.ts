import { prisma } from "@/lib/prisma";
import { EstadoOT } from "@/generated/prisma/enums";
import { montoFirmado } from "@/lib/formato";
import { obtenerDatosCobro, type DatosCobro } from "@/lib/datos-cobro";

// Datos de los informes que se comparten con el cliente. Se leen por el enlace secreto
// (token) y solo llevan lo que le corresponde al propio cliente: nunca teléfono ni documentos.

export type ItemInforme = {
  id: string;
  tipo: "MANO_OBRA" | "REPUESTO";
  descripcion: string;
  falla: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  estadoPedido: string;
};

export type NovedadInforme = { id: string; fecha: Date; estado: string; nota: string | null };

export type FotoInforme = { id: string; url: string };

export type PresupuestoInforme = {
  id: string;
  total: number;
  validezDias: number;
  enviadoAt: Date | null;
  items: { tipo: string; descripcion: string; falla: string | null; cantidad: number; precioUnitario: number }[];
};

export type InformeOT = {
  token: string;
  numero: string;
  estado: string;
  fecha: Date;
  cerradaAt: Date | null;
  motivo: string | null;
  motivoCancelacion: string | null;
  cliente: string;
  vehiculo: { patente: string; marca: string; modelo: string };
  trabajos: ItemInforme[];
  repuestos: ItemInforme[];
  total: number;
  pagado: number;
  saldo: number;
  novedades: NovedadInforme[];
  fotos: FotoInforme[];
  // Presupuesto enviado que el cliente todavía tiene que aprobar o rechazar.
  presupuestoPorAprobar: PresupuestoInforme | null;
  cobro: DatosCobro;
};

function armarItem(i: {
  id: string;
  tipo: string;
  descripcion: string;
  falla: string | null;
  cantidad: unknown;
  precioUnitario: unknown;
  estadoPedido: string;
}): ItemInforme {
  const cantidad = Number(i.cantidad);
  const precioUnitario = Number(i.precioUnitario);
  return {
    id: i.id,
    tipo: i.tipo as ItemInforme["tipo"],
    descripcion: i.descripcion,
    falla: i.falla,
    cantidad,
    precioUnitario,
    subtotal: cantidad * precioUnitario,
    estadoPedido: i.estadoPedido,
  };
}

const INCLUIR_OT = {
  cliente: { select: { nombre: true } },
  vehiculo: { select: { patente: true, marca: true, modelo: true } },
  items: { orderBy: { createdAt: "asc" as const } },
  cobros: { select: { monto: true, concepto: true } },
  timeline: { orderBy: { fecha: "desc" as const } },
  fotos: { select: { id: true }, orderBy: { fechaTomada: "asc" as const } },
  presupuestos: { orderBy: { createdAt: "desc" as const }, take: 1 },
};

type OTConDatos = NonNullable<Awaited<ReturnType<typeof buscarOT>>>;

function buscarOT(where: { tokenInforme: string }) {
  return prisma.ordenTrabajo.findUnique({ where, include: INCLUIR_OT });
}

function armarInforme(ot: OTConDatos, cobro: DatosCobro): InformeOT {
  const items = ot.items.map(armarItem);
  const pagado = ot.cobros.reduce((acc, c) => acc + montoFirmado(c), 0);
  const total = Number(ot.total);
  const ultimo = ot.presupuestos[0];
  const presupuestoPorAprobar: PresupuestoInforme | null =
    ultimo && ultimo.estado === "ENVIADO" && ot.estado === EstadoOT.PRESUPUESTADO
      ? {
          id: ultimo.id,
          total: Number(ultimo.total),
          validezDias: ultimo.validezDias,
          enviadoAt: ultimo.enviadoAt,
          items: (ultimo.itemsSnapshot as PresupuestoInforme["items"]) ?? [],
        }
      : null;
  return {
    token: ot.tokenInforme,
    numero: ot.numero,
    estado: ot.estado,
    fecha: ot.createdAt,
    cerradaAt: ot.cerradaAt,
    motivo: ot.motivo,
    motivoCancelacion: ot.motivoCancelacion,
    cliente: ot.cliente.nombre,
    vehiculo: ot.vehiculo,
    trabajos: items.filter((i) => i.tipo === "MANO_OBRA"),
    repuestos: items.filter((i) => i.tipo === "REPUESTO"),
    total,
    pagado,
    saldo: total - pagado,
    novedades: ot.timeline.map((t) => ({ id: t.id, fecha: t.fecha, estado: t.estado, nota: t.nota })),
    fotos: ot.fotos.map((f) => ({ id: f.id, url: `/informe/foto/${ot.tokenInforme}/${f.id}` })),
    presupuestoPorAprobar,
    cobro,
  };
}

export async function cargarInformeOT(token: string): Promise<InformeOT | null> {
  if (!/^[a-f0-9]{32}$/.test(token)) return null;
  const ot = await buscarOT({ tokenInforme: token });
  if (!ot || ot.estado === EstadoOT.TURNO_AGENDADO) return null;
  return armarInforme(ot, await obtenerDatosCobro());
}

export type InformeCliente = {
  token: string;
  nombre: string;
  ots: InformeOT[];
  total: number;
  pagado: number;
  saldo: number;
  cobro: DatosCobro;
};

export async function cargarInformeCliente(token: string): Promise<InformeCliente | null> {
  if (!/^[a-f0-9]{32}$/.test(token)) return null;
  const cliente = await prisma.cliente.findUnique({
    where: { tokenInforme: token },
    select: {
      nombre: true,
      tokenInforme: true,
      ordenesTrabajo: {
        where: { estado: { notIn: [EstadoOT.TURNO_AGENDADO, EstadoOT.CANCELADA] } },
        include: INCLUIR_OT,
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!cliente) return null;

  const cobro = await obtenerDatosCobro();
  const ots = cliente.ordenesTrabajo.map((ot) => armarInforme(ot as OTConDatos, cobro));
  const total = ots.reduce((acc, o) => acc + o.total, 0);
  const pagado = ots.reduce((acc, o) => acc + o.pagado, 0);
  return { token: cliente.tokenInforme, nombre: cliente.nombre, ots, total, pagado, saldo: total - pagado, cobro };
}
