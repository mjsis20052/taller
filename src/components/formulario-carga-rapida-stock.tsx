"use client";

import { useActionState } from "react";
import { crearRepuestoRapido } from "@/app/(interno)/stock/actions";

const estiloInput =
  "w-full rounded-lg border border-borde bg-superficie px-2.5 py-2 text-[13.5px] text-foreground outline-none focus:border-primario";

export function FormularioCargaRapidaStock() {
  const [errores, ejecutarAccion, enviando] = useActionState(crearRepuestoRapido, {});

  return (
    <form
      action={ejecutarAccion}
      className="mb-4 rounded-2xl border border-dashed border-borde bg-superficie p-3 lg:p-4"
    >
      <p className="mb-2.5 text-[12.5px] font-semibold uppercase tracking-wide text-mutado">
        Carga rápida
      </p>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-6">
        <div className="col-span-2 lg:col-span-2">
          <input
            name="descripcion"
            required
            autoFocus
            placeholder="Descripción"
            className={estiloInput}
          />
          {errores.descripcion && (
            <p className="mt-1 text-[11.5px] text-peligro">{errores.descripcion}</p>
          )}
        </div>
        <input name="codigo" placeholder="Código (opcional)" className={estiloInput} />
        <input
          name="stock"
          type="number"
          min={0}
          defaultValue={0}
          placeholder="Stock inicial"
          className={estiloInput}
        />
        <div>
          <input
            name="costo"
            type="number"
            min={0}
            step="0.01"
            required
            placeholder="Costo"
            className={estiloInput}
          />
          {errores.costo && <p className="mt-1 text-[11.5px] text-peligro">{errores.costo}</p>}
        </div>
        <div>
          <input
            name="precioVenta"
            type="number"
            min={0}
            step="0.01"
            required
            placeholder="Precio de venta"
            className={estiloInput}
          />
          {errores.precioVenta && (
            <p className="mt-1 text-[11.5px] text-peligro">{errores.precioVenta}</p>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={enviando}
        className="mt-2.5 w-full rounded-lg bg-primario py-2.5 text-[13px] font-semibold text-white disabled:opacity-60 lg:w-auto lg:px-6"
      >
        {enviando ? "Guardando…" : "Agregar y seguir cargando"}
      </button>
    </form>
  );
}
