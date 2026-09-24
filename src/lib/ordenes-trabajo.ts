import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { EstadoOT, EstadoTurno, TipoOTItem, type NivelCombustible } from "@/generated/prisma/enums";

export async function siguienteNumeroOT(
  tx: Prisma.TransactionClient = prisma,
): Promise<string> {
  const ultima = await tx.ordenTrabajo.findFirst({
    orderBy: { numero: "desc" },
    select: { numero: true },
  });

  const ultimoNumero = ultima ? Number(ultima.numero.replace("OT-", "")) : 0;
  return `OT-${String(ultimoNumero + 1).padStart(4, "0")}`;
}

export type DatosNuevoCliente = { nombre: string; telefono: string };
export type DatosNuevoVehiculo = { patente: string; marca: string; modelo: string };

export type DatosCrearOT = {
  clienteId: string | null;
  clienteNuevo: DatosNuevoCliente | null;
  vehiculoId: string | null;
  vehiculoNuevo: DatosNuevoVehiculo | null;
  // Default INGRESADO. Lo usa el módulo de carga por voz para crear directo en
  // EN_DIAGNOSTICO cuando el audio ya trae un diagnóstico.
  estado?: EstadoOT;
  motivo?: string | null;
  kmIngreso?: number | null;
  nivelCombustible?: NivelCombustible | null;
  turnoIdOpcional?: string | null;
  // Id del borrador de voz que originó esta OT (idempotencia: ver schema.prisma).
  origenBorradorVozId?: string | null;
  // Default "Recepción del vehículo" (el texto que ya usaba el formulario normal).
  notaTimeline?: string;
};

// Crea (o reusa) cliente y vehículo, arma la OT, el evento de timeline y el
// registro de kilometraje. Lo usan tanto el formulario de recepción
// (ots/actions.ts:crearOT, con FormData y validación propia) como el endpoint
// de carga por voz (api/voz/ordenes) — para no duplicar esta lógica en los dos
// lugares. Quien llama valida antes: acá se asume que si no viene clienteId
// viene clienteNuevo completo, e idem con vehiculoId/vehiculoNuevo.
export async function crearOTDesdeDatos(datos: DatosCrearOT): Promise<{ otId: string; numero: string }> {
  return prisma.$transaction(async (tx) => {
    let clienteId = datos.clienteId;
    if (!clienteId) {
      if (!datos.clienteNuevo) throw new Error("crearOTDesdeDatos: falta clienteId o clienteNuevo.");
      const existente = await tx.cliente.findFirst({ where: { telefono: datos.clienteNuevo.telefono } });
      const cliente =
        existente ??
        (await tx.cliente.create({
          data: {
            nombre: datos.clienteNuevo.nombre,
            telefono: datos.clienteNuevo.telefono,
            tipoPersona: "FISICA",
            condicionFiscal: "CONSUMIDOR_FINAL",
          },
        }));
      clienteId = cliente.id;
    }

    let vehiculoId = datos.vehiculoId;
    if (!vehiculoId) {
      if (!datos.vehiculoNuevo) throw new Error("crearOTDesdeDatos: falta vehiculoId o vehiculoNuevo.");
      const vehiculo = await tx.vehiculo.create({
        data: {
          clienteId,
          patente: datos.vehiculoNuevo.patente,
          marca: datos.vehiculoNuevo.marca,
          modelo: datos.vehiculoNuevo.modelo,
        },
      });
      vehiculoId = vehiculo.id;
    }

    const numero = await siguienteNumeroOT(tx);
    const estado = datos.estado ?? EstadoOT.INGRESADO;

    const ot = await tx.ordenTrabajo.create({
      data: {
        numero,
        clienteId,
        vehiculoId,
        estado,
        motivo: datos.motivo ?? undefined,
        kmIngreso: datos.kmIngreso ?? undefined,
        nivelCombustible: datos.nivelCombustible ?? undefined,
        origenBorradorVozId: datos.origenBorradorVozId ?? undefined,
      },
    });

    await tx.timelineEvento.create({
      data: { otId: ot.id, estado, nota: datos.notaTimeline ?? "Recepción del vehículo" },
    });

    if (datos.kmIngreso != null) {
      await tx.kilometrajeRegistro.create({
        data: { vehiculoId, km: datos.kmIngreso, otId: ot.id },
      });
    }

    if (datos.turnoIdOpcional) {
      await tx.turno.update({
        where: { id: datos.turnoIdOpcional },
        data: { estado: EstadoTurno.CONVERTIDO_OT, otId: ot.id },
      });
    }

    return { otId: ot.id, numero: ot.numero };
  });
}

export async function recalcularTotalesOT(otId: string, tx: Prisma.TransactionClient = prisma) {
  const items = await tx.oTItem.findMany({ where: { otId } });

  const totalRepuestos = items
    .filter((i) => i.tipo === "REPUESTO")
    .reduce((acc, i) => acc + Number(i.cantidad) * Number(i.precioUnitario), 0);
  const totalManoObra = items
    .filter((i) => i.tipo === "MANO_OBRA")
    .reduce((acc, i) => acc + Number(i.cantidad) * Number(i.precioUnitario), 0);

  await tx.ordenTrabajo.update({
    where: { id: otId },
    data: {
      totalRepuestos,
      totalManoObra,
      total: totalRepuestos + totalManoObra,
    },
  });
}

export type DatosOTItem = {
  tipo: TipoOTItem;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  falla?: string | null;
  // Repuestos del inventario: descuenta stock. No aplica a mano de obra ni a
  // repuestos libres/nuevos (sin id de stock).
  repuestoId?: string | null;
  aPedir?: boolean;
  notaPedido?: string | null;
};

// Crea un ítem de OT (trabajo o repuesto) y recalcula los totales, en una
// transacción; si el repuesto viene del inventario, descuenta stock y deja
// el movimiento. Lo usan tanto las Server Actions del panel
// (ots/actions.ts: agregarTrabajoOT, agregarRepuestoOT, con FormData y
// validación propia) como el endpoint de voz (api/voz/ordenes/:id/items) —
// para no duplicar esta lógica en los dos lugares, mismo patrón que
// crearOTDesdeDatos. Quien llama valida antes: acá se asume que descripcion,
// cantidad y precioUnitario ya son válidos.
export async function crearOTItem(otId: string, datos: DatosOTItem) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.oTItem.create({
      data: {
        otId,
        tipo: datos.tipo,
        descripcion: datos.descripcion,
        falla: datos.falla ?? null,
        cantidad: datos.cantidad,
        precioUnitario: datos.precioUnitario,
        repuestoId: datos.repuestoId ?? null,
        aPedir: Boolean(datos.aPedir),
        estadoPedido: datos.aPedir ? "A_PEDIR" : "NO",
        notaPedido: datos.aPedir || datos.notaPedido ? (datos.notaPedido ?? null) : null,
      },
    });

    await recalcularTotalesOT(otId, tx);

    if (datos.repuestoId) {
      const cantidadStock = Math.round(datos.cantidad);
      await tx.movimientoStock.create({
        data: { repuestoId: datos.repuestoId, tipo: "SALIDA", cantidad: cantidadStock, otId },
      });
      await tx.repuesto.update({
        where: { id: datos.repuestoId },
        data: { stock: { decrement: cantidadStock } },
      });
    }

    return item;
  });
}
