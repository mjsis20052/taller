import { prisma } from "@/lib/prisma";
import { contarDeudores } from "@/lib/cuenta-corriente";
import { MARCADOR_PEDIDO_PORTAL } from "@/lib/turno-portal";
import { EstadoOT, EstadoTurno } from "@/generated/prisma/enums";

export type Alerta = { texto: string; href: string };

export async function obtenerAlertas(): Promise<Alerta[]> {
  const [repuestosBajosFila, cantidadDeudores, presupuestosSinRespuesta, facturacionPendiente, pedidosWeb] =
    await Promise.all([
      prisma.$queryRaw<{ c: number }[]>`SELECT COUNT(*)::int AS c FROM "Repuesto" WHERE activo = true AND stock <= "stockMinimo"`,
      contarDeudores(),
      prisma.ordenTrabajo.count({ where: { estado: EstadoOT.PRESUPUESTADO } }),
      prisma.solicitudFacturacion.count({ where: { estado: { in: ["PENDIENTE", "ENVIADA"] } } }),
      prisma.turno.count({
        where: { estado: EstadoTurno.AGENDADO, motivo: { startsWith: MARCADOR_PEDIDO_PORTAL } },
      }),
    ]);

  const repuestosBajos = repuestosBajosFila[0]?.c ?? 0;

  return [
    pedidosWeb > 0 && {
      texto: `${pedidosWeb} pedido${pedidosWeb === 1 ? "" : "s"} de turno desde la web sin confirmar`,
      href: "/agenda#por-confirmar",
    },
    repuestosBajos > 0 && {
      texto: `${repuestosBajos} repuesto${repuestosBajos === 1 ? "" : "s"} con stock bajo`,
      href: "/stock",
    },
    presupuestosSinRespuesta > 0 && {
      texto: `${presupuestosSinRespuesta} presupuesto${presupuestosSinRespuesta === 1 ? "" : "s"} esperando respuesta`,
      href: "/ots?estado=PRESUPUESTADO",
    },
    cantidadDeudores > 0 && {
      texto: `${cantidadDeudores} cliente${cantidadDeudores === 1 ? "" : "s"} con saldo pendiente`,
      href: "/cobranzas",
    },
    facturacionPendiente > 0 && {
      texto: `${facturacionPendiente} solicitud${facturacionPendiente === 1 ? "" : "es"} de facturación pendiente${facturacionPendiente === 1 ? "" : "s"}`,
      href: "/facturacion",
    },
  ].filter(Boolean) as Alerta[];
}
