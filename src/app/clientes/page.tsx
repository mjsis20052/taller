import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";
import { TarjetaCliente } from "@/components/tarjeta-cliente";

export const metadata: Metadata = { title: "Clientes" };

export default async function PaginaClientes({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const busqueda = q?.trim() ?? "";

  const clientes = await prisma.cliente.findMany({
    where: busqueda
      ? {
          OR: [
            { nombre: { contains: busqueda, mode: "insensitive" } },
            { telefono: { contains: busqueda, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      nombre: true,
      telefono: true,
      condicionFiscal: true,
      activo: true,
    },
  });

  return (
    <section>
      <EncabezadoPagina
        titulo="Clientes"
        descripcion="Buscá por nombre o teléfono, o cargá uno nuevo."
      />

      <div className="mb-4 flex gap-2">
        <form className="flex-1" action="/clientes">
          <input
            type="search"
            name="q"
            defaultValue={busqueda}
            placeholder="Buscar por nombre o teléfono…"
            className="w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] outline-none focus:border-primario"
          />
        </form>
        <Link
          href="/clientes/nuevo"
          className="flex shrink-0 items-center justify-center rounded-xl bg-primario px-4 text-[14px] font-semibold text-white"
        >
          Nuevo
        </Link>
      </div>

      {clientes.length === 0 ? (
        <EstadoVacio
          titulo={busqueda ? "Sin resultados" : "Todavía no hay clientes"}
          descripcion={
            busqueda
              ? `No encontramos a nadie que coincida con "${busqueda}".`
              : "Cargá el primer cliente para empezar a agendar turnos y OTs."
          }
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {clientes.map((cliente) => (
            <TarjetaCliente key={cliente.id} cliente={cliente} />
          ))}
        </div>
      )}
    </section>
  );
}
