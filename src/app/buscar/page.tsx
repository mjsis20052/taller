import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";

export const metadata: Metadata = { title: "Buscar" };

export default async function PaginaBuscar({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const busqueda = q?.trim() ?? "";

  const [clientes, vehiculos] = busqueda.length >= 2
    ? await Promise.all([
        prisma.cliente.findMany({
          where: {
            OR: [
              { nombre: { contains: busqueda, mode: "insensitive" } },
              { telefono: { contains: busqueda, mode: "insensitive" } },
            ],
          },
          take: 10,
          orderBy: { nombre: "asc" },
        }),
        prisma.vehiculo.findMany({
          where: { patente: { contains: busqueda, mode: "insensitive" } },
          include: { cliente: { select: { nombre: true } } },
          take: 10,
          orderBy: { patente: "asc" },
        }),
      ])
    : [[], []];

  const sinResultados = busqueda.length >= 2 && clientes.length === 0 && vehiculos.length === 0;

  return (
    <section>
      <EncabezadoPagina titulo="Buscar" descripcion="Por patente, nombre o teléfono." />

      <form action="/buscar" className="mb-5">
        <input
          type="search"
          name="q"
          defaultValue={busqueda}
          autoFocus
          placeholder="AB123CD, Juan Pérez, 1122334455…"
          className="w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] outline-none focus:border-primario"
        />
      </form>

      {sinResultados && (
        <EstadoVacio
          titulo="Sin resultados"
          descripcion={`No encontramos nada para "${busqueda}".`}
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          }
        />
      )}

      {vehiculos.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-mutado">
            Vehículos
          </h2>
          <div className="space-y-2">
            {vehiculos.map((v) => (
              <Link
                key={v.id}
                href={`/vehiculos/${v.id}`}
                className="flex items-center justify-between rounded-2xl border border-borde bg-superficie px-4 py-3"
              >
                <div>
                  <p className="text-[14.5px] font-semibold text-foreground">
                    {v.patente} · {v.marca} {v.modelo}
                  </p>
                  <p className="text-[12.5px] text-mutado">{v.cliente.nombre}</p>
                </div>
                <span className="text-mutado">›</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {clientes.length > 0 && (
        <section>
          <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-mutado">
            Clientes
          </h2>
          <div className="space-y-2">
            {clientes.map((c) => (
              <Link
                key={c.id}
                href={`/clientes/${c.id}`}
                className="flex items-center justify-between rounded-2xl border border-borde bg-superficie px-4 py-3"
              >
                <div>
                  <p className="text-[14.5px] font-semibold text-foreground">{c.nombre}</p>
                  <p className="text-[12.5px] text-mutado">{c.telefono}</p>
                </div>
                <span className="text-mutado">›</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
