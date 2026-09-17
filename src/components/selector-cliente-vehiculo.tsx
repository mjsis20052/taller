"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { buscarClientesParaTurno, listarVehiculosDeCliente } from "@/app/(interno)/agenda/actions";

type ClienteSeleccionado = { id: string; nombre: string; telefono: string };
type Vehiculo = { id: string; patente: string; marca: string; modelo: string };

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario";
const estiloLabel = "block text-[13px] font-medium text-mutado mb-1.5";

export function SelectorClienteVehiculo({
  clienteInicial,
  vehiculoIdInicial,
  bloqueado = false,
}: {
  clienteInicial?: ClienteSeleccionado;
  vehiculoIdInicial?: string;
  bloqueado?: boolean;
}) {
  const [cliente, setCliente] = useState<ClienteSeleccionado | null>(clienteInicial ?? null);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<ClienteSeleccionado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [vehiculoId, setVehiculoId] = useState(vehiculoIdInicial ?? "");

  useEffect(() => {
    if (!cliente) return;
    listarVehiculosDeCliente(cliente.id).then((lista) => {
      setVehiculos(lista);
      if (lista.length === 1) setVehiculoId(lista[0].id);
    });
  }, [cliente]);

  function alBuscar(texto: string) {
    setBusqueda(texto);
    if (debounce.current) clearTimeout(debounce.current);
    if (texto.trim().length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    debounce.current = setTimeout(async () => {
      const encontrados = await buscarClientesParaTurno(texto);
      setResultados(encontrados);
      setBuscando(false);
    }, 300);
  }

  return (
    <>
      <div>
        <label className={estiloLabel}>Cliente</label>
        {cliente ? (
          <div className="flex items-center justify-between rounded-xl border border-borde bg-superficie px-3.5 py-3">
            <div>
              <p className="text-[14.5px] font-semibold text-foreground">{cliente.nombre}</p>
              <p className="text-[12.5px] text-mutado">{cliente.telefono}</p>
            </div>
            {!bloqueado && (
              <button
                type="button"
                onClick={() => {
                  setCliente(null);
                  setVehiculos([]);
                  setVehiculoId("");
                }}
                className="text-[13px] font-semibold text-primario"
              >
                Cambiar
              </button>
            )}
          </div>
        ) : (
          <div>
            <input
              value={busqueda}
              onChange={(e) => alBuscar(e.target.value)}
              placeholder="Buscar por nombre o teléfono…"
              className={estiloInput}
            />
            {buscando && <p className="mt-1.5 text-[12.5px] text-mutado">Buscando…</p>}
            {resultados.length > 0 && (
              <div className="mt-1.5 space-y-1.5">
                {resultados.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCliente(c);
                      setResultados([]);
                      setBusqueda("");
                    }}
                    className="block w-full rounded-xl border border-borde bg-superficie px-3.5 py-2.5 text-left text-[14px]"
                  >
                    <span className="font-medium text-foreground">{c.nombre}</span>{" "}
                    <span className="text-mutado">· {c.telefono}</span>
                  </button>
                ))}
              </div>
            )}
            {busqueda.length >= 2 && !buscando && resultados.length === 0 && (
              <p className="mt-1.5 text-[12.5px] text-mutado">
                Sin resultados.{" "}
                <Link href="/clientes/nuevo" className="font-semibold text-primario">
                  Cargar cliente nuevo
                </Link>
              </p>
            )}
          </div>
        )}
        <input type="hidden" name="clienteId" value={cliente?.id ?? ""} />
      </div>

      {cliente && (
        <div>
          <label className={estiloLabel} htmlFor="vehiculoId">
            Vehículo
          </label>
          {vehiculos.length === 0 ? (
            <p className="text-[13.5px] text-mutado">
              Este cliente no tiene vehículos cargados.{" "}
              <Link
                href={`/vehiculos/nuevo?clienteId=${cliente.id}`}
                className="font-semibold text-primario"
              >
                Cargar uno
              </Link>
            </p>
          ) : (
            <select
              id="vehiculoId"
              name="vehiculoId"
              value={vehiculoId}
              onChange={(e) => setVehiculoId(e.target.value)}
              className={estiloInput}
            >
              <option value="">Elegí un vehículo…</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.patente} — {v.marca} {v.modelo}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </>
  );
}
