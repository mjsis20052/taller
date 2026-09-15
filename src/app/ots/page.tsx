import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";

export const metadata: Metadata = { title: "Órdenes de trabajo" };

export default function PaginaOTs() {
  return (
    <section>
      <EncabezadoPagina
        titulo="Órdenes de trabajo"
        descripcion="Listado de OTs por estado, de turno agendado a entregado."
      />
      <EstadoVacio
        etiquetaFase="Tarea 6"
        titulo="Sin órdenes de trabajo"
        descripcion="Recepción digital, fotos, checklist y timeline por OT se arman en la Tarea 6 del roadmap."
        icono={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        }
      />
    </section>
  );
}
