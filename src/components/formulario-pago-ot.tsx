"use client";

import { useRef, useState } from "react";
import { registrarPagoOT } from "@/app/(interno)/cobranzas/actions";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[14.5px] text-foreground outline-none focus:border-primario";
const estiloLabel = "mb-1 block text-[12.5px] font-medium text-mutado";

export function FormularioPagoOT({ otId, saldo }: { otId: string; saldo: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [enviando, setEnviando] = useState(false);

  return (
    <form
      ref={formRef}
      action={async (formData: FormData) => {
        setEnviando(true);
        await registrarPagoOT(otId, formData);
        formRef.current?.reset();
        setEnviando(false);
      }}
      className="space-y-3 rounded-2xl border border-dashed border-borde bg-superficie p-4"
    >
      <p className="text-[13.5px] font-semibold text-foreground">Registrar un pago o una seña</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={estiloLabel} htmlFor="pago-concepto">
            Tipo
          </label>
          <select id="pago-concepto" name="concepto" defaultValue="PAGO" className={estiloInput}>
            <option value="SENA">Seña</option>
            <option value="PAGO">Pago</option>
          </select>
        </div>
        <div>
          <label className={estiloLabel} htmlFor="pago-metodo">
            Cómo pagó
          </label>
          <select id="pago-metodo" name="metodo" defaultValue="Efectivo" className={estiloInput}>
            <option>Efectivo</option>
            <option>Transferencia</option>
            <option>Tarjeta</option>
            <option>Otro</option>
          </select>
        </div>
      </div>

      <div>
        <label className={estiloLabel} htmlFor="pago-monto">
          Monto ($)
        </label>
        <input
          id="pago-monto"
          name="monto"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          required
          placeholder={saldo > 0 ? `Saldo: ${saldo.toLocaleString("es-AR")}` : "0"}
          className={estiloInput}
        />
      </div>

      <input name="notas" placeholder="Nota (opcional)" className={estiloInput} />

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-xl bg-primario py-3 text-[14px] font-semibold text-white disabled:opacity-60"
      >
        {enviando ? "Guardando…" : "Registrar pago"}
      </button>
    </form>
  );
}
