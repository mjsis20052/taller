import { prisma } from "@/lib/prisma";
import { EstadoSolicitudFacturacion } from "@/generated/prisma/enums";
import type { FacturacionAdapter } from "./facturacion-adapter";

// v1: deja la solicitud en cola para que una persona del estudio la
// procese y cargue número/CAE/PDF a mano (ver docs/03-integracion-estudio.md).
// Mañana: ApiEstudioAdapter — solo cambia esta implementación.
export class ColaManualAdapter implements FacturacionAdapter {
  async solicitarFactura(solicitudId: string): Promise<void> {
    await prisma.solicitudFacturacion.update({
      where: { id: solicitudId },
      data: { estado: EstadoSolicitudFacturacion.ENVIADA, enviadoAt: new Date() },
    });
  }

  async consultarEstado(solicitudId: string): Promise<string> {
    const solicitud = await prisma.solicitudFacturacion.findUniqueOrThrow({
      where: { id: solicitudId },
    });
    return solicitud.estado;
  }
}

export const facturacionAdapter: FacturacionAdapter = new ColaManualAdapter();
