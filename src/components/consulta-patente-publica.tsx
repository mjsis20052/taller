"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { consultarPatentePublico } from "@/app/(publico)/portal/actions";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-4 py-3.5 text-[17px] font-semibold uppercase tracking-wide text-foreground outline-none focus:border-primario";

export function ConsultaPatentePublica() {
  const [resultado, ejecutarAccion, buscando] = useActionState(consultarPatentePublico, {});

  return (
    <div>
      <form action={ejecutarAccion} className="flex gap-2">
        <input
          name="patente"
          required
          placeholder="AB123CD"
          className={estiloInput}
        />
        <motion.button
          type="submit"
          disabled={buscando}
          whileTap={{ scale: 0.96 }}
          className="shrink-0 rounded-xl bg-primario px-6 text-[15px] font-semibold text-white disabled:opacity-60"
        >
          {buscando ? "…" : "Consultar"}
        </motion.button>
      </form>

      <AnimatePresence mode="wait">
        {resultado.error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-[14px] text-peligro"
          >
            {resultado.error}
          </motion.p>
        )}

        {resultado.encontrado === false && (
          <motion.p
            key="no-encontrado"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-[14px] text-mutado"
          >
            No encontramos ningún vehículo con esa patente en el taller.
          </motion.p>
        )}

        {resultado.encontrado && (
          <motion.div
            key="resultado"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-4 rounded-2xl border border-primario/20 bg-primario-suave p-5"
          >
            <p className="text-[13px] font-semibold uppercase tracking-wide text-primario">
              {resultado.patente} — {resultado.marca} {resultado.modelo}
            </p>
            <p className="mt-1.5 text-[16px] font-medium text-foreground">{resultado.mensaje}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
