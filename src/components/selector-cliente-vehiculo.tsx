"use client";

import { useEffect, useRef, useState } from "react";
import { buscarClientesParaTurno, listarVehiculosDeCliente } from "@/app/(interno)/agenda/actions";

type ClienteSeleccionado = { id: string; nombre: string; telefono: string };
type Vehiculo = { id: string; patente: string; marca: string; modelo: string };

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario";
const estiloLabel = "block text-[13px] font-medium text-mutado mb-1.5";
const NUEVO = "__nuevo";

// Elige el cliente y el vehículo de la recepción. Si el cliente no está cargado se crea
// acá mismo (nombre y teléfono) y lo mismo con el vehículo (patente, marca y modelo).
// Todos los campos guardan su valor en estado, así que no se borran al cambiar de campo.
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
  const [clienteNuevo, setClienteNuevo] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [telefonoNuevo, setTelefonoNuevo] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<ClienteSeleccionado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [vehiculosCargados, setVehiculosCargados] = useState(false);
  const [vehiculoId, setVehiculoId] = useState(vehiculoIdInicial ?? "");
  const [patenteNueva, setPatenteNueva] = useState("");
  const [marcaNueva, setMarcaNueva] = useState("");
  const [modeloNuevo, setModeloNuevo] = useState("");

  useEffect(() => {
    if (!cliente) return;
    let cancelado = false;
    async function cargar(clienteId: string) {
      const lista = await listarVehiculosDeCliente(clienteId);
      if (cancelado) return;
      setVehiculos(lista);
      setVehiculosCargados(true);
      if (lista.length === 1) setVehiculoId(lista[0].id);
    }
    void cargar(cliente.id);
    return () => {
      cancelado = true;
    };
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

  const hayClienteElegido = cliente !== null;
  const hayClienteNuevo = !hayClienteElegido && clienteNuevo;
  const pedirVehiculoNuevo =
    hayClienteNuevo || (hayClienteElegido && vehiculosCargados && (vehiculos.length === 0 || vehiculoId === NUEVO));

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
                  setVehiculosCargados(false);
                  setVehiculoId("");
                }}
                className="text-[13px] font-semibold text-primario"
              >
                Cambiar
              </button>
            )}
          </div>
        ) : clienteNuevo ? (
          <div className="space-y-3 rounded-xl border border-primario/40 bg-primario-suave/40 p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[13.5px] font-bold text-primario">Cliente nuevo</p>
              <button
                type="button"
                onClick={() => setClienteNuevo(false)}
                className="text-[12.5px] font-semibold text-mutado"
              >
                Buscar uno existente
              </button>
            </div>
            <input
              name="clienteNuevoNombre"
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              placeholder="Nombre y apellido"
              autoComplete="off"
              className={estiloInput}
            />
            <input
              name="clienteNuevoTelefono"
              type="tel"
              inputMode="tel"
              value={telefonoNuevo}
              onChange={(e) => setTelefonoNuevo(e.target.value)}
              placeholder="Teléfono (ej: 2245506078)"
              autoComplete="off"
              className={estiloInput}
            />
            <p className="text-[12px] text-mutado">El +549 se agrega solo.</p>
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
            <button
              type="button"
              onClick={() => {
                setNombreNuevo((actual) => actual || busqueda.trim());
                setClienteNuevo(true);
                setResultados([]);
              }}
              className="mt-2 w-full rounded-xl border border-dashed border-primario/50 py-2.5 text-[13.5px] font-semibold text-primario"
            >
              + El cliente no está cargado: crear cliente nuevo
            </button>
          </div>
        )}
        <input type="hidden" name="clienteId" value={cliente?.id ?? ""} />
      </div>

      {hayClienteElegido && vehiculosCargados && vehiculos.length > 0 && (
        <div>
          <label className={estiloLabel} htmlFor="vehiculoId">
            Vehículo
          </label>
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
            <option value={NUEVO}>+ Otro vehículo (cargar nuevo)</option>
          </select>
        </div>
      )}

      {pedirVehiculoNuevo && (
        <div className="space-y-3 rounded-xl border border-primario/40 bg-primario-suave/40 p-3.5">
          <p className="text-[13.5px] font-bold text-primario">Vehículo nuevo</p>
          <input
            name="vehiculoNuevoPatente"
            value={patenteNueva}
            onChange={(e) => setPatenteNueva(e.target.value)}
            placeholder="Patente (cualquier formato)"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            className={`${estiloInput} uppercase`}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="vehiculoNuevoMarca"
              value={marcaNueva}
              onChange={(e) => setMarcaNueva(e.target.value)}
              placeholder="Marca"
              autoComplete="off"
              className={estiloInput}
            />
            <input
              name="vehiculoNuevoModelo"
              value={modeloNuevo}
              onChange={(e) => setModeloNuevo(e.target.value)}
              placeholder="Modelo"
              autoComplete="off"
              className={estiloInput}
            />
          </div>
        </div>
      )}
    </>
  );
}
