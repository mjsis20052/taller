import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";

export const metadata: Metadata = { title: "Stock" };

export default async function PaginaStock({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const busqueda = q?.trim() ?? "";

  const repuestos = await prisma.repuesto.findMany({
    where: {
      activo: true,
      ...(busqueda
        ? {
            OR: [
              { descripcion: { contains: busqueda, mode: "insensitive" } },
              { codigo: { contains: busqueda, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { descripcion: "asc" },
  });

  const conStockBajo = repuestos.filter((r) => r.stock <= r.stockMinimo);

  return (
    <section>
      <EncabezadoPagina titulo="Stock" descripcion="Repuestos, cantidades y alertas." />

      <div className="mb-4 flex gap-2">
        <form className="flex-1" action="/stock">
          <input
            type="search"
            name="q"
            defaultValue={busqueda}
            placeholder="Buscar por descripción o código…"
            className="w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] outline-none focus:border-primario"
          />
        </form>
        <Link
          href="/stock/nuevo"
          className="flex shrink-0 items-center justify-center rounded-xl bg-primario px-4 text-[14px] font-semibold text-white"
        >
          Nuevo
        </Link>
      </div>

      {conStockBajo.length > 0 && (
        <div className="mb-4 rounded-2xl border border-alerta/30 bg-alerta-suave px-4 py-3 text-[13.5px] text-alerta">
          {conStockBajo.length} repuesto{conStockBajo.length === 1 ? "" : "s"} con stock bajo o
          agotado.
        </div>
      )}

      {repuestos.length === 0 ? (
        <EstadoVacio
          titulo={busqueda ? "Sin resultados" : "Todavía no hay repuestos"}
          descripcion={
            busqueda
              ? `No encontramos nada para "${busqueda}".`
              : "Cargá el inventario de repuestos del taller."
          }
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {repuestos.map((r) => {
            const bajo = r.stock <= r.stockMinimo;
            return (
              <Link
                key={r.id}
                href={`/stock/${r.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-borde bg-superficie px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-foreground">
                    {r.descripcion}
                  </p>
                  <p className="text-[13px] text-mutado">
                    {r.codigo ? `${r.codigo} · ` : ""}${Number(r.precioVenta).toLocaleString("es-AR")}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    bajo ? "bg-alerta-suave text-alerta" : "bg-primario-suave text-primario"
                  }`}
                >
                  {r.stock} en stock
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
