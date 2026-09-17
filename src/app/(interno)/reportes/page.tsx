import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { listarDeudores } from "@/lib/cuenta-corriente";
import { EstadoOT } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Reportes" };

export default async function PaginaReportes() {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  const [otsDelMes, cobrosDelMes, gastosDelMes, repuestosActivos, deudores, otsRecientes] =
    await Promise.all([
      prisma.ordenTrabajo.findMany({
        where: {
          estado: { in: [EstadoOT.ENTREGADO, EstadoOT.FACTURADO] },
          cerradaAt: { gte: inicioMes },
        },
        select: { total: true },
      }),
      prisma.cobro.findMany({ where: { fecha: { gte: inicioMes } }, select: { monto: true } }),
      prisma.gasto.findMany({ where: { fecha: { gte: inicioMes } }, select: { monto: true } }),
      prisma.repuesto.findMany({ where: { activo: true }, select: { stock: true, stockMinimo: true } }),
      listarDeudores(),
      prisma.ordenTrabajo.findMany({
        where: { estado: { in: [EstadoOT.ENTREGADO, EstadoOT.FACTURADO] } },
        include: {
          cliente: { select: { nombre: true } },
          items: { include: { repuesto: { select: { costo: true } } } },
        },
        orderBy: { cerradaAt: "desc" },
        take: 10,
      }),
    ]);

  const repuestosBajos = repuestosActivos.filter((r) => r.stock <= r.stockMinimo).length;
  const ventasDelMes = otsDelMes.reduce((acc, ot) => acc + Number(ot.total), 0);
  const cobradoDelMes = cobrosDelMes.reduce((acc, c) => acc + Number(c.monto), 0);
  const gastadoDelMes = gastosDelMes.reduce((acc, g) => acc + Number(g.monto), 0);
  const totalAdeudado = deudores.reduce((acc, d) => acc + d.deuda, 0);

  return (
    <section>
      <EncabezadoPagina titulo="Reportes" descripcion="Resumen del mes en curso." />

      <div className="mb-6 grid grid-cols-2 gap-2.5">
        <Metrica etiqueta="Ventas del mes" valor={ventasDelMes} />
        <Metrica etiqueta="Cobrado del mes" valor={cobradoDelMes} />
        <Metrica etiqueta="Gastado del mes" valor={gastadoDelMes} />
        <Metrica etiqueta="Total adeudado" valor={totalAdeudado} alerta={totalAdeudado > 0} />
      </div>

      {repuestosBajos > 0 && (
        <div className="mb-6 rounded-2xl border border-alerta/30 bg-alerta-suave px-4 py-3 text-[13.5px] text-alerta">
          {repuestosBajos} repuesto{repuestosBajos === 1 ? "" : "s"} con stock bajo o agotado.
        </div>
      )}

      <section>
        <h2 className="mb-3 text-[17px] font-semibold text-foreground">
          Rentabilidad por OT (últimas entregadas)
        </h2>
        <p className="mb-3 text-[13px] text-mutado">
          Costo estimado solo con repuestos vinculados al inventario; los ítems libres no tienen
          costo cargado.
        </p>
        <div className="space-y-2">
          {otsRecientes.map((ot) => {
            const costoRepuestos = ot.items.reduce((acc, item) => {
              if (item.tipo !== "REPUESTO" || !item.repuesto) return acc;
              return acc + Number(item.repuesto.costo) * Number(item.cantidad);
            }, 0);
            const rentabilidad = Number(ot.total) - costoRepuestos;
            return (
              <div key={ot.id} className="flex items-center justify-between rounded-xl border border-borde bg-superficie px-4 py-3">
                <div>
                  <p className="text-[14px] font-semibold text-foreground">{ot.numero}</p>
                  <p className="text-[12.5px] text-mutado">{ot.cliente.nombre}</p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-bold text-foreground">
                    ${rentabilidad.toLocaleString("es-AR")}
                  </p>
                  <p className="text-[11.5px] text-mutado">de ${Number(ot.total).toLocaleString("es-AR")}</p>
                </div>
              </div>
            );
          })}
          {otsRecientes.length === 0 && (
            <p className="text-[13.5px] text-mutado">Todavía no hay OTs entregadas.</p>
          )}
        </div>
      </section>
    </section>
  );
}

function Metrica({
  etiqueta,
  valor,
  alerta,
}: {
  etiqueta: string;
  valor: number;
  alerta?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-borde bg-superficie p-4">
      <p className="text-[12px] text-mutado">{etiqueta}</p>
      <p className={`text-[20px] font-bold ${alerta ? "text-alerta" : "text-foreground"}`}>
        ${valor.toLocaleString("es-AR")}
      </p>
    </div>
  );
}
