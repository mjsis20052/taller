"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { facturacionAdapter } from "@/lib/facturacion/cola-manual-adapter";
import { EstadoOT, EstadoSolicitudFacturacion } from "@/generated/prisma/enums";

export async function generarSolicitudFacturacion(otId: string) {
  const ot = await prisma.ordenTrabajo.findUniqueOrThrow({
    where: { id: otId },
    include: { cliente: true, items: true },
  });

  const existente = await prisma.solicitudFacturacion.findUnique({ where: { otId } });
  if (existente) return;

  await prisma.solicitudFacturacion.create({
    data: {
      otId,
      // Determinístico: reintentar el envío no genera dos facturas del mismo trabajo.
      idExterno: ot.numero,
      clienteSnapshot: {
        nombre: ot.cliente.nombre,
        tipoPersona: ot.cliente.tipoPersona,
        dni: ot.cliente.dni,
        cuit: ot.cliente.cuit,
        condicionFiscal: ot.cliente.condicionFiscal,
        domicilio: ot.cliente.domicilio,
      },
      // Importes netos: este sistema no calcula impuestos.
      items: ot.items.map((item) => ({
        tipo: item.tipo,
        descripcion: item.descripcion,
        cantidad: Number(item.cantidad),
        precioUnitario: Number(item.precioUnitario),
      })),
      total: ot.total,
      fechaVenta: new Date(),
    },
  });

  revalidatePath(`/ots/${otId}`);
  revalidatePath("/facturacion");
}

export async function enviarSolicitud(solicitudId: string, otId: string) {
  await facturacionAdapter.solicitarFactura(solicitudId);
  revalidatePath(`/ots/${otId}`);
  revalidatePath("/facturacion");
  revalidatePath(`/facturacion/${solicitudId}`);
}

export async function cargarComprobante(solicitudId: string, otId: string, formData: FormData) {
  const numeroComprobante = String(formData.get("numeroComprobante") ?? "").trim();
  const cae = String(formData.get("cae") ?? "").trim();
  const caeVencimientoTexto = String(formData.get("caeVencimiento") ?? "").trim();
  const pdfUrl = String(formData.get("pdfUrl") ?? "").trim();

  if (!numeroComprobante || !cae) return;

  await prisma.$transaction(async (tx) => {
    await tx.solicitudFacturacion.update({
      where: { id: solicitudId },
      data: {
        numeroComprobante,
        cae,
        caeVencimiento: caeVencimientoTexto ? new Date(`${caeVencimientoTexto}T00:00:00`) : null,
        pdfUrl: pdfUrl || null,
        estado: EstadoSolicitudFacturacion.FACTURADA,
        facturadaAt: new Date(),
      },
    });
    await tx.ordenTrabajo.update({ where: { id: otId }, data: { estado: EstadoOT.FACTURADO } });
    await tx.timelineEvento.create({
      data: { otId, estado: EstadoOT.FACTURADO, nota: `Comprobante ${numeroComprobante}` },
    });
  });

  revalidatePath(`/ots/${otId}`);
  revalidatePath("/facturacion");
  revalidatePath(`/facturacion/${solicitudId}`);
}

export async function marcarErrorFacturacion(solicitudId: string, otId: string, formData: FormData) {
  const errorDetalle = String(formData.get("errorDetalle") ?? "").trim();
  if (!errorDetalle) return;

  await prisma.solicitudFacturacion.update({
    where: { id: solicitudId },
    data: { estado: EstadoSolicitudFacturacion.ERROR, errorDetalle },
  });

  revalidatePath(`/ots/${otId}`);
  revalidatePath("/facturacion");
  revalidatePath(`/facturacion/${solicitudId}`);
}

export async function entregarSinFacturar(otId: string) {
  await prisma.ordenTrabajo.update({ where: { id: otId }, data: { estado: EstadoOT.ENTREGADO, cerradaAt: new Date() } });
  await prisma.timelineEvento.create({
    data: { otId, estado: EstadoOT.ENTREGADO, nota: "Entregado sin facturación (decisión del dueño)" },
  });

  revalidatePath(`/ots/${otId}`);
  revalidatePath("/ots");
  revalidatePath("/");
}
