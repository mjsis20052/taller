"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { recalcularTotalesOT, siguienteNumeroOT } from "@/lib/ordenes-trabajo";
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
  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const vehiculoId = String(formData.get("vehiculoId") ?? "").trim();
  const motivo = String(formData.get("motivo") ?? "").trim();
  const kmTexto = String(formData.get("kmIngreso") ?? "").trim();
  const kmIngreso = Number(kmTexto);
  const nivelCombustibleTexto = String(formData.get("nivelCombustible") ?? "");
  const nivelCombustible = (nivelCombustibleTexto || null) as NivelCombustible | null;

  const errores: ErroresFormularioOT = {};
  if (!clienteId) errores.clienteId = "Elegí un cliente.";
  if (!vehiculoId) errores.vehiculoId = "Elegí un vehículo.";
  if (!motivo) errores.motivo = "Ingresá el motivo de ingreso.";
  if (!kmTexto || Number.isNaN(kmIngreso) || kmIngreso < 0) {
    errores.kmIngreso = "Ingresá el kilometraje.";
  }
  if (Object.keys(errores).length > 0) return errores;

  const otId = await prisma.$transaction(async (tx) => {
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

export async function agregarItemOT(otId: string, formData: FormData) {
  const tipo = String(formData.get("tipo") ?? "") as TipoOTItem;
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const cantidad = Number(formData.get("cantidad") ?? 0);
  const precioUnitario = Number(formData.get("precioUnitario") ?? 0);
  const repuestoId = String(formData.get("repuestoId") ?? "").trim() || null;

  if (!descripcion || !cantidad || cantidad <= 0 || precioUnitario < 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.oTItem.create({
      data: { otId, tipo, descripcion, cantidad, precioUnitario, repuestoId },
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
