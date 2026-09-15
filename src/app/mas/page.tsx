import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";

export const metadata: Metadata = { title: "Más" };

export default function PaginaMas() {
  return (
    <section>
      <EncabezadoPagina
        titulo="Más"
        descripcion="Clientes, vehículos, stock, gastos, cobranzas y facturación."
      />
      <EstadoVacio
        etiquetaFase="Fases 1, 3 y 4"
        titulo="Todavía no hay secciones activas"
        descripcion="Clientes y vehículos llegan en las Tareas 3 y 4. Stock, cobranzas y facturación, en fases siguientes."
        icono={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        }
      />
    </section>
  );
}
