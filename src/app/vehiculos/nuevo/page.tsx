import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { FormularioVehiculo } from "@/components/formulario-vehiculo";
import { FormularioBuscarVehiculo } from "@/components/formulario-buscar-vehiculo";
import { crearVehiculo } from "@/app/vehiculos/actions";

export const metadata: Metadata = { title: "Nuevo vehículo" };

export default async function PaginaNuevoVehiculo({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; modo?: string }>;
}) {
  const { clienteId, modo } = await searchParams;
  if (!clienteId) notFound();

  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    select: { id: true, nombre: true },
  });
  if (!cliente) notFound();

  const esExistente = modo === "existente";

  return (
    <section>
      <EncabezadoPagina titulo="Vehículo" descripcion={`Para ${cliente.nombre}`} />

      <div className="mb-5 flex gap-2 rounded-xl border border-borde bg-superficie p-1">
        <Link
          href={`/vehiculos/nuevo?clienteId=${clienteId}`}
          className={`flex-1 rounded-lg py-2 text-center text-[13.5px] font-semibold ${
            !esExistente ? "bg-primario-suave text-primario" : "text-mutado"
          }`}
        >
          Cargar nuevo
        </Link>
        <Link
          href={`/vehiculos/nuevo?clienteId=${clienteId}&modo=existente`}
          className={`flex-1 rounded-lg py-2 text-center text-[13.5px] font-semibold ${
            esExistente ? "bg-primario-suave text-primario" : "text-mutado"
          }`}
        >
          Ya está cargado
        </Link>
      </div>

      {esExistente ? (
        <FormularioBuscarVehiculo clienteId={clienteId} />
      ) : (
        <FormularioVehiculo accion={crearVehiculo.bind(null, clienteId)} textoBoton="Guardar vehículo" />
      )}
    </section>
  );
}
