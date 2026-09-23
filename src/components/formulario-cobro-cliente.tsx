"use client";

import { useRef, useState } from "react";
import { registrarCobroCliente } from "@/app/(interno)/cobranzas/actions";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario";
const estiloLabel = "mb-1 block text-[12.5px] font-medium text-mutado";

export function FormularioCobroCliente({
  clienteId,
  saldo,
  pendientes,
}: {
  clienteId: string;
  saldo: number;
  pendientes: { id: string; numero: string; saldo: number }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [concepto, setConcepto] = useState<"PAGO" | "DEVOLUCION">("PAGO");
  const [monto, setMonto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const esDevolucion = concepto === "DEVOLUCION";

  return (
    <form
      ref={formRef}
      action={async (formData: FormData) => {
        setEnviando(true);
        await registrarCobroCliente(clienteId, formData);
        formRef.current?.reset();
        setMonto("");
        setConcepto("PAGO");
        setEnviando(false);
      }}
      className="space-y-3 rounded-2xl border border-dashed border-borde bg-superficie p-4"
    >
      <input type="hidden" name="concepto" value={concepto} />

      <div className="grid grid-cols-2 gap-1 rounded-xl border border-borde bg-background p-1">
        {(["PAGO", "DEVOLUCION"] as const).map((opcion) => (
          <button
            key={opcion}
            type="button"
            onClick={() => setConcepto(opcion)}
            className={`rounded-lg py-2 text-[13.5px] font-semibold ${
              concepto === opcion ? "bg-superficie text-primario shadow-sm" : "text-mutado"
            }`}
          >
            {opcion === "PAGO" ? "Cobrar" : "Devolver plata"}
          </button>
        ))}
      </div>

      <div>
        <label className={estiloLabel} htmlFor={`monto-${clienteId}`}>
          Monto ($)
        </label>
        <input
          id={`monto-${clienteId}`}
          name="monto"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          required
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          placeholder="0"
          className={estiloInput}
        />
        {saldo > 0 && !esDevolucion && (
          <button
            type="button"
            onClick={() => setMonto(String(saldo))}
            className="mt-1.5 text-[12.5px] font-semibold text-primario"
          >
            Cobrar todo: ${saldo.toLocaleString("es-AR")}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={estiloLabel} htmlFor={`metodo-${clienteId}`}>
            {esDevolucion ? "Cómo se devuelve" : "Cómo pagó"}
          </label>
          <select id={`metodo-${clienteId}`} name="metodo" defaultValue="Efectivo" className={estiloInput}>
            <option>Efectivo</option>
            <option>Transferencia</option>
            <option>Tarjeta</option>
            <option>Otro</option>
          </select>
        </div>
        {!esDevolucion && (
          <div>
            <label className={estiloLabel} htmlFor={`destino-${clienteId}`}>
              Aplicar a
            </label>
            <select id={`destino-${clienteId}`} name="destino" defaultValue="auto" className={estiloInput}>
              <option value="auto">Automático</option>
              {pendientes.map((ot) => (
                <option key={ot.id} value={ot.id}>
                  {ot.numero} (debe ${ot.saldo.toLocaleString("es-AR")})
                </option>
              ))}
              <option value="cuenta">A cuenta</option>
            </select>
          </div>
        )}
      </div>

      <input name="notas" placeholder="Nota (opcional)" className={estiloInput} />

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-xl bg-primario py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
      >
        {enviando ? "Guardando…" : esDevolucion ? "Registrar devolución" : "Registrar cobro"}
      </button>
    </form>
  );
}
