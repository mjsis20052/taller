import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { hoyEnArgentina, obtenerConfigHorarios } from "@/lib/horarios";
import { FormularioHorarios } from "@/components/formulario-horarios";

export const metadata: Metadata = { title: "Horarios de atención" };

export default async function PaginaConfiguracion() {
  const config = await obtenerConfigHorarios();

  return (
    <section>
      <EncabezadoPagina
        titulo="Horarios de atención"
        descripcion="Cargá las horas exactas de cada día (ej: martes 10:00, 12:00 y 15:00). Solo esas puede elegir el cliente en el portal."
      />
      <FormularioHorarios config={config} hoy={hoyEnArgentina()} />
    </section>
  );
}
