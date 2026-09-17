"use client";

import { useActionState } from "react";
import { actualizarConfigHorarios } from "@/app/(interno)/configuracion/actions";
import type { ConfigHorarios } from "@/lib/horarios";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario";
const estiloLabel = "block text-[13px] font-medium text-mutado mb-1.5";
const estiloError = "mt-1 text-[12.5px] text-peligro";

const DIAS = [
  { valor: 0, etiqueta: "Domingo" },
  { valor: 1, etiqueta: "Lunes" },
  { valor: 2, etiqueta: "Martes" },
  { valor: 3, etiqueta: "Miércoles" },
  { valor: 4, etiqueta: "Jueves" },
  { valor: 5, etiqueta: "Viernes" },
  { valor: 6, etiqueta: "Sábado" },
];

export function FormularioHorarios({ config }: { config: ConfigHorarios }) {
  const [errores, ejecutarAccion, enviando] = useActionState(actualizarConfigHorarios, {});

  return (
    <form action={ejecutarAccion} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={estiloLabel} htmlFor="apertura">
            Apertura
          </label>
          <input id="apertura" name="apertura" type="time" required defaultValue={config.apertura} className={estiloInput} />
          {errores.apertura && <p className={estiloError}>{errores.apertura}</p>}
        </div>
        <div>
          <label className={estiloLabel} htmlFor="cierre">
            Cierre
          </label>
          <input id="cierre" name="cierre" type="time" required defaultValue={config.cierre} className={estiloInput} />
          {errores.cierre && <p className={estiloError}>{errores.cierre}</p>}
        </div>
      </div>

      <div>
        <label className={estiloLabel} htmlFor="duracionMin">
          Duración de cada turno (minutos)
        </label>
        <input
          id="duracionMin"
          name="duracionMin"
          type="number"
          min={15}
          step={5}
          required
          defaultValue={config.duracionMin}
          className={estiloInput}
        />
        {errores.duracionMin && <p className={estiloError}>{errores.duracionMin}</p>}
      </div>

      <div>
        <label className={estiloLabel}>Días cerrado</label>
        <div className="grid grid-cols-2 gap-2">
          {DIAS.map((dia) => (
            <label
              key={dia.valor}
              className="flex items-center gap-2 rounded-xl border border-borde bg-superficie px-3.5 py-2.5 text-[14px]"
            >
              <input
                type="checkbox"
                name="diasCerrado"
                value={dia.valor}
                defaultChecked={config.diasCerrado.includes(dia.valor)}
              />
              {dia.etiqueta}
            </label>
          ))}
        </div>
      </div>

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
