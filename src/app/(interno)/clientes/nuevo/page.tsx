import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { FormularioCliente } from "@/components/formulario-cliente";
import { crearCliente } from "@/app/(interno)/clientes/actions";

export const metadata: Metadata = { title: "Nuevo cliente" };

export default function PaginaNuevoCliente() {
  return (
    <section>
      <EncabezadoPagina titulo="Nuevo cliente" />
      <FormularioCliente accion={crearCliente} textoBoton="Guardar cliente" />
    </section>
  );
}
