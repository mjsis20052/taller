"use client";

import { useActionState, useState } from "react";
import type { ErroresFormularioVehiculo } from "@/app/(interno)/vehiculos/actions";
import { CamposOpcionales } from "@/components/campos-opcionales";

type VehiculoExistente = {
  patente: string;
  marca: string;
  modelo: string;
  anio: number | null;
  color: string | null;
  vin: string | null;
};

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario";
const estiloLabel = "block text-[13px] font-medium text-mutado mb-1.5";
const estiloError = "mt-1 text-[12.5px] text-peligro";

export function FormularioVehiculo({
  accion,
  vehiculo,
  textoBoton,
}: {
  accion: (
    estadoPrevio: ErroresFormularioVehiculo,
    formData: FormData,
  ) => Promise<ErroresFormularioVehiculo>;
  vehiculo?: VehiculoExistente;
  textoBoton: string;
}) {
  const [errores, ejecutarAccion, enviando] = useActionState(accion, {});

  // Los campos se guardan en estado: si el envío falla (por ejemplo patente repetida)
  // el formulario no se reinicia y no se pierde lo que ya se escribió.
  const [patente, setPatente] = useState(vehiculo?.patente ?? "");
  const [marca, setMarca] = useState(vehiculo?.marca ?? "");
  const [modelo, setModelo] = useState(vehiculo?.modelo ?? "");
  const [anio, setAnio] = useState(vehiculo?.anio ? String(vehiculo.anio) : "");
  const [color, setColor] = useState(vehiculo?.color ?? "");
  const [vin, setVin] = useState(vehiculo?.vin ?? "");

  return (
    <form action={ejecutarAccion} className="space-y-5">
      <div>
        <label className={estiloLabel} htmlFor="patente">
          Patente
        </label>
        <input
          id="patente"
          name="patente"
          required
          autoFocus={!vehiculo}
          value={patente}
          onChange={(e) => setPatente(e.target.value)}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className={`${estiloInput} uppercase`}
          placeholder="La que sea (AB123CD, 123ABC…)"
        />
        {errores.patente && <p className={estiloError}>{errores.patente}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={estiloLabel} htmlFor="marca">
            Marca
          </label>
          <input
            id="marca"
            name="marca"
            required
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            className={estiloInput}
            placeholder="Ford"
          />
          {errores.marca && <p className={estiloError}>{errores.marca}</p>}
        </div>
        <div>
          <label className={estiloLabel} htmlFor="modelo">
            Modelo
          </label>
          <input
            id="modelo"
            name="modelo"
            required
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            className={estiloInput}
            placeholder="Fiesta"
          />
          {errores.modelo && <p className={estiloError}>{errores.modelo}</p>}
        </div>
      </div>

      <CamposOpcionales
        etiqueta="Año, color, VIN…"
        abiertoInicial={Boolean(vehiculo?.anio || vehiculo?.color || vehiculo?.vin)}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={estiloLabel} htmlFor="anio">
              Año
            </label>
            <input
              id="anio"
              name="anio"
              inputMode="numeric"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className={estiloInput}
              placeholder="2018"
            />
            {errores.anio && <p className={estiloError}>{errores.anio}</p>}
          </div>
          <div>
            <label className={estiloLabel} htmlFor="color">
              Color
            </label>
            <input
              id="color"
              name="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={estiloInput}
              placeholder="opcional"
            />
          </div>
        </div>

        <div>
          <label className={estiloLabel} htmlFor="vin">
            VIN / N° de chasis
          </label>
          <input
            id="vin"
            name="vin"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            className={estiloInput}
            placeholder="opcional"
          />
        </div>
      </CamposOpcionales>

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
