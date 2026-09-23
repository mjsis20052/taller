"use client";

import { useState } from "react";
import { responderPresupuestoCliente } from "@/app/(publico)/informe/actions";
import type { PresupuestoInforme } from "@/lib/informe";
import { pesos } from "@/lib/formato";

// El cliente ve el presupuesto y lo aprueba o rechaza con un toque desde su informe.
export function AprobarPresupuesto({ token, presupuesto }: { token: string; presupuesto: PresupuestoInforme }) {
  const [enviando, setEnviando] = useState<null | "APROBADO" | "RECHAZADO">(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmarRechazo, setConfirmarRechazo] = useState(false);

  async function responder(resultado: "APROBADO" | "RECHAZADO") {
    setEnviando(resultado);
    setError(null);
    const respuesta = await responderPresupuestoCliente(token, presupuesto.id, resultado);
    if (!respuesta.ok) setError(respuesta.error ?? "No se pudo enviar. Probá de nuevo.");
    setEnviando(null);
    // Al aprobar/rechazar la página se vuelve a pedir sola y esta tarjeta desaparece.
    if (respuesta.ok) window.location.reload();
  }

  return (
    <section className="rounded-3xl border-2 border-primario bg-superficie p-5 shadow-lg shadow-primario/10">
      <p className="text-[12px] font-bold uppercase tracking-widest text-primario">Necesitamos tu OK</p>
      <h2 className="mt-1 text-[20px] font-extrabold tracking-tight text-foreground">Presupuesto para aprobar</h2>

      <ul className="mt-3 divide-y divide-borde">
        {presupuesto.items.map((item, i) => (
          <li key={i} className="flex items-start justify-between gap-3 py-2.5 text-[14px]">
            <span className="min-w-0 text-foreground">
              {item.tipo === "MANO_OBRA" && item.falla && <span className="block text-[12.5px] text-mutado">{item.falla}</span>}
              {item.descripcion}
              {item.tipo === "REPUESTO" && item.cantidad !== 1 ? ` ×${item.cantidad}` : ""}
            </span>
            <span className="shrink-0 font-bold text-foreground">{pesos(item.cantidad * item.precioUnitario)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-center justify-between rounded-xl bg-primario-suave px-4 py-3">
        <span className="text-[14px] font-bold text-primario">Total</span>
        <span className="text-[20px] font-extrabold text-primario">{pesos(presupuesto.total)}</span>
      </div>
      <p className="mt-2 text-[12px] text-mutado">Válido por {presupuesto.validezDias} días.</p>

      {error && <p className="mt-3 rounded-lg bg-peligro/10 px-3 py-2 text-[13px] font-medium text-peligro">{error}</p>}

      {!confirmarRechazo ? (
        <div className="mt-4 space-y-2.5">
          <button
            type="button"
            disabled={enviando !== null}
            onClick={() => responder("APROBADO")}
            className="w-full rounded-xl bg-exito py-4 text-[16px] font-extrabold text-white active:scale-[0.98] disabled:opacity-60"
          >
            {enviando === "APROBADO" ? "Enviando…" : "Aprobar presupuesto ✓"}
          </button>
          <button
            type="button"
            disabled={enviando !== null}
            onClick={() => setConfirmarRechazo(true)}
            className="w-full rounded-xl py-3 text-[14px] font-semibold text-mutado"
          >
            No lo apruebo
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-borde bg-background p-4">
          <p className="text-[14px] font-semibold text-foreground">¿Seguro que no querés aprobarlo?</p>
          <p className="mt-0.5 text-[12.5px] text-mutado">Le avisamos al taller y se pone en contacto con vos.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmarRechazo(false)}
              className="flex-1 rounded-xl border border-borde py-3 text-[14px] font-semibold text-foreground"
            >
              Volver
            </button>
            <button
              type="button"
              disabled={enviando !== null}
              onClick={() => responder("RECHAZADO")}
              className="flex-1 rounded-xl bg-peligro py-3 text-[14px] font-bold text-white disabled:opacity-60"
            >
              {enviando === "RECHAZADO" ? "Enviando…" : "Sí, rechazar"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
