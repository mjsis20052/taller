"use client";

import { useActionState } from "react";
import { crearGasto } from "@/app/(interno)/gastos/actions";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario";
const estiloLabel = "block text-[13px] font-medium text-mutado mb-1.5";
const estiloError = "mt-1 text-[12.5px] text-peligro";

const CATEGORIAS = [
  { valor: "REPUESTOS", etiqueta: "Repuestos" },
  { valor: "HERRAMIENTAS", etiqueta: "Herramientas" },
  { valor: "ALQUILER", etiqueta: "Alquiler" },
  { valor: "SERVICIOS", etiqueta: "Servicios" },
  { valor: "OTROS", etiqueta: "Otros" },
];

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function FormularioGasto() {
  const [errores, ejecutarAccion, enviando] = useActionState(crearGasto, {});

  return (
    <form action={ejecutarAccion} className="space-y-5">
      <div>
        <label className={estiloLabel} htmlFor="proveedor">
          Proveedor
        </label>
        <input id="proveedor" name="proveedor" required autoFocus className={estiloInput} placeholder="Repuestos SRL" />
        {errores.proveedor && <p className={estiloError}>{errores.proveedor}</p>}
      </div>

      <div>
        <label className={estiloLabel} htmlFor="categoria">
          Categoría
        </label>
        <select id="categoria" name="categoria" defaultValue="OTROS" className={estiloInput}>
          {CATEGORIAS.map((c) => (
            <option key={c.valor} value={c.valor}>
              {c.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={estiloLabel} htmlFor="monto">
            Monto ($)
          </label>
          <input id="monto" name="monto" type="number" min={0} step="0.01" required className={estiloInput} />
          {errores.monto && <p className={estiloError}>{errores.monto}</p>}
        </div>
        <div>
          <label className={estiloLabel} htmlFor="fecha">
            Fecha
          </label>
          <input id="fecha" name="fecha" type="date" required defaultValue={hoyISO()} className={estiloInput} />
          {errores.fecha && <p className={estiloError}>{errores.fecha}</p>}
        </div>
      </div>

      <div>
        <label className={estiloLabel} htmlFor="notas">
          Notas
        </label>
        <textarea id="notas" name="notas" rows={2} className={estiloInput} placeholder="opcional" />
      </div>

      <div>
        <label className={estiloLabel} htmlFor="foto">
          Foto del ticket (opcional)
        </label>
        <input
          id="foto"
          name="foto"
          type="file"
          accept="image/*"
          capture="environment"
          className="block w-full text-[13.5px] text-mutado"
        />
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-xl bg-primario py-3.5 text-[15px] font-semibold text-white disabled:opacity-60"
      >
        {enviando ? "Guardando…" : "Guardar gasto"}
      </button>
    </form>
  );
}
