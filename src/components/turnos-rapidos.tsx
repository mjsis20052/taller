"use client";

import { useCallback, useState } from "react";
import { Drawer } from "vaul";
import { FormularioTurno } from "@/components/formulario-turno";
import { crearTurno } from "@/app/(interno)/agenda/actions";

// Horarios libres del día: un toque en uno abre el turno con fecha y hora ya cargadas.
// "Turno especial" deja elegir cualquier hora y duración (fuera de los horarios fijos).
export function TurnosRapidos({
  fecha,
  etiquetaFecha,
  libres,
  hayHorarios,
  duracionMin,
}: {
  fecha: string;
  etiquetaFecha: string;
  libres: string[];
  hayHorarios: boolean;
  duracionMin: number;
}) {
  const [abierto, setAbierto] = useState(false);
  const [hora, setHora] = useState("");
  const [cliente, setCliente] = useState<string | null>(null);
  const alCambiarCliente = useCallback((nombre: string | null) => setCliente(nombre), []);

  function abrir(horaElegida: string) {
    setHora(horaElegida);
    setAbierto(true);
  }

  return (
    <section className="mb-5 rounded-2xl border border-borde bg-superficie p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[14.5px] font-bold text-foreground">Dar un turno rápido</p>
        {hayHorarios && (
          <span className="rounded-full bg-exito-suave px-2.5 py-1 text-[11px] font-semibold text-exito">
            {libres.length} libre{libres.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {libres.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {libres.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => abrir(h)}
              className="rounded-full bg-primario-suave px-4 py-2 text-[14px] font-bold text-primario active:scale-95"
            >
              {h}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[13px] text-mutado">
          {hayHorarios ? "Ya no quedan horarios libres este día." : "No hay horarios configurados para este día."}
        </p>
      )}

      <button
        type="button"
        onClick={() => abrir("")}
        className="mt-3 w-full rounded-xl border border-dashed border-primario/50 py-2.5 text-[13.5px] font-semibold text-primario"
      >
        + Turno especial (otra hora o duración)
      </button>

      <Drawer.Root open={abierto} onOpenChange={setAbierto}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92vh] max-w-lg flex-col rounded-t-3xl border border-borde bg-superficie outline-none">
            <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-borde" />
            <div className="overflow-y-auto p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
              <Drawer.Title className="text-[19px] font-bold tracking-tight text-foreground">
                {hora ? `Turno a las ${hora}` : "Turno especial"}
              </Drawer.Title>
              <Drawer.Description className="mt-1 text-[13.5px] text-mutado first-letter:uppercase">
                {etiquetaFecha}
              </Drawer.Description>
              {cliente && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primario-suave px-3 py-1 text-[13.5px] font-bold text-primario">
                  Para {cliente}
                </p>
              )}
              <div className="mt-5">
                <FormularioTurno
                  key={`${fecha}-${hora}`}
                  accion={crearTurno}
                  textoBoton="Agendar turno"
                  valoresIniciales={{ motivo: "", fecha, hora, duracionMin }}
                  alCambiarCliente={alCambiarCliente}
                />
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </section>
  );
}
