import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";

export const metadata: Metadata = { title: "Agenda" };

export default function PaginaAgenda() {
  return (
    <section>
      <EncabezadoPagina
        titulo="Agenda"
        descripcion="Turnos por día y por semana."
      />
      <EstadoVacio
        etiquetaFase="Tarea 5"
        titulo="Sin turnos cargados"
        descripcion="La vista de día y semana, con alta rápida de turno, se arma en la Tarea 5 del roadmap."
        icono={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
          </svg>
        }
      />
    </section>
  );
}
