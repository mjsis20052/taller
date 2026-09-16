import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";
import { ListaAnimada, ItemAnimado } from "@/components/lista-animada";

export const metadata: Metadata = { title: "Vehículos" };

export default async function PaginaVehiculos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const busqueda = q?.trim() ?? "";

  const vehiculos = await prisma.vehiculo.findMany({
    where: busqueda
      ? {
          OR: [
            { patente: { contains: busqueda, mode: "insensitive" } },
            { marca: { contains: busqueda, mode: "insensitive" } },
            { modelo: { contains: busqueda, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { patente: "asc" },
    include: { cliente: { select: { nombre: true } } },
  });

  return (
    <section>
      <EncabezadoPagina
        titulo="Vehículos"
        descripcion="Buscá por patente, marca o modelo."
      />

      <form className="mb-4" action="/vehiculos">
        <input
          type="search"
          name="q"
          defaultValue={busqueda}
          placeholder="Buscar por patente, marca o modelo…"
          className="w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] outline-none focus:border-primario"
        />
      </form>

      {vehiculos.length === 0 ? (
        <EstadoVacio
          titulo={busqueda ? "Sin resultados" : "Todavía no hay vehículos"}
          descripcion={
            busqueda
              ? `No encontramos ningún vehículo que coincida con "${busqueda}".`
              : "Los vehículos se cargan desde la ficha de cada cliente."
          }
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M5 17h14l1.5-5.5a2 2 0 0 0-1.9-2.5H6.4a2 2 0 0 0-1.9 1.4L3 17" />
              <circle cx="7.5" cy="17.5" r="1.5" />
              <circle cx="16.5" cy="17.5" r="1.5" />
            </svg>
          }
        />
      ) : (
        <ListaAnimada className="space-y-2.5">
          {vehiculos.map((vehiculo) => (
            <ItemAnimado key={vehiculo.id}>
              <Link
                href={`/vehiculos/${vehiculo.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-borde bg-superficie px-4 py-3.5 active:bg-black/[0.03]"
              >
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-foreground">
                    {vehiculo.patente} · {vehiculo.marca} {vehiculo.modelo}
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-mutado">
                    {vehiculo.cliente.nombre}
                  </p>
                </div>
                {!vehiculo.activo && (
                  <span className="shrink-0 rounded-full bg-alerta-suave px-2.5 py-1 text-[11px] font-semibold text-alerta">
                    Inactivo
                  </span>
                )}
              </Link>
            </ItemAnimado>
          ))}
        </ListaAnimada>
      )}
    </section>
  );
}
