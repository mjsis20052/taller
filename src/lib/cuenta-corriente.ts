import { prisma } from "@/lib/prisma";
import { EstadoOT } from "@/generated/prisma/enums";
import { montoFirmado } from "@/lib/formato";

// Cuenta corriente de un cliente = todo lo que se le cargó en sus OT (desde que
// ingresa el vehículo, sin contar turnos ni canceladas) menos lo que pagó.
// Los trabajos en curso ya suman: a medida que se cargan trabajos y repuestos
// sube lo que el cliente debe.
const ESTADOS_FUERA = [EstadoOT.TURNO_AGENDADO, EstadoOT.CANCELADA];
const ESTADOS_TERMINADOS: string[] = [EstadoOT.TERMINADO, EstadoOT.FACTURADO, EstadoOT.ENTREGADO];

export type OTCuenta = {
  id: string;
  numero: string;
  estado: string;
  fecha: Date;
  total: number;
  pagado: number;
  saldo: number;
  enCurso: boolean;
};

export type MovimientoCuenta = {
  id: string;
  fecha: Date;
  monto: number; // firmado: negativo si es una devolución
  concepto: string;
  metodo: string | null;
  notas: string | null;
  otId: string | null;
  otNumero: string | null;
};

export type CuentaCliente = {
  clienteId: string;
  totalOTs: number;
  totalTerminado: number;
  totalEnCurso: number;
  cobrado: number;
  saldo: number; // > 0 debe, < 0 tiene saldo a favor
  ots: OTCuenta[];
  pendientes: OTCuenta[];
  movimientos: MovimientoCuenta[];
};

type OTConCobros = {
  id: string;
  numero: string;
  estado: string;
  createdAt: Date;
  total: unknown;
  cobros: { monto: unknown; concepto: string }[];
};

function armarOT(ot: OTConCobros): OTCuenta {
  const total = Number(ot.total);
  const pagado = ot.cobros.reduce((acc, c) => acc + montoFirmado({ monto: Number(c.monto), concepto: c.concepto }), 0);
  return {
    id: ot.id,
    numero: ot.numero,
    estado: ot.estado,
    fecha: ot.createdAt,
    total,
    pagado,
    saldo: total - pagado,
    enCurso: !ESTADOS_TERMINADOS.includes(ot.estado),
  };
}

export async function cuentaCliente(clienteId: string): Promise<CuentaCliente> {
  const [ots, cobros] = await Promise.all([
    prisma.ordenTrabajo.findMany({
      where: { clienteId, estado: { notIn: ESTADOS_FUERA } },
      select: {
        id: true,
        numero: true,
        estado: true,
        createdAt: true,
        total: true,
        cobros: { select: { monto: true, concepto: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.cobro.findMany({
      where: { clienteId },
      include: { ot: { select: { numero: true } } },
      orderBy: { fecha: "desc" },
    }),
  ]);

  const otsCuenta = ots.map(armarOT);
  const totalOTs = otsCuenta.reduce((acc, o) => acc + o.total, 0);
  const cobrado = cobros.reduce((acc, c) => acc + montoFirmado(c), 0);

  return {
    clienteId,
    totalOTs,
    totalTerminado: otsCuenta.filter((o) => !o.enCurso).reduce((acc, o) => acc + o.total, 0),
    totalEnCurso: otsCuenta.filter((o) => o.enCurso).reduce((acc, o) => acc + o.total, 0),
    cobrado,
    saldo: totalOTs - cobrado,
    ots: otsCuenta,
    pendientes: otsCuenta.filter((o) => o.saldo > 0),
    movimientos: cobros.map((c) => ({
      id: c.id,
      fecha: c.fecha,
      monto: montoFirmado(c),
      concepto: c.concepto,
      metodo: c.metodo,
      notas: c.notas,
      otId: c.otId,
      otNumero: c.ot?.numero ?? null,
    })),
  };
}

export async function saldoCliente(clienteId: string): Promise<number> {
  return (await cuentaCliente(clienteId)).saldo;
}

export type FilaCuenta = {
  id: string;
  nombre: string;
  telefono: string;
  saldo: number;
  enCurso: number;
  terminado: number;
  cobrado: number;
  pendientes: { id: string; numero: string; saldo: number }[];
};

// Todos los clientes con OT, con su saldo (para Cobranzas).
export async function listarCuentas(): Promise<FilaCuenta[]> {
  const [ots, cobros] = await Promise.all([
    prisma.ordenTrabajo.findMany({
      where: { estado: { notIn: ESTADOS_FUERA }, cliente: { activo: true } },
      select: {
        id: true,
        numero: true,
        estado: true,
        createdAt: true,
        total: true,
        clienteId: true,
        cliente: { select: { nombre: true, telefono: true } },
        cobros: { select: { monto: true, concepto: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.cobro.groupBy({ by: ["clienteId", "concepto"], _sum: { monto: true } }),
  ]);

  const cobradoPorCliente = new Map<string, number>();
  for (const c of cobros) {
    cobradoPorCliente.set(
      c.clienteId,
      (cobradoPorCliente.get(c.clienteId) ?? 0) + montoFirmado({ monto: Number(c._sum.monto ?? 0), concepto: c.concepto }),
    );
  }

  const porCliente = new Map<string, FilaCuenta>();
  for (const ot of ots) {
    const cuenta = armarOT(ot);
    const fila: FilaCuenta = porCliente.get(ot.clienteId) ?? {
      id: ot.clienteId,
      nombre: ot.cliente.nombre,
      telefono: ot.cliente.telefono,
      saldo: 0,
      enCurso: 0,
      terminado: 0,
      cobrado: cobradoPorCliente.get(ot.clienteId) ?? 0,
      pendientes: [],
    };
    if (cuenta.enCurso) fila.enCurso += cuenta.total;
    else fila.terminado += cuenta.total;
    if (cuenta.saldo > 0) fila.pendientes.push({ id: cuenta.id, numero: cuenta.numero, saldo: cuenta.saldo });
    porCliente.set(ot.clienteId, fila);
  }

  for (const fila of porCliente.values()) fila.saldo = fila.enCurso + fila.terminado - fila.cobrado;
  return [...porCliente.values()].sort((a, b) => b.saldo - a.saldo);
}

export async function listarDeudores() {
  return (await listarCuentas()).filter((c) => c.saldo > 0).map((c) => ({ ...c, deuda: c.saldo }));
}

// Cantidad y total por cobrar, con sumas agrupadas en la base (liviano para la campanita y Caja).
export async function resumenDeuda(): Promise<{ cantidad: number; total: number }> {
  const [ots, cobros] = await Promise.all([
    prisma.ordenTrabajo.groupBy({
      by: ["clienteId"],
      where: { estado: { notIn: ESTADOS_FUERA }, cliente: { activo: true } },
      _sum: { total: true },
    }),
    prisma.cobro.groupBy({ by: ["clienteId", "concepto"], _sum: { monto: true } }),
  ]);
  const cobrado = new Map<string, number>();
  for (const c of cobros) {
    cobrado.set(
      c.clienteId,
      (cobrado.get(c.clienteId) ?? 0) + montoFirmado({ monto: Number(c._sum.monto ?? 0), concepto: c.concepto }),
    );
  }
  let cantidad = 0;
  let total = 0;
  for (const o of ots) {
    const saldo = Number(o._sum.total ?? 0) - (cobrado.get(o.clienteId) ?? 0);
    if (saldo > 0) {
      cantidad += 1;
      total += saldo;
    }
  }
  return { cantidad, total };
}

export async function contarDeudores(): Promise<number> {
  return (await resumenDeuda()).cantidad;
}

export type DeudorDetalle = {
  id: string;
  nombre: string;
  telefono: string;
  saldo: number;
  pagado: number;
  ots: {
    id: string;
    numero: string;
    estado: string;
    vehiculo: string;
    total: number;
    saldo: number;
    items: { id: string; descripcion: string; tipo: string; cantidad: number; subtotal: number }[];
  }[];
};

// Clientes que deben, con todo lo que se les cargó (trabajos y repuestos por OT) y sus datos.
export async function listarDeudoresConDetalle(): Promise<DeudorDetalle[]> {
  const [ots, cobros] = await Promise.all([
    prisma.ordenTrabajo.findMany({
      where: { estado: { notIn: ESTADOS_FUERA }, cliente: { activo: true } },
      select: {
        id: true,
        numero: true,
        estado: true,
        createdAt: true,
        total: true,
        clienteId: true,
        cliente: { select: { nombre: true, telefono: true } },
        vehiculo: { select: { patente: true, marca: true, modelo: true } },
        cobros: { select: { monto: true, concepto: true } },
        items: {
          select: { id: true, descripcion: true, tipo: true, cantidad: true, precioUnitario: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.cobro.groupBy({ by: ["clienteId", "concepto"], _sum: { monto: true } }),
  ]);

  const cobradoPorCliente = new Map<string, number>();
  for (const c of cobros) {
    cobradoPorCliente.set(
      c.clienteId,
      (cobradoPorCliente.get(c.clienteId) ?? 0) + montoFirmado({ monto: Number(c._sum.monto ?? 0), concepto: c.concepto }),
    );
  }

  const porCliente = new Map<string, DeudorDetalle>();
  for (const ot of ots) {
    const cuenta = armarOT(ot);
    const deudor: DeudorDetalle = porCliente.get(ot.clienteId) ?? {
      id: ot.clienteId,
      nombre: ot.cliente.nombre,
      telefono: ot.cliente.telefono,
      saldo: 0,
      pagado: cobradoPorCliente.get(ot.clienteId) ?? 0,
      ots: [],
    };
    deudor.saldo += cuenta.total;
    deudor.ots.push({
      id: ot.id,
      numero: ot.numero,
      estado: ot.estado,
      vehiculo: `${ot.vehiculo.marca} ${ot.vehiculo.modelo} · ${ot.vehiculo.patente}`,
      total: cuenta.total,
      saldo: cuenta.saldo,
      items: ot.items.map((i) => ({
        id: i.id,
        descripcion: i.descripcion,
        tipo: i.tipo,
        cantidad: Number(i.cantidad),
        subtotal: Number(i.cantidad) * Number(i.precioUnitario),
      })),
    });
    porCliente.set(ot.clienteId, deudor);
  }

  for (const d of porCliente.values()) d.saldo -= d.pagado;
  return [...porCliente.values()].filter((d) => d.saldo > 0).sort((a, b) => b.saldo - a.saldo);
}
