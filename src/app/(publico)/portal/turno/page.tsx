import type { Metadata } from "next";
import { FormularioTurnoPublico } from "@/components/formulario-turno-publico";

export const metadata: Metadata = { title: "Pedir turno" };

export default function PaginaTurnoPublico() {
  return (
    <div>
      <h1 className="text-[26px] font-bold tracking-tight text-foreground">Pedir turno</h1>
      <p className="mt-1.5 text-[14.5px] text-mutado">
        Completá tus datos y te confirmamos el turno por WhatsApp.
      </p>
      <div className="mt-6 rounded-3xl border border-borde bg-superficie p-6">
        <FormularioTurnoPublico />
      </div>
    </div>
  );
}
