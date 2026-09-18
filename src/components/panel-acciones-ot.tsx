"use client";

import Link from "next/link";
import { useState } from "react";
import {
  avanzarEstadoOT,
  cancelarOT,
  cargarPresupuesto,
  responderPresupuesto,
  saltarAEjecucion,
} from "@/app/(interno)/ots/actions";
import { entregarSinFacturar, generarSolicitudFacturacion } from "@/app/(interno)/facturacion/actions";

const ETIQUETAS_ESTADO_SOLICITUD: Record<string, string> = {
  PENDIENTE: "Sin enviar todavía",
  ENVIADA: "En cola del estudio",
  FACTURADA: "Facturada",
  ERROR: "Con error",
};

export function PanelAccionesOT({
  otId,
  estado,
  cantidadItems,
  presupuestoPendiente,
  solicitudFacturacion,
}: {
  otId: string;
  estado: string;
  cantidadItems: number;
  presupuestoPendiente: { id: string; total: number } | null;
  solicitudFacturacion: { id: string; estado: string } | null;
}) {
  const [mostrarCancelar, setMostrarCancelar] = useState(false);
  const [validezDias, setValidezDias] = useState(7);
  const [metodoRespuesta, setMetodoRespuesta] = useState("WhatsApp");

  if (estado === "CANCELADA") {
    return (
      <div className="rounded-2xl border border-borde bg-superficie p-4 text-center text-[13.5px] text-mutado">
        OT cancelada.
      </div>
    );
  }

  if (estado === "ENTREGADO") {
    return (
      <div className="rounded-2xl border border-borde bg-superficie p-4 text-center text-[13.5px] text-mutado">
        OT entregada.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {estado === "INGRESADO" && (
        <form action={avanzarEstadoOT.bind(null, otId, undefined)}>
          <button
            type="submit"
            className="w-full rounded-xl bg-primario py-3.5 text-[15px] font-semibold text-white"
          >
            Iniciar diagnóstico
          </button>
        </form>
      )}

      {(estado === "INGRESADO" || estado === "EN_DIAGNOSTICO") && (
        <form action={saltarAEjecucion.bind(null, otId)}>
          <button
            type="submit"
            className="w-full rounded-xl border border-borde bg-superficie py-3 text-[13.5px] font-semibold text-foreground"
          >
            Trabajo chico: ir directo a ejecución
          </button>
        </form>
      )}

      {estado === "EN_DIAGNOSTICO" && (
        <form action={cargarPresupuesto.bind(null, otId)} className="rounded-2xl border border-borde bg-superficie p-4">
          <p className="mb-2 text-[13.5px] font-semibold text-foreground">
            Cargar presupuesto ({cantidadItems} ítem{cantidadItems === 1 ? "" : "s"} cargado{cantidadItems === 1 ? "" : "s"})
          </p>
          <div className="flex items-center gap-2">
            <label className="text-[13px] text-mutado" htmlFor="validezDias">
              Válido por
            </label>
            <input
              id="validezDias"
              name="validezDias"
              type="number"
              min={1}
              value={validezDias}
              onChange={(e) => setValidezDias(Number(e.target.value))}
              className="w-16 rounded-lg border border-borde bg-superficie px-2 py-1.5 text-center text-[13.5px]"
            />
            <span className="text-[13px] text-mutado">días</span>
          </div>
          <button
            type="submit"
            disabled={cantidadItems === 0}
            className="mt-3 w-full rounded-xl bg-primario py-3 text-[14px] font-semibold text-white disabled:opacity-50"
          >
            Enviar presupuesto al cliente
          </button>
          {cantidadItems === 0 && (
            <p className="mt-1.5 text-[12px] text-mutado">Cargá al menos un ítem para presupuestar.</p>
          )}
        </form>
      )}

      {estado === "PRESUPUESTADO" && presupuestoPendiente && (
        <div className="rounded-2xl border border-borde bg-superficie p-4">
          <p className="mb-3 text-[13.5px] font-semibold text-foreground">
            Presupuesto por ${presupuestoPendiente.total.toLocaleString("es-AR")} — respuesta del cliente
          </p>
          <select
            value={metodoRespuesta}
            onChange={(e) => setMetodoRespuesta(e.target.value)}
            className="mb-2 w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-[13.5px]"
          >
            <option value="WhatsApp">Por WhatsApp</option>
            <option value="Llamada">Por llamada</option>
            <option value="Presencial">En persona</option>
          </select>
          <div className="flex gap-2">
            <form
              action={responderPresupuesto.bind(null, otId, presupuestoPendiente.id, "APROBADO", metodoRespuesta)}
              className="flex-1"
            >
              <button type="submit" className="w-full rounded-xl bg-exito py-3 text-[13.5px] font-semibold text-white">
                Aprobado
              </button>
            </form>
            <form
              action={responderPresupuesto.bind(null, otId, presupuestoPendiente.id, "RECHAZADO", undefined)}
              className="flex-1"
            >
              <button type="submit" className="w-full rounded-xl border border-borde py-3 text-[13.5px] font-semibold text-peligro">
                Rechazado
              </button>
            </form>
          </div>
        </div>
      )}

      {estado === "APROBADO" && (
        <form action={avanzarEstadoOT.bind(null, otId, undefined)}>
          <button type="submit" className="w-full rounded-xl bg-primario py-3.5 text-[15px] font-semibold text-white">
            Iniciar ejecución
          </button>
        </form>
      )}

      {estado === "EN_EJECUCION" && (
        <form action={avanzarEstadoOT.bind(null, otId, undefined)}>
          <button
            type="submit"
            disabled={cantidadItems === 0}
            className="w-full rounded-xl bg-primario py-3.5 text-[15px] font-semibold text-white disabled:opacity-50"
          >
            Marcar terminado
          </button>
          {cantidadItems === 0 && (
            <p className="mt-1.5 text-center text-[12px] text-mutado">
              Cargá al menos un ítem para poder terminar.
            </p>
          )}
        </form>
      )}

      {estado === "TERMINADO" && !solicitudFacturacion && (
        <div className="space-y-2">
          <form action={generarSolicitudFacturacion.bind(null, otId)}>
            <button type="submit" className="w-full rounded-xl bg-primario py-3.5 text-[15px] font-semibold text-white">
              Generar solicitud de facturación
            </button>
          </form>
          <form action={entregarSinFacturar.bind(null, otId)}>
            <button
              type="submit"
              className="w-full rounded-xl border border-borde bg-superficie py-3 text-[13.5px] font-semibold text-foreground"
            >
              Entregar sin facturar
            </button>
          </form>
        </div>
      )}

      {estado === "TERMINADO" && solicitudFacturacion && (
        <div className="space-y-2">
          <Link
            href={`/facturacion/${solicitudFacturacion.id}`}
            className="flex items-center justify-between rounded-2xl border border-borde bg-superficie px-4 py-3.5"
          >
            <span className="text-[14px] font-semibold text-foreground">Solicitud de facturación</span>
            <span className="rounded-full bg-alerta-suave px-2.5 py-1 text-[11px] font-semibold text-alerta">
              {ETIQUETAS_ESTADO_SOLICITUD[solicitudFacturacion.estado]}
            </span>
          </Link>
          <form action={entregarSinFacturar.bind(null, otId)}>
            <button
              type="submit"
              className="w-full rounded-xl border border-borde bg-superficie py-3 text-[13.5px] font-semibold text-foreground"
            >
              Entregar sin esperar la factura
            </button>
          </form>
        </div>
      )}

      {estado === "FACTURADO" && (
        <form action={avanzarEstadoOT.bind(null, otId, undefined)}>
          <button type="submit" className="w-full rounded-xl bg-primario py-3.5 text-[15px] font-semibold text-white">
            Registrar entrega
          </button>
        </form>
      )}

      {!mostrarCancelar ? (
        <button
          type="button"
          onClick={() => setMostrarCancelar(true)}
          className="w-full rounded-xl border border-borde bg-superficie py-2.5 text-[13px] font-semibold text-peligro"
        >
          Cancelar OT
        </button>
      ) : (
        <form action={cancelarOT.bind(null, otId)} className="rounded-2xl border border-peligro/30 bg-peligro-suave p-4">
          <label className="mb-1.5 block text-[13px] font-medium text-peligro">
            Motivo de cancelación (obligatorio)
          </label>
          <textarea
            name="motivo"
            required
            rows={2}
            className="w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-[13.5px]"
          />
          <div className="mt-2 flex gap-2">
            <button type="submit" className="flex-1 rounded-xl bg-peligro py-2.5 text-[13px] font-semibold text-white">
              Confirmar cancelación
            </button>
            <button
              type="button"
              onClick={() => setMostrarCancelar(false)}
              className="rounded-xl border border-borde px-4 py-2.5 text-[13px] font-semibold text-foreground"
            >
              Volver
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
