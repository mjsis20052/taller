import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { FormularioRepuesto } from "@/components/formulario-repuesto";
import { crearRepuesto } from "@/app/stock/actions";

export const metadata: Metadata = { title: "Nuevo repuesto" };

export default function PaginaNuevoRepuesto() {
  return (
    <section>
      <EncabezadoPagina titulo="Nuevo repuesto" />
      <FormularioRepuesto accion={crearRepuesto} textoBoton="Guardar repuesto" />
    </section>
  );
}
