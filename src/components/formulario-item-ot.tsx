"use client";

import { useRef } from "react";
import { agregarItemOT } from "@/app/ots/actions";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3 py-2.5 text-[14px] text-foreground outline-none focus:border-primario";

export function FormularioItemOT({ otId }: { otId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData: FormData) => {
        await agregarItemOT(otId, formData);
        formRef.current?.reset();
      }}
      className="space-y-2 rounded-xl border border-dashed border-borde bg-superficie p-3"
    >
      <div className="grid grid-cols-2 gap-2">
        <select name="tipo" defaultValue="MANO_OBRA" className={estiloInput}>
          <option value="MANO_OBRA">Mano de obra</option>
          <option value="REPUESTO">Repuesto</option>
        </select>
        <input
          name="cantidad"
          type="number"
          min={1}
          step={1}
          defaultValue={1}
          required
          placeholder="Cant."
          className={estiloInput}
        />
      </div>
      <input
        name="descripcion"
        required
        placeholder="Descripción"
        className={estiloInput}
      />
      <input
        name="precioUnitario"
        type="number"
        min={0}
        step="0.01"
        required
        placeholder="Precio unitario ($)"
        className={estiloInput}
      />
      <button
        type="submit"
        className="w-full rounded-xl bg-primario py-2.5 text-[13.5px] font-semibold text-white"
      >
        Agregar ítem
      </button>
    </form>
  );
}
