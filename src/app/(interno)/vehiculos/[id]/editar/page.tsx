import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { FormularioVehiculo } from "@/components/formulario-vehiculo";
import { actualizarVehiculo } from "@/app/(interno)/vehiculos/actions";

export const metadata: Metadata = { title: "Editar vehículo" };

export default async function PaginaEditarVehiculo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehiculo = await prisma.vehiculo.findUnique({ where: { id } });

  if (!vehiculo) notFound();

  return (
    <section>
      <EncabezadoPagina titulo="Editar vehículo" descripcion={vehiculo.patente} />
      <FormularioVehiculo
        accion={actualizarVehiculo.bind(null, vehiculo.id)}
        vehiculo={vehiculo}
        textoBoton="Guardar cambios"
      />
    </section>
  );
}
