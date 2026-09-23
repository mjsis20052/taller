import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cambiarActivoRepuesto, registrarMovimientoStock } from "@/app/(interno)/stock/actions";

const ETIQUETAS_TIPO: Record<string, string> = {
  ENTRADA: "Entrada",
  SALIDA: "Salida",
  AJUSTE: "Ajuste",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const repuesto = await prisma.repuesto.findUnique({ where: { id }, select: { descripcion: true } });
  return { title: repuesto?.descripcion ?? "Repuesto" };
}

export default async function PaginaDetalleRepuesto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repuesto = await prisma.repuesto.findUnique({
    where: { id },
    include: { movimientos: { orderBy: { fecha: "desc" }, take: 15 } },
  });

  if (!repuesto) notFound();

  const bajo = repuesto.stock <= repuesto.stockMinimo;

  return (
    <section>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-foreground">
            {repuesto.descripcion}
          </h1>
          {repuesto.codigo && <p className="mt-1 text-[14px] text-mutado">Código: {repuesto.codigo}</p>}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            bajo ? "bg-alerta-suave text-alerta" : "bg-primario-suave text-primario"
          }`}
        >
          {repuesto.stock} en stock
        </span>
      </header>

      <div className="space-y-2 rounded-2xl border border-borde bg-superficie p-4 text-[14.5px]">
        {repuesto.proveedor && <FilaDato etiqueta="Proveedor" valor={repuesto.proveedor} />}
        <FilaDato etiqueta="Stock mínimo" valor={String(repuesto.stockMinimo)} />
        <FilaDato etiqueta="Costo" valor={`$${Number(repuesto.costo).toLocaleString("es-AR")}`} />
        <FilaDato etiqueta="Precio de venta" valor={`$${Number(repuesto.precioVenta).toLocaleString("es-AR")}`} />
      </div>

      <div className="mt-3 flex gap-2">
        <Link
          href={`/stock/${repuesto.id}/editar`}
          className="flex-1 rounded-xl border border-borde bg-superficie py-3 text-center text-[14px] font-semibold text-foreground"
        >
          Editar
        </Link>
        <form action={cambiarActivoRepuesto.bind(null, repuesto.id, !repuesto.activo)} className="flex-1">
          <button
            type="submit"
            className="w-full rounded-xl border border-borde bg-superficie py-3 text-[14px] font-semibold text-peligro"
          >
            {repuesto.activo ? "Dar de baja" : "Reactivar"}
          </button>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-[17px] font-semibold text-foreground">Movimientos</h2>
        <form action={registrarMovimientoStock.bind(null, repuesto.id)} className="mb-3 rounded-xl border border-dashed border-borde bg-superficie p-3">
          <div className="grid grid-cols-2 gap-2">
            <select name="tipo" defaultValue="ENTRADA" className="rounded-lg border border-borde bg-superficie px-3 py-2.5 text-[14px]">
              <option value="ENTRADA">Entrada (compra)</option>
              <option value="AJUSTE">Ajuste</option>
              <option value="SALIDA">Salida manual</option>
            </select>
            <input
              name="cantidad"
              type="number"
              min={1}
              required
              placeholder="Cantidad"
              className="rounded-lg border border-borde bg-superficie px-3 py-2.5 text-[14px]"
            />
          </div>
          <button type="submit" className="mt-2 w-full rounded-xl bg-primario py-2.5 text-[13.5px] font-semibold text-white">
            Registrar movimiento
          </button>
        </form>

        {repuesto.movimientos.length > 0 && (
          <div className="space-y-2">
            {repuesto.movimientos.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-borde bg-superficie px-4 py-2.5 text-[13.5px]">
                <span className="font-semibold text-foreground">
                  {ETIQUETAS_TIPO[m.tipo]} · {m.cantidad}
                </span>
                <span className="text-mutado">
                  {new Intl.DateTimeFormat("es-AR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "America/Argentina/Buenos_Aires",
                  }).format(m.fecha)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function FilaDato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-mutado">{etiqueta}</span>
      <span className="text-right font-medium text-foreground">{valor}</span>
    </div>
  );
}
