import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { FormularioNuevaOT } from "@/components/formulario-nueva-ot";
import { crearOT } from "@/app/ots/actions";

export const metadata: Metadata = { title: "Nueva OT" };

export default async function PaginaNuevaOT({
  searchParams,
}: {
  searchParams: Promise<{ turnoId?: string }>;
}) {
  const { turnoId } = await searchParams;

  const turno = turnoId
    ? await prisma.turno.findUnique({
        where: { id: turnoId },
        include: { cliente: { select: { id: true, nombre: true, telefono: true } } },
      })
    : null;

  return (
    <section>
      <EncabezadoPagina
        titulo="Recepción de vehículo"
        descripcion="Se crea la OT y queda lista para diagnóstico."
      />
      <FormularioNuevaOT
        accion={crearOT.bind(null, turno?.id ?? null)}
        clienteInicial={turno?.cliente}
        vehiculoIdInicial={turno?.vehiculoId}
        motivoInicial={turno?.motivo}
      />
    </section>
  );
}
