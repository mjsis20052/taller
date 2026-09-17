import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { FormularioTurno } from "@/components/formulario-turno";
import { crearTurno } from "@/app/(interno)/agenda/actions";

export const metadata: Metadata = { title: "Nuevo turno" };

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function PaginaNuevoTurno({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; vehiculoId?: string; fecha?: string }>;
}) {
  const { clienteId, vehiculoId, fecha } = await searchParams;

  const clienteInicial = clienteId
    ? await prisma.cliente.findUnique({
        where: { id: clienteId },
        select: { id: true, nombre: true, telefono: true },
      })
    : null;

  return (
    <section>
      <EncabezadoPagina titulo="Nuevo turno" />
      <FormularioTurno
        accion={crearTurno}
        textoBoton="Agendar turno"
        clienteInicial={clienteInicial ?? undefined}
        vehiculoIdInicial={vehiculoId}
        valoresIniciales={{
          motivo: "",
          fecha: fecha ?? hoyISO(),
          hora: "09:00",
          duracionMin: 60,
        }}
      />
    </section>
  );
}
