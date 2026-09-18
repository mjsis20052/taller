"use client";

import { useActionState, useState } from "react";
import { motion } from "framer-motion";
import { iniciarSesion } from "@/app/(publico)/login/actions";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-4 py-3.5 text-[16px] text-foreground outline-none focus:border-primario";
const estiloLabel = "mb-1.5 block text-[13px] font-semibold text-mutado";

function IconoOjo({ tachado }: { tachado: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {tachado && <path d="m3 3 18 18" />}
    </svg>
  );
}

export function FormularioLogin({ siguiente }: { siguiente: string }) {
  const [estado, ejecutarAccion, enviando] = useActionState(iniciarSesion, {});
  const [verClave, setVerClave] = useState(false);

  return (
    <motion.form
      action={ejecutarAccion}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4"
    >
      <input type="hidden" name="siguiente" value={siguiente} />

      <div>
        <label className={estiloLabel} htmlFor="usuario">
          Usuario
        </label>
        <input
          id="usuario"
          name="usuario"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          autoFocus
          defaultValue={estado.usuario}
          className={estiloInput}
        />
      </div>

      <div>
        <label className={estiloLabel} htmlFor="clave">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="clave"
            name="clave"
            type={verClave ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${estiloInput} pr-12`}
          />
          <button
            type="button"
            onClick={() => setVerClave((v) => !v)}
            aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-mutado"
          >
            <IconoOjo tachado={verClave} />
          </button>
        </div>
      </div>

      {estado.error && (
        <p role="alert" className="rounded-xl bg-peligro-suave px-4 py-3 text-[13.5px] font-medium text-peligro">
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-xl bg-primario py-4 text-[16px] font-bold text-white disabled:opacity-60"
      >
        {enviando ? "Ingresando…" : "Ingresar"}
      </button>
    </motion.form>
  );
}
