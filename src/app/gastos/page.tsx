import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";
import { eliminarGasto } from "@/app/gastos/actions";

export const metadata: Metadata = { title: "Gastos" };

const ETIQUETAS_CATEGORIA: Record<string, string> = {
  REPUESTOS: "Repuestos",
  HERRAMIENTAS: "Herramientas",
  ALQUILER: "Alquiler",
  SERVICIOS: "Servicios",
  OTROS: "Otros",
};

export default async function PaginaGastos() {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  const gastos = await prisma.gasto.findMany({
    orderBy: { fecha: "desc" },
    take: 50,
  });

  const totalMes = gastos
    .filter((g) => g.fecha >= inicioMes)
    .reduce((acc, g) => acc + Number(g.monto), 0);

  return (
    <section>
      <EncabezadoPagina titulo="Gastos" descripcion="Repuestos, herramientas, alquiler y más." />

      <div className="mb-4 flex gap-2">
        <div className="flex-1 rounded-2xl border border-borde bg-superficie p-4">
          <p className="text-[12px] text-mutado">Gastado este mes</p>
          <p className="text-[22px] font-bold text-foreground">
            ${totalMes.toLocaleString("es-AR")}
          </p>
        </div>
        <Link
          href="/gastos/nuevo"
          className="flex shrink-0 items-center justify-center rounded-xl bg-primario px-4 text-[14px] font-semibold text-white"
        >
          Nuevo
        </Link>
      </div>

      {gastos.length === 0 ? (
        <EstadoVacio
          titulo="Sin gastos cargados"
          descripcion="Registrá compras, herramientas, alquiler u otros gastos del taller."
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {gastos.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-borde bg-superficie px-4 py-3.5"
            >
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-foreground">
                  {g.proveedor}
                </p>
                <p className="text-[13px] text-mutado">
                  {ETIQUETAS_CATEGORIA[g.categoria]} ·{" "}
                  {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(g.fecha)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-[14.5px] font-bold text-foreground">
                  ${Number(g.monto).toLocaleString("es-AR")}
                </span>
                <form action={eliminarGasto.bind(null, g.id)}>
                  <button type="submit" className="text-[13px] text-peligro" aria-label="Eliminar gasto">
                    ×
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
