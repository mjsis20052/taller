"use client";

import { useActionState, useState } from "react";
import { actualizarConfigHorarios } from "@/app/(interno)/configuracion/actions";
import { DIAS_SEMANA, esHoraValida, type ConfigHorarios } from "@/lib/horarios-comunes";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario";
const estiloLabel = "block text-[13px] font-medium text-mutado mb-1.5";

export function FormularioHorarios({ config }: { config: ConfigHorarios }) {
  const [estado, ejecutarAccion, enviando] = useActionState(actualizarConfigHorarios, {});
  const [horarios, setHorarios] = useState<Record<number, string[]>>(config.horarios);
  const [nuevaHora, setNuevaHora] = useState<Record<number, string>>({});

  function agregar(dia: number) {
    const hora = nuevaHora[dia] ?? "";
    if (!esHoraValida(hora)) return;
    setHorarios((prev) => ({ ...prev, [dia]: [...new Set([...(prev[dia] ?? []), hora])].sort() }));
    setNuevaHora((prev) => ({ ...prev, [dia]: "" }));
  }

  function quitar(dia: number, hora: string) {
    setHorarios((prev) => ({ ...prev, [dia]: (prev[dia] ?? []).filter((h) => h !== hora) }));
  }

  function repetirEnLaborables(diaOrigen: number) {
    setHorarios((prev) => {
      const copia = { ...prev };
      for (const dia of [1, 2, 3, 4, 5]) copia[dia] = [...(prev[diaOrigen] ?? [])];
      return copia;
    });
  }

  return (
    <form action={ejecutarAccion} className="space-y-5">
      <div>
        <label className={estiloLabel} htmlFor="duracionMin">
          Duración de cada turno (minutos)
        </label>
        <input
          id="duracionMin"
          name="duracionMin"
          type="number"
          min={5}
          step={5}
          required
          defaultValue={config.duracionMin}
          className={estiloInput}
        />
        {estado.duracionMin && <p className="mt-1 text-[12.5px] text-peligro">{estado.duracionMin}</p>}
      </div>

      <div className="space-y-3">
        <p className={estiloLabel}>Horarios de cada día</p>
        {DIAS_SEMANA.map((dia) => {
          const horas = horarios[dia.valor] ?? [];
          return (
            <div key={dia.valor} className="rounded-2xl border border-borde bg-superficie p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[15px] font-semibold text-foreground">{dia.etiqueta}</p>
                {horas.length === 0 ? (
                  <span className="rounded-full bg-peligro-suave px-2.5 py-1 text-[11px] font-semibold text-peligro">
                    Cerrado
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => repetirEnLaborables(dia.valor)}
                    className="text-[12px] font-semibold text-primario"
                  >
                    Repetir en lun–vie
                  </button>
                )}
              </div>

              {horas.map((hora) => (
                <input key={hora} type="hidden" name={`horas-${dia.valor}`} value={hora} />
              ))}

              {horas.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {horas.map((hora) => (
                    <span
                      key={hora}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primario-suave py-1.5 pl-3 pr-2 text-[13.5px] font-semibold text-primario"
                    >
                      {hora}
                      <button
                        type="button"
                        onClick={() => quitar(dia.valor, hora)}
                        aria-label={`Quitar ${hora} del ${dia.etiqueta}`}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[15px] leading-none hover:bg-primario hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <input
                  type="time"
                  aria-label={`Nuevo horario para el ${dia.etiqueta}`}
                  value={nuevaHora[dia.valor] ?? ""}
                  onChange={(e) => setNuevaHora((prev) => ({ ...prev, [dia.valor]: e.target.value }))}
                  className={estiloInput}
                />
                <button
                  type="button"
                  onClick={() => agregar(dia.valor)}
                  disabled={!esHoraValida(nuevaHora[dia.valor] ?? "")}
                  className="shrink-0 rounded-xl border border-borde bg-superficie px-4 text-[14px] font-semibold text-primario disabled:opacity-40"
                >
                  Agregar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {estado.ok && !enviando && (
        <p className="rounded-xl bg-exito-suave px-4 py-3 text-[13.5px] font-semibold text-exito">
          Horarios guardados. Ya se ven en el portal.
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-xl bg-primario py-3.5 text-[15px] font-semibold text-white disabled:opacity-60"
      >
        {enviando ? "Guardando…" : "Guardar horarios"}
      </button>
    </form>
  );
}
