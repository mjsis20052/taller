"use client";

import { useActionState, useState } from "react";
import { actualizarConfigHorarios } from "@/app/(interno)/configuracion/actions";
import { DIAS_SEMANA, esHoraValida, type ConfigHorarios } from "@/lib/horarios-comunes";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario";
const estiloLabel = "block text-[13px] font-medium text-mutado mb-1.5";

type DiaEspecial = { fecha: string; horas: string[] };

function etiquetaFecha(fecha: string): string {
  return new Date(`${fecha}T12:00:00`).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

export function FormularioHorarios({ config, hoy }: { config: ConfigHorarios; hoy: string }) {
  const [estado, ejecutarAccion, enviando] = useActionState(actualizarConfigHorarios, {});
  const [horarios, setHorarios] = useState<Record<number, string[]>>(config.horarios);
  const [nuevaHora, setNuevaHora] = useState<Record<number, string>>({});
  const [especiales, setEspeciales] = useState<DiaEspecial[]>(
    Object.entries(config.especiales)
      .filter(([fecha]) => fecha >= hoy)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, horas]) => ({ fecha, horas })),
  );
  const [fechaNueva, setFechaNueva] = useState("");
  const [horaEspecial, setHoraEspecial] = useState<Record<string, string>>({});

  function agregarDiaEspecial() {
    if (!fechaNueva || fechaNueva < hoy || especiales.some((e) => e.fecha === fechaNueva)) return;
    setEspeciales((prev) => [...prev, { fecha: fechaNueva, horas: [] }].sort((a, b) => a.fecha.localeCompare(b.fecha)));
    setFechaNueva("");
  }

  function agregarHoraEspecial(fecha: string) {
    const hora = horaEspecial[fecha] ?? "";
    if (!esHoraValida(hora)) return;
    setEspeciales((prev) =>
      prev.map((e) => (e.fecha === fecha ? { ...e, horas: [...new Set([...e.horas, hora])].sort() } : e)),
    );
    setHoraEspecial((prev) => ({ ...prev, [fecha]: "" }));
  }

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


      <div className="space-y-3">
        <div>
          <p className={estiloLabel}>Días especiales</p>
          <p className="-mt-1 mb-2 text-[12.5px] text-mutado">
            Un feriado (dejalo sin horarios, queda cerrado) o un día con horarios distintos a los de siempre.
          </p>
        </div>
        <input type="hidden" name="especiales" value={JSON.stringify(especiales)} />

        {especiales.map((dia) => (
          <div key={dia.fecha} className="rounded-2xl border border-borde bg-superficie p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[15px] font-semibold capitalize text-foreground">{etiquetaFecha(dia.fecha)}</p>
              <button
                type="button"
                onClick={() => setEspeciales((prev) => prev.filter((e) => e.fecha !== dia.fecha))}
                className="text-[12px] font-semibold text-peligro"
              >
                Quitar día
              </button>
            </div>
            {dia.horas.length === 0 ? (
              <p className="mt-2 inline-block rounded-full bg-peligro-suave px-2.5 py-1 text-[11px] font-semibold text-peligro">
                Cerrado ese día
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {dia.horas.map((hora) => (
                  <span
                    key={hora}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primario-suave py-1.5 pl-3 pr-2 text-[13.5px] font-semibold text-primario"
                  >
                    {hora}
                    <button
                      type="button"
                      onClick={() =>
                        setEspeciales((prev) =>
                          prev.map((e) => (e.fecha === dia.fecha ? { ...e, horas: e.horas.filter((h) => h !== hora) } : e)),
                        )
                      }
                      aria-label={`Quitar ${hora}`}
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
                aria-label={`Nuevo horario para el ${etiquetaFecha(dia.fecha)}`}
                value={horaEspecial[dia.fecha] ?? ""}
                onChange={(e) => setHoraEspecial((prev) => ({ ...prev, [dia.fecha]: e.target.value }))}
                className={estiloInput}
              />
              <button
                type="button"
                onClick={() => agregarHoraEspecial(dia.fecha)}
                disabled={!esHoraValida(horaEspecial[dia.fecha] ?? "")}
                className="shrink-0 rounded-xl border border-borde bg-superficie px-4 text-[14px] font-semibold text-primario disabled:opacity-40"
              >
                Agregar
              </button>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <input
            type="date"
            aria-label="Fecha del día especial"
            min={hoy}
            value={fechaNueva}
            onChange={(e) => setFechaNueva(e.target.value)}
            className={estiloInput}
          />
          <button
            type="button"
            onClick={agregarDiaEspecial}
            disabled={!fechaNueva || fechaNueva < hoy}
            className="shrink-0 rounded-xl bg-primario px-4 text-[14px] font-semibold text-white disabled:opacity-40"
          >
            Agregar día
          </button>
        </div>
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
