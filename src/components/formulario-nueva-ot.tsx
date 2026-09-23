"use client";

import { useActionState, useState } from "react";
import { SelectorClienteVehiculo } from "@/components/selector-cliente-vehiculo";
import type { ErroresFormularioOT } from "@/app/(interno)/ots/actions";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario";
const estiloLabel = "block text-[13px] font-medium text-mutado mb-1.5";
const estiloError = "mt-1 text-[12.5px] text-peligro";

const NIVELES_COMBUSTIBLE = [
  { valor: "VACIO", etiqueta: "Vacío" },
  { valor: "UN_CUARTO", etiqueta: "1/4" },
  { valor: "MEDIO", etiqueta: "1/2" },
  { valor: "TRES_CUARTOS", etiqueta: "3/4" },
  { valor: "LLENO", etiqueta: "Lleno" },
];

export function FormularioNuevaOT({
  accion,
  clienteInicial,
  vehiculoIdInicial,
  motivoInicial,
}: {
  accion: (
    estadoPrevio: ErroresFormularioOT,
    formData: FormData,
  ) => Promise<ErroresFormularioOT>;
  clienteInicial?: { id: string; nombre: string; telefono: string };
  vehiculoIdInicial?: string;
  motivoInicial?: string;
}) {
  const [errores, ejecutarAccion, enviando] = useActionState(accion, {});
  const [motivo, setMotivo] = useState(motivoInicial ?? "");
  const [km, setKm] = useState("");
  const [combustible, setCombustible] = useState("");

  return (
    <form action={ejecutarAccion} className="space-y-5">
      <SelectorClienteVehiculo
        clienteInicial={clienteInicial}
        vehiculoIdInicial={vehiculoIdInicial}
        bloqueado={Boolean(clienteInicial)}
      />
      {errores.clienteId && <p className={estiloError}>{errores.clienteId}</p>}
      {errores.vehiculoId && <p className={estiloError}>{errores.vehiculoId}</p>}

      <div>
        <label className={estiloLabel} htmlFor="motivo">
          Motivo de ingreso
        </label>
        <input
          id="motivo"
          name="motivo"
          required
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className={estiloInput}
          placeholder="Ruido en la suspensión delantera"
        />
        {errores.motivo && <p className={estiloError}>{errores.motivo}</p>}
      </div>

      <div>
        <label className={estiloLabel} htmlFor="kmIngreso">
          Kilometraje al ingresar
        </label>
        <input
          id="kmIngreso"
          name="kmIngreso"
          type="number"
          min={0}
          required
          value={km}
          onChange={(e) => setKm(e.target.value)}
          inputMode="numeric"
          className={estiloInput}
          placeholder="85000"
        />
        {errores.kmIngreso && <p className={estiloError}>{errores.kmIngreso}</p>}
      </div>

      <div>
        <label className={estiloLabel} htmlFor="nivelCombustible">
          Nivel de combustible
        </label>
        <select
          id="nivelCombustible"
          name="nivelCombustible"
          value={combustible}
          onChange={(e) => setCombustible(e.target.value)}
          className={estiloInput}
        >
          <option value="">Sin especificar</option>
          {NIVELES_COMBUSTIBLE.map((n) => (
            <option key={n.valor} value={n.valor}>
              {n.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <p className="text-[12.5px] text-mutado">
        Podés sacar fotos del estado del vehículo una vez creada la OT, desde su detalle.
      </p>

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-xl bg-primario py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {enviando ? "Creando…" : "Recepcionar e iniciar OT"}
      </button>
    </form>
  );
}
