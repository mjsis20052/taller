"use client";

import { useActionState } from "react";
import {
  asignarVehiculoACliente,
  buscarVehiculoParaAsignar,
} from "@/app/vehiculos/actions";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario uppercase";

export function FormularioBuscarVehiculo({ clienteId }: { clienteId: string }) {
  const [resultado, buscar, buscando] = useActionState(
    buscarVehiculoParaAsignar.bind(null, clienteId),
    {},
  );

  return (
    <div className="space-y-4">
      <form action={buscar} className="flex gap-2">
        <input
          name="patente"
          required
          autoFocus
          maxLength={7}
          placeholder="Patente, ej: AB123CD"
          className={estiloInput}
        />
        <button
          type="submit"
          disabled={buscando}
          className="shrink-0 rounded-xl bg-primario px-5 text-[14px] font-semibold text-white disabled:opacity-60"
        >
          {buscando ? "…" : "Buscar"}
        </button>
      </form>

      {resultado.error && <p className="text-[13.5px] text-peligro">{resultado.error}</p>}

      {resultado.vehiculo && (
        <div className="rounded-2xl border border-borde bg-superficie p-4">
          <p className="text-[15px] font-semibold text-foreground">
            {resultado.vehiculo.patente} — {resultado.vehiculo.marca} {resultado.vehiculo.modelo}
          </p>
          {resultado.vehiculo.yaEsDeEsteCliente ? (
            <p className="mt-2 text-[13.5px] text-mutado">
              Ya está asignado a este cliente.
            </p>
          ) : (
            <>
              <p className="mt-1 text-[13.5px] text-mutado">
                Actualmente asignado a {resultado.vehiculo.clienteActualNombre}.
              </p>
              <form
                action={asignarVehiculoACliente.bind(null, resultado.vehiculo.id, clienteId)}
                className="mt-3"
              >
                <button
                  type="submit"
                  className="w-full rounded-xl bg-primario py-3 text-[14px] font-semibold text-white"
                >
                  Asignar a este cliente
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
