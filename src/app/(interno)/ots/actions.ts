"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { recalcularTotalesOT, siguienteNumeroOT } from "@/lib/ordenes-trabajo";
import { normalizarPatente } from "@/lib/validaciones/patente";
import { normalizarTelefono } from "@/lib/validaciones/telefono";
import { ESTADOS_PEDIDO, type EstadoPedido } from "@/lib/pedidos";
import { storageAdapter } from "@/lib/storage/local-adapter";
import {
  EntidadFoto,
  EstadoOT,
  EstadoPresupuesto,
  EstadoTurno,
  TipoOTItem,
  type NivelCombustible,
} from "@/generated/prisma/enums";

export type ErroresFormularioOT = Partial<
  Record<"clienteId" | "vehiculoId" | "motivo" | "kmIngreso", string>
>;

export async function crearOT(
  turnoIdOpcional: string | null,
  _estadoPrevio: ErroresFormularioOT,
  formData: FormData,
): Promise<ErroresFormularioOT> {
  let clienteId = String(formData.get("clienteId") ?? "").trim();
  let vehiculoId = String(formData.get("vehiculoId") ?? "").trim();
  if (vehiculoId === "__nuevo") vehiculoId = "";
  const nombreNuevo = String(formData.get("clienteNuevoNombre") ?? "").trim();
  const telefonoNuevo = normalizarTelefono(String(formData.get("clienteNuevoTelefono") ?? ""));
  const patenteNueva = normalizarPatente(String(formData.get("vehiculoNuevoPatente") ?? ""));
  const marcaNueva = String(formData.get("vehiculoNuevoMarca") ?? "").trim();
  const modeloNuevo = String(formData.get("vehiculoNuevoModelo") ?? "").trim();
  const motivo = String(formData.get("motivo") ?? "").trim();
  const kmTexto = String(formData.get("kmIngreso") ?? "").trim();
  const kmIngreso = Number(kmTexto);
  const nivelCombustibleTexto = String(formData.get("nivelCombustible") ?? "");
  const nivelCombustible = (nivelCombustibleTexto || null) as NivelCombustible | null;

  const errores: ErroresFormularioOT = {};

  // Si la patente ya está cargada se usa ese vehículo (y su dueño si no se eligió cliente).
  if (!vehiculoId && patenteNueva) {
    const existente = await prisma.vehiculo.findUnique({
      where: { patente: patenteNueva },
      include: { cliente: { select: { nombre: true } } },
    });
    if (existente) {
      if (clienteId && existente.clienteId !== clienteId) {
        errores.vehiculoId = `La patente ${patenteNueva} ya está cargada a nombre de ${existente.cliente.nombre}.`;
      } else if (!clienteId && (nombreNuevo || telefonoNuevo)) {
        errores.vehiculoId = `La patente ${patenteNueva} ya está cargada a nombre de ${existente.cliente.nombre}: elegí ese cliente.`;
      } else {
        vehiculoId = existente.id;
        clienteId = existente.clienteId;
      }
    }
  }

  const clienteNuevoCompleto = Boolean(nombreNuevo && telefonoNuevo);
  const vehiculoNuevoCompleto = Boolean(patenteNueva && marcaNueva && modeloNuevo);

  if (!clienteId && !clienteNuevoCompleto) errores.clienteId = "Elegí un cliente o cargá uno nuevo (nombre y teléfono).";
  if (!vehiculoId && !vehiculoNuevoCompleto && !errores.vehiculoId) {
    errores.vehiculoId = "Elegí un vehículo o cargá uno nuevo (patente, marca y modelo).";
  }
  if (!motivo) errores.motivo = "Ingresá el motivo de ingreso.";
  if (!kmTexto || Number.isNaN(kmIngreso) || kmIngreso < 0) {
    errores.kmIngreso = "Ingresá el kilometraje.";
  }
  if (Object.keys(errores).length > 0) return errores;

  const otId = await prisma.$transaction(async (tx) => {
    if (!clienteId) {
      const existente = await tx.cliente.findFirst({ where: { telefono: telefonoNuevo } });
      const cliente =
        existente ??
        (await tx.cliente.create({
          data: {
            nombre: nombreNuevo,
            telefono: telefonoNuevo,
            tipoPersona: "FISICA",
            condicionFiscal: "CONSUMIDOR_FINAL",
          },
        }));
      clienteId = cliente.id;
    }
    if (!vehiculoId) {
      const vehiculo = await tx.vehiculo.create({
        data: { clienteId, patente: patenteNueva, marca: marcaNueva, modelo: modeloNuevo },
      });
      vehiculoId = vehiculo.id;
    }

    const numero = await siguienteNumeroOT(tx);

    const ot = await tx.ordenTrabajo.create({
      data: {
        numero,
        clienteId,
        vehiculoId,
        estado: EstadoOT.INGRESADO,
        motivo,
        kmIngreso,
        nivelCombustible: nivelCombustible ?? undefined,
      },
    });

    await tx.timelineEvento.create({
      data: { otId: ot.id, estado: EstadoOT.INGRESADO, nota: "Recepción del vehículo" },
    });

    await tx.kilometrajeRegistro.create({
      data: { vehiculoId, km: kmIngreso, otId: ot.id },
    });

    if (turnoIdOpcional) {
      await tx.turno.update({
        where: { id: turnoIdOpcional },
        data: { estado: EstadoTurno.CONVERTIDO_OT, otId: ot.id },
      });
    }

    return ot.id;
  });

  revalidatePath("/ots");
  revalidatePath("/");
  revalidatePath("/agenda");
  redirect(`/ots/${otId}`);
}

const SIGUIENTE_ESTADO: Partial<Record<EstadoOT, EstadoOT>> = {
  INGRESADO: EstadoOT.EN_DIAGNOSTICO,
  EN_DIAGNOSTICO: EstadoOT.PRESUPUESTADO,
  APROBADO: EstadoOT.EN_EJECUCION,
  EN_EJECUCION: EstadoOT.TERMINADO,
  // TERMINADO no salta directo: pasa por Facturación (Fase 4), ver
  // src/app/facturacion/actions.ts. FACTURADO sí avanza directo.
  FACTURADO: EstadoOT.ENTREGADO,
};

export async function avanzarEstadoOT(otId: string, notaOpcional?: string) {
  const ot = await prisma.ordenTrabajo.findUniqueOrThrow({ where: { id: otId } });
  const siguiente = SIGUIENTE_ESTADO[ot.estado];
  if (!siguiente) return;

  if (ot.estado === EstadoOT.EN_EJECUCION) {
    const cantidadItems = await prisma.oTItem.count({ where: { otId } });
    // La UI ya oculta el botón sin ítems; esto es un resguardo silencioso.
    if (cantidadItems === 0) return;
  }

  await prisma.ordenTrabajo.update({
    where: { id: otId },
    data: {
      estado: siguiente,
      cerradaAt: siguiente === EstadoOT.ENTREGADO ? new Date() : undefined,
    },
  });

  await prisma.timelineEvento.create({
    data: { otId, estado: siguiente, nota: notaOpcional },
  });

  revalidatePath(`/ots/${otId}`);
  revalidatePath("/ots");
  revalidatePath("/");
}

export async function saltarAEjecucion(otId: string) {
  await prisma.ordenTrabajo.update({
    where: { id: otId },
    data: { estado: EstadoOT.EN_EJECUCION },
  });
  await prisma.timelineEvento.create({
    data: { otId, estado: EstadoOT.EN_EJECUCION, nota: "Trabajo chico: se saltó el presupuesto" },
  });
  revalidatePath(`/ots/${otId}`);
  revalidatePath("/ots");
}

export async function cancelarOT(otId: string, formData: FormData) {
  const motivo = String(formData.get("motivo") ?? "").trim();
  if (!motivo) return;

  await prisma.ordenTrabajo.update({
    where: { id: otId },
    data: { estado: EstadoOT.CANCELADA, motivoCancelacion: motivo },
  });
  await prisma.timelineEvento.create({
    data: { otId, estado: EstadoOT.CANCELADA, nota: motivo },
  });

  revalidatePath(`/ots/${otId}`);
  revalidatePath("/ots");
  revalidatePath("/");
}

// Un trabajo del diagnóstico: falla encontrada + solución propuesta + precio.
export async function agregarTrabajoOT(otId: string, formData: FormData) {
  const falla = String(formData.get("falla") ?? "").trim() || null;
  const solucion = String(formData.get("solucion") ?? "").trim();
  const precio = Number(formData.get("precio") ?? 0);

  if (!solucion || Number.isNaN(precio) || precio < 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.oTItem.create({
      data: {
        otId,
        tipo: TipoOTItem.MANO_OBRA,
        descripcion: solucion,
        falla,
        cantidad: 1,
        precioUnitario: precio,
      },
    });
    await recalcularTotalesOT(otId, tx);
  });

  revalidatePath(`/ots/${otId}`);
}

// Un repuesto, del stock (descuenta) o nuevo/libre con su precio. Si hay que
// pedirlo, queda marcado con la nota de cómo pedirlo.
export async function agregarRepuestoOT(otId: string, formData: FormData) {
  const repuestoId = String(formData.get("repuestoId") ?? "").trim() || null;
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const cantidad = Number(formData.get("cantidad") ?? 1);
  const precioUnitario = Number(formData.get("precioUnitario") ?? 0);
  const aPedir = formData.get("aPedir") === "on";
  const notaPedido = String(formData.get("notaPedido") ?? "").trim() || null;

  if (!descripcion || !cantidad || cantidad <= 0 || Number.isNaN(precioUnitario) || precioUnitario < 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.oTItem.create({
      data: {
        otId,
        tipo: TipoOTItem.REPUESTO,
        descripcion,
        cantidad,
        precioUnitario,
        repuestoId,
        aPedir,
        estadoPedido: aPedir ? "A_PEDIR" : "NO",
        notaPedido: aPedir || notaPedido ? notaPedido : null,
      },
    });
    await recalcularTotalesOT(otId, tx);

    if (repuestoId) {
      await tx.movimientoStock.create({
        data: { repuestoId, tipo: "SALIDA", cantidad: Math.round(cantidad), otId },
      });
      await tx.repuesto.update({
        where: { id: repuestoId },
        data: { stock: { decrement: Math.round(cantidad) } },
      });
    }
  });

  revalidatePath(`/ots/${otId}`);
  revalidatePath("/stock");
}

// Novedad de la reparación (una línea): queda en el historial de la OT y en el informe del cliente.
export async function publicarNovedadOT(otId: string, texto: string) {
  const nota = texto.trim().slice(0, 200);
  if (!nota) return;

  const ot = await prisma.ordenTrabajo.findUniqueOrThrow({ where: { id: otId }, select: { estado: true } });
  await prisma.timelineEvento.create({ data: { otId, estado: ot.estado, nota } });

  revalidatePath(`/ots/${otId}`);
}

// Mueve un repuesto por su ciclo: hay que pedirlo -> pedido -> recepcionado (llegó).
// Pedido y recepcionado quedan en las novedades de la OT (también las ve el cliente en su informe).
export async function cambiarEstadoPedido(itemId: string, otId: string, estado: EstadoPedido) {
  if (!ESTADOS_PEDIDO.includes(estado)) return;

  const item = await prisma.oTItem.update({
    where: { id: itemId },
    data: { estadoPedido: estado, aPedir: estado === "A_PEDIR" },
    include: { ot: { select: { estado: true } } },
  });

  if (estado === "PEDIDO" || estado === "RECIBIDO") {
    await prisma.timelineEvento.create({
      data: {
        otId,
        estado: item.ot.estado,
        nota: estado === "RECIBIDO" ? `Llegó el repuesto: ${item.descripcion}` : `Repuesto pedido: ${item.descripcion}`,
      },
    });
  }

  revalidatePath(`/ots/${otId}`);
  revalidatePath("/ots");
  revalidatePath("/");
}

export async function eliminarItemOT(itemId: string, otId: string) {
  await prisma.$transaction(async (tx) => {
    const item = await tx.oTItem.delete({ where: { id: itemId } });
    await recalcularTotalesOT(otId, tx);

    if (item.repuestoId) {
      await tx.movimientoStock.create({
        data: {
          repuestoId: item.repuestoId,
          tipo: "ENTRADA",
          cantidad: Math.round(Number(item.cantidad)),
          otId,
        },
      });
      await tx.repuesto.update({
        where: { id: item.repuestoId },
        data: { stock: { increment: Math.round(Number(item.cantidad)) } },
      });
    }
  });

  revalidatePath(`/ots/${otId}`);
  revalidatePath("/stock");
}

export async function cargarPresupuesto(otId: string, formData: FormData) {
  const validezDias = Number(formData.get("validezDias") ?? 7);

  const [items, ot] = await Promise.all([
    prisma.oTItem.findMany({ where: { otId } }),
    prisma.ordenTrabajo.findUniqueOrThrow({ where: { id: otId } }),
  ]);

  const itemsSnapshot = items.map((item) => ({
    tipo: item.tipo,
    falla: item.falla,
    descripcion: item.descripcion,
    cantidad: Number(item.cantidad),
    precioUnitario: Number(item.precioUnitario),
  }));

  await prisma.$transaction(async (tx) => {
    await tx.presupuesto.create({
      data: {
        otId,
        itemsSnapshot,
        total: ot.total,
        validezDias,
        enviadoAt: new Date(),
      },
    });
    await tx.ordenTrabajo.update({ where: { id: otId }, data: { estado: EstadoOT.PRESUPUESTADO } });
    await tx.timelineEvento.create({
      data: { otId, estado: EstadoOT.PRESUPUESTADO, nota: `Presupuesto por $${ot.total}` },
    });
  });

  revalidatePath(`/ots/${otId}`);
}

export async function responderPresupuesto(
  otId: string,
  presupuestoId: string,
  resultado: "APROBADO" | "RECHAZADO",
  metodoRespuesta?: string,
) {
  await prisma.presupuesto.update({
    where: { id: presupuestoId },
    data: {
      estado: resultado === "APROBADO" ? EstadoPresupuesto.APROBADO : EstadoPresupuesto.RECHAZADO,
      respondidoAt: new Date(),
      metodoRespuesta,
    },
  });

  if (resultado === "APROBADO") {
    await prisma.ordenTrabajo.update({ where: { id: otId }, data: { estado: EstadoOT.APROBADO } });
    await prisma.timelineEvento.create({
      data: { otId, estado: EstadoOT.APROBADO, nota: `Aprobado vía ${metodoRespuesta ?? "sin especificar"}` },
    });
  } else {
    await prisma.timelineEvento.create({
      data: { otId, estado: EstadoOT.PRESUPUESTADO, nota: "Presupuesto rechazado por el cliente" },
    });
  }

  revalidatePath(`/ots/${otId}`);
}

export async function subirFotoOT(otId: string, formData: FormData) {
  const archivo = formData.get("foto");
  if (!(archivo instanceof File) || archivo.size === 0) return;

  const rutaGuardada = await storageAdapter.guardar(archivo, `ots/${otId}`);

  await prisma.foto.create({
    data: { entidad: EntidadFoto.OT, otId, path: rutaGuardada },
  });

  revalidatePath(`/ots/${otId}`);
}

export async function eliminarFotoOT(fotoId: string, otId: string) {
  const foto = await prisma.foto.findUnique({ where: { id: fotoId } });
  if (!foto) return;

  await prisma.foto.delete({ where: { id: fotoId } });
  await storageAdapter.eliminar(foto.path);

  revalidatePath(`/ots/${otId}`);
}
