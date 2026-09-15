import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { FormularioGasto } from "@/components/formulario-gasto";

export const metadata: Metadata = { title: "Nuevo gasto" };

export default function PaginaNuevoGasto() {
  return (
    <section>
      <EncabezadoPagina titulo="Nuevo gasto" />
      <FormularioGasto />
    </section>
  );
}
