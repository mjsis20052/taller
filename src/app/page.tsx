import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";

export default function Inicio() {
  return (
    <section>
      <EncabezadoPagina
        titulo="Inicio"
        descripcion="Los turnos de hoy y las OTs activas, de un vistazo."
      />
      <EstadoVacio
        etiquetaFase="Tareas 5 y 6"
        titulo="Todavía no hay nada para mostrar"
        descripcion="Cuando cargues turnos y órdenes de trabajo, acá vas a ver el resumen del día."
        icono={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        }
      />
    </section>
  );
}
