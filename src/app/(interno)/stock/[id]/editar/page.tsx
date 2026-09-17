import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { FormularioRepuesto } from "@/components/formulario-repuesto";
import { actualizarRepuesto } from "@/app/(interno)/stock/actions";

export const metadata: Metadata = { title: "Editar repuesto" };

export default async function PaginaEditarRepuesto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repuesto = await prisma.repuesto.findUnique({ where: { id } });

  if (!repuesto) notFound();

  return (
    <section>
      <EncabezadoPagina titulo="Editar repuesto" descripcion={repuesto.descripcion} />
      <FormularioRepuesto
        accion={actualizarRepuesto.bind(null, repuesto.id)}
        repuesto={{
          descripcion: repuesto.descripcion,
          codigo: repuesto.codigo,
          proveedor: repuesto.proveedor,
          stockMinimo: repuesto.stockMinimo,
          costo: Number(repuesto.costo),
          precioVenta: Number(repuesto.precioVenta),
        }}
        textoBoton="Guardar cambios"
      />
    </section>
  );
}
