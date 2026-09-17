import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { FormularioTurno } from "@/components/formulario-turno";
import { actualizarTurno } from "@/app/(interno)/agenda/actions";

export const metadata: Metadata = { title: "Editar turno" };

export default async function PaginaEditarTurno({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const turno = await prisma.turno.findUnique({
    where: { id },
    include: { cliente: { select: { id: true, nombre: true, telefono: true } } },
  });

  if (!turno) notFound();

  const fechaHoraLocal = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(turno.fechaHora)
    .replace(" ", "T");
  const [fecha, hora] = fechaHoraLocal.split("T");

  return (
    <section>
      <EncabezadoPagina titulo="Editar turno" />
      <FormularioTurno
        accion={actualizarTurno.bind(null, turno.id)}
        textoBoton="Guardar cambios"
        clienteInicial={turno.cliente}
        vehiculoIdInicial={turno.vehiculoId}
        valoresIniciales={{
          motivo: turno.motivo,
          fecha,
          hora,
          duracionMin: turno.duracionMin,
        }}
      />
    </section>
  );
}
