"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  buscarClientesParaTurno,
  listarServiciosFrecuentes,
  listarVehiculosDeCliente,
} from "@/app/(interno)/agenda/actions";
import type { ErroresFormularioTurno } from "@/app/(interno)/agenda/actions";

type ClienteSeleccionado = { id: string; nombre: string; telefono: string };
type Vehiculo = { id: string; patente: string; marca: string; modelo: string };
type Servicio = { id: string; nombre: string; duracionMin: number };

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario";
const estiloLabel = "block text-[13px] font-medium text-mutado mb-1.5";
const estiloError = "mt-1 text-[12.5px] text-peligro";

export function FormularioTurno({
  accion,
  textoBoton,
  clienteInicial,
  vehiculoIdInicial,
  valoresIniciales,
  alCambiarCliente,
}: {
  accion: (
    estadoPrevio: ErroresFormularioTurno,
    formData: FormData,
  ) => Promise<ErroresFormularioTurno>;
  textoBoton: string;
  clienteInicial?: ClienteSeleccionado;
  vehiculoIdInicial?: string;
  valoresIniciales?: {
    motivo: string;
    fecha: string;
    hora: string;
    duracionMin: number;
  };
  alCambiarCliente?: (nombre: string | null) => void;
}) {
  const [errores, ejecutarAccion, enviando] = useActionState(accion, {});

  const [cliente, setCliente] = useState<ClienteSeleccionado | null>(clienteInicial ?? null);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<ClienteSeleccionado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listaResultados = useRef<HTMLDivElement>(null);

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [vehiculoId, setVehiculoId] = useState(vehiculoIdInicial ?? "");

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [motivo, setMotivo] = useState(valoresIniciales?.motivo ?? "");
  const [duracionMin, setDuracionMin] = useState(valoresIniciales?.duracionMin ?? 60);

  useEffect(() => {
    listarServiciosFrecuentes().then(setServicios);
  }, []);

  useEffect(() => {
    alCambiarCliente?.(cliente?.nombre ?? null);
  }, [cliente, alCambiarCliente]);

  useEffect(() => {
    if (resultados.length > 0) listaResultados.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [resultados]);

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
    <form action={ejecutarAccion} className="space-y-5">
      <div>
        <label className={estiloLabel}>Cliente</label>
        {cliente ? (
          <div className="flex items-center justify-between rounded-xl border border-borde bg-superficie px-3.5 py-3">
            <div>
              <p className="text-[14.5px] font-semibold text-foreground">{cliente.nombre}</p>
              <p className="text-[12.5px] text-mutado">{cliente.telefono}</p>
            </div>
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
              <div ref={listaResultados} className="mt-1.5 space-y-1.5">
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
        {errores.clienteId && <p className={estiloError}>{errores.clienteId}</p>}
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
          {errores.vehiculoId && <p className={estiloError}>{errores.vehiculoId}</p>}
        </div>
      )}

      {servicios.length > 0 && (
        <div>
          <label className={estiloLabel} htmlFor="servicio">
            Servicio frecuente (opcional)
          </label>
          <select
            id="servicio"
            className={estiloInput}
            defaultValue=""
            onChange={(e) => {
              const servicio = servicios.find((s) => s.id === e.target.value);
              if (servicio) {
                setMotivo(servicio.nombre);
                setDuracionMin(servicio.duracionMin);
              }
            }}
          >
            <option value="">Motivo libre…</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} ({s.duracionMin} min)
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className={estiloLabel} htmlFor="motivo">
          Motivo
        </label>
        <input
          id="motivo"
          name="motivo"
          required
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className={estiloInput}
          placeholder="Cambio de aceite"
        />
        {errores.motivo && <p className={estiloError}>{errores.motivo}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={estiloLabel} htmlFor="fecha">
            Fecha
          </label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            required
            defaultValue={valoresIniciales?.fecha}
            className={estiloInput}
          />
        </div>
        <div>
          <label className={estiloLabel} htmlFor="hora">
            Hora
          </label>
          <input
            id="hora"
            name="hora"
            type="time"
            required
            defaultValue={valoresIniciales?.hora}
            className={estiloInput}
          />
        </div>
        {errores.hora && <p className={`col-span-2 ${estiloError}`}>{errores.hora}</p>}
      </div>

      <div>
        <label className={estiloLabel} htmlFor="duracionMin">
          Duración (minutos)
        </label>
        <input
          id="duracionMin"
          name="duracionMin"
          type="number"
          min={5}
          step={5}
          required
          value={duracionMin}
          onChange={(e) => setDuracionMin(Number(e.target.value))}
          className={estiloInput}
        />
        {errores.duracionMin && <p className={estiloError}>{errores.duracionMin}</p>}
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-xl bg-primario py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {enviando ? "Guardando…" : textoBoton}
      </button>
    </form>
  );
}
