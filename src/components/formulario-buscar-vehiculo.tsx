"use client";

import { useEffect, useRef, useState } from "react";
import {
  asignarVehiculoACliente,
  listarVehiculosParaAsignar,
} from "@/app/(interno)/vehiculos/actions";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario uppercase";

type VehiculoResultado = {
  id: string;
  patente: string;
  marca: string;
  modelo: string;
  clienteActualNombre: string;
  yaEsDeEsteCliente: boolean;
};

export function FormularioBuscarVehiculo({ clienteId }: { clienteId: string }) {
  const [busqueda, setBusqueda] = useState("");
  const [vehiculos, setVehiculos] = useState<VehiculoResultado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState<VehiculoResultado | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    listarVehiculosParaAsignar(clienteId, "").then((lista) => {
      setVehiculos(lista);
      setCargando(false);
    });
  }, [clienteId]);

  function alBuscar(texto: string) {
    setBusqueda(texto);
    setSeleccionado(null);
    if (debounce.current) clearTimeout(debounce.current);
    setCargando(true);
    debounce.current = setTimeout(async () => {
      const lista = await listarVehiculosParaAsignar(clienteId, texto);
      setVehiculos(lista);
      setCargando(false);
    }, 250);
  }

  return (
    <div className="space-y-4">
      <input
        value={busqueda}
        onChange={(e) => alBuscar(e.target.value)}
        autoFocus
        placeholder="Patente, marca o modelo…"
        className={estiloInput}
      />

      {seleccionado ? (
        <div className="rounded-2xl border border-borde bg-superficie p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[15px] font-semibold text-foreground">
              {seleccionado.patente} — {seleccionado.marca} {seleccionado.modelo}
            </p>
            <button
              type="button"
              onClick={() => setSeleccionado(null)}
              className="text-[13px] font-semibold text-primario"
            >
              Volver
            </button>
          </div>
          {seleccionado.yaEsDeEsteCliente ? (
            <p className="text-[13.5px] text-mutado">Ya está asignado a este cliente.</p>
          ) : (
            <>
              <p className="mb-3 text-[13.5px] text-mutado">
                Actualmente asignado a {seleccionado.clienteActualNombre}.
              </p>
              <form action={asignarVehiculoACliente.bind(null, seleccionado.id, clienteId)}>
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
      ) : cargando ? (
        <p className="text-center text-[13.5px] text-mutado">Buscando…</p>
      ) : vehiculos.length === 0 ? (
        <p className="text-center text-[13.5px] text-mutado">
          {busqueda ? `Sin resultados para "${busqueda}".` : "Todavía no hay vehículos cargados."}
        </p>
      ) : (
        <div className="space-y-2">
          {vehiculos.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSeleccionado(v)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-borde bg-superficie px-4 py-3.5 text-left active:bg-black/[0.03]"
            >
              <div className="min-w-0">
                <p className="truncate text-[14.5px] font-semibold text-foreground">
                  {v.patente} — {v.marca} {v.modelo}
                </p>
                <p className="truncate text-[12.5px] text-mutado">
                  {v.yaEsDeEsteCliente ? "Ya es de este cliente" : v.clienteActualNombre}
                </p>
              </div>
              <span className="text-mutado">›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
