"use client";

import { useActionState } from "react";
import type { ErroresFormularioRepuesto } from "@/app/stock/actions";

type RepuestoExistente = {
  descripcion: string;
  codigo: string | null;
  proveedor: string | null;
  stockMinimo: number;
  costo: number;
  precioVenta: number;
};

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario";
const estiloLabel = "block text-[13px] font-medium text-mutado mb-1.5";
const estiloError = "mt-1 text-[12.5px] text-peligro";

export function FormularioRepuesto({
  accion,
  repuesto,
  textoBoton,
}: {
  accion: (
    estadoPrevio: ErroresFormularioRepuesto,
    formData: FormData,
  ) => Promise<ErroresFormularioRepuesto>;
  repuesto?: RepuestoExistente;
  textoBoton: string;
}) {
  const [errores, ejecutarAccion, enviando] = useActionState(accion, {});

  return (
    <form action={ejecutarAccion} className="space-y-5">
      <div>
        <label className={estiloLabel} htmlFor="descripcion">
          Descripción
        </label>
        <input
          id="descripcion"
          name="descripcion"
          required
          autoFocus={!repuesto}
          defaultValue={repuesto?.descripcion}
          className={estiloInput}
          placeholder="Filtro de aceite"
        />
        {errores.descripcion && <p className={estiloError}>{errores.descripcion}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={estiloLabel} htmlFor="codigo">
            Código
          </label>
          <input
            id="codigo"
            name="codigo"
            defaultValue={repuesto?.codigo ?? ""}
            className={estiloInput}
            placeholder="opcional"
          />
        </div>
        <div>
          <label className={estiloLabel} htmlFor="proveedor">
            Proveedor
          </label>
          <input
            id="proveedor"
            name="proveedor"
            defaultValue={repuesto?.proveedor ?? ""}
            className={estiloInput}
            placeholder="opcional"
          />
        </div>
      </div>

      {!repuesto && (
        <div>
          <label className={estiloLabel} htmlFor="stock">
            Stock inicial
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            defaultValue={0}
            className={estiloInput}
          />
        </div>
      )}

      <div>
        <label className={estiloLabel} htmlFor="stockMinimo">
          Stock mínimo (alerta)
        </label>
        <input
          id="stockMinimo"
          name="stockMinimo"
          type="number"
          min={0}
          defaultValue={repuesto?.stockMinimo ?? 0}
          className={estiloInput}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={estiloLabel} htmlFor="costo">
            Costo ($)
          </label>
          <input
            id="costo"
            name="costo"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={repuesto?.costo}
            className={estiloInput}
          />
          {errores.costo && <p className={estiloError}>{errores.costo}</p>}
        </div>
        <div>
          <label className={estiloLabel} htmlFor="precioVenta">
            Precio de venta ($)
          </label>
          <input
            id="precioVenta"
            name="precioVenta"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={repuesto?.precioVenta}
            className={estiloInput}
          />
          {errores.precioVenta && <p className={estiloError}>{errores.precioVenta}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-xl bg-primario py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {enviando ? "Guardando…" : textoBoton}
      </button>
    </form>
  );
}
