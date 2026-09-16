import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { FormularioCliente } from "@/components/formulario-cliente";
import { SeccionVehiculosCliente } from "@/components/seccion-vehiculos-cliente";
import { actualizarCliente } from "@/app/clientes/actions";

export const metadata: Metadata = { title: "Editar cliente" };

export default async function PaginaEditarCliente({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: { vehiculos: { orderBy: { patente: "asc" } } },
  });

  if (!cliente) notFound();

  return (
    <section>
      <EncabezadoPagina titulo="Editar cliente" descripcion={cliente.nombre} />
      <FormularioCliente
        accion={actualizarCliente.bind(null, cliente.id)}
        cliente={cliente}
        textoBoton="Guardar cambios"
      />
      <SeccionVehiculosCliente clienteId={cliente.id} vehiculos={cliente.vehiculos} />
    </section>
  );
}
