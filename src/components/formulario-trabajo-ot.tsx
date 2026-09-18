"use client";

import { useRef, useState } from "react";
import { agregarTrabajoOT } from "@/app/(interno)/ots/actions";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[14.5px] text-foreground outline-none focus:border-primario";
const estiloLabel = "mb-1 block text-[12.5px] font-medium text-mutado";

export function FormularioTrabajoOT({ otId }: { otId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [enviando, setEnviando] = useState(false);

  return (
    <form
      ref={formRef}
      action={async (formData: FormData) => {
        setEnviando(true);
        await agregarTrabajoOT(otId, formData);
        formRef.current?.reset();
        setEnviando(false);
      }}
      className="space-y-3 rounded-2xl border border-dashed border-borde bg-superficie p-4"
    >
      <div>
        <label className={estiloLabel} htmlFor="falla">
          Falla encontrada
        </label>
        <textarea
          id="falla"
          name="falla"
          rows={2}
          placeholder="Ej: pastillas de freno gastadas, disco rayado"
          className={estiloInput}
        />
      </div>
      <div>
        <label className={estiloLabel} htmlFor="solucion">
          Solución propuesta
        </label>
        <textarea
          id="solucion"
          name="solucion"
          rows={2}
          required
          placeholder="Ej: cambiar pastillas y rectificar discos"
          className={estiloInput}
        />
      </div>
      <div>
        <label className={estiloLabel} htmlFor="precio">
          Precio del trabajo ($)
        </label>
        <input
          id="precio"
          name="precio"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          required
          placeholder="0"
          className={estiloInput}
        />
      </div>
      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-xl bg-primario py-3 text-[14px] font-semibold text-white disabled:opacity-60"
      >
        {enviando ? "Agregando…" : "Agregar trabajo"}
      </button>
    </form>
  );
}
