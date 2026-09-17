import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { obtenerConfigHorarios } from "@/lib/horarios";
import { FormularioHorarios } from "@/components/formulario-horarios";

export const metadata: Metadata = { title: "Horarios de atención" };

export default async function PaginaConfiguracion() {
  const config = await obtenerConfigHorarios();

  return (
    <section>
      <EncabezadoPagina
        titulo="Horarios de atención"
        descripcion="Define qué horarios puede elegir un cliente al pedir un turno desde el portal."
      />
      <FormularioHorarios config={config} />
    </section>
  );
}
