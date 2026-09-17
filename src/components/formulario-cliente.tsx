"use client";

import { useActionState } from "react";
import { TipoPersona, CondicionFiscal } from "@/generated/prisma/enums";
import type { ErroresFormularioCliente } from "@/app/(interno)/clientes/actions";
import { CamposOpcionales } from "@/components/campos-opcionales";

type ClienteExistente = {
  nombre: string;
  tipoPersona: TipoPersona;
  dni: string | null;
  cuit: string | null;
  condicionFiscal: CondicionFiscal;
  telefono: string;
  email: string | null;
  domicilio: string | null;
  notas: string | null;
};

const ETIQUETAS_CONDICION_FISCAL: Record<CondicionFiscal, string> = {
  CONSUMIDOR_FINAL: "Consumidor final",
  RESPONSABLE_INSCRIPTO: "Responsable inscripto",
  MONOTRIBUTISTA: "Monotributista",
  EXENTO: "Exento",
};

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario";
const estiloLabel = "block text-[13px] font-medium text-mutado mb-1.5";
const estiloError = "mt-1 text-[12.5px] text-peligro";

export function FormularioCliente({
  accion,
  cliente,
  textoBoton,
}: {
  accion: (
    estadoPrevio: ErroresFormularioCliente,
    formData: FormData,
  ) => Promise<ErroresFormularioCliente>;
  cliente?: ClienteExistente;
  textoBoton: string;
}) {
  const [errores, ejecutarAccion, enviando] = useActionState(accion, {});

  const tieneDatosOpcionales = Boolean(
    cliente &&
      (cliente.dni ||
        cliente.cuit ||
        cliente.email ||
        cliente.domicilio ||
        cliente.notas ||
        cliente.tipoPersona !== TipoPersona.FISICA ||
        cliente.condicionFiscal !== CondicionFiscal.CONSUMIDOR_FINAL),
  );

  return (
    <form action={ejecutarAccion} className="space-y-5">
      <div>
        <label className={estiloLabel} htmlFor="nombre">
          Nombre o razón social
        </label>
        <input
          id="nombre"
          name="nombre"
          required
          autoFocus={!cliente}
          defaultValue={cliente?.nombre}
          className={estiloInput}
          placeholder="Juan Pérez"
        />
        {errores.nombre && <p className={estiloError}>{errores.nombre}</p>}
      </div>

      <div>
        <label className={estiloLabel} htmlFor="telefono">
          Teléfono (WhatsApp)
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          required
          defaultValue={cliente?.telefono}
          className={estiloInput}
          placeholder="+5491122334455"
        />
        {errores.telefono && <p className={estiloError}>{errores.telefono}</p>}
      </div>

      <CamposOpcionales
        etiqueta="Tipo de persona, DNI/CUIT, email, domicilio…"
        abiertoInicial={tieneDatosOpcionales}
      >
        <div>
          <label className={estiloLabel} htmlFor="tipoPersona">
            Tipo de persona
          </label>
          <select
            id="tipoPersona"
            name="tipoPersona"
            defaultValue={cliente?.tipoPersona ?? TipoPersona.FISICA}
            className={estiloInput}
          >
            <option value={TipoPersona.FISICA}>Física</option>
            <option value={TipoPersona.JURIDICA}>Jurídica</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={estiloLabel} htmlFor="dni">
              DNI
            </label>
            <input
              id="dni"
              name="dni"
              inputMode="numeric"
              defaultValue={cliente?.dni ?? ""}
              className={estiloInput}
              placeholder="30123456"
            />
            {errores.dni && <p className={estiloError}>{errores.dni}</p>}
          </div>
          <div>
            <label className={estiloLabel} htmlFor="cuit">
              CUIT
            </label>
            <input
              id="cuit"
              name="cuit"
              inputMode="numeric"
              defaultValue={cliente?.cuit ?? ""}
              className={estiloInput}
              placeholder="20123456786"
            />
            {errores.cuit && <p className={estiloError}>{errores.cuit}</p>}
          </div>
        </div>

        <div>
          <label className={estiloLabel} htmlFor="condicionFiscal">
            Condición fiscal
          </label>
          <select
            id="condicionFiscal"
            name="condicionFiscal"
            defaultValue={cliente?.condicionFiscal ?? CondicionFiscal.CONSUMIDOR_FINAL}
            className={estiloInput}
          >
            {Object.entries(ETIQUETAS_CONDICION_FISCAL).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={estiloLabel} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={cliente?.email ?? ""}
            className={estiloInput}
            placeholder="opcional"
          />
        </div>

        <div>
          <label className={estiloLabel} htmlFor="domicilio">
            Domicilio
          </label>
          <input
            id="domicilio"
            name="domicilio"
            defaultValue={cliente?.domicilio ?? ""}
            className={estiloInput}
            placeholder="opcional"
          />
        </div>

        <div>
          <label className={estiloLabel} htmlFor="notas">
            Notas
          </label>
          <textarea
            id="notas"
            name="notas"
            rows={3}
            defaultValue={cliente?.notas ?? ""}
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
