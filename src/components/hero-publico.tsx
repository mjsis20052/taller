"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IlustracionAuto } from "@/components/ilustracion-auto";

const subir = {
  oculto: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export function HeroPublico() {
  return (
    <section className="relative overflow-hidden pt-4">
      {/* blobs decorativos de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primario-suave opacity-70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-exito-suave opacity-60 blur-3xl"
      />

      <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="text-center lg:text-left">
          <motion.span
            custom={0}
            initial="oculto"
            animate="visible"
            variants={subir}
            className="inline-block rounded-full bg-primario-suave px-3.5 py-1.5 text-[12.5px] font-semibold text-primario"
          >
            Tu taller, a un click
          </motion.span>

          <motion.h1
            custom={1}
            initial="oculto"
            animate="visible"
            variants={subir}
            className="mx-auto mt-5 max-w-[18ch] text-[34px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[42px] lg:mx-0"
          >
            Consultá tu vehículo o pedí un turno, sin llamar
          </motion.h1>

          <motion.p
            custom={2}
            initial="oculto"
            animate="visible"
            variants={subir}
            className="mx-auto mt-4 max-w-[46ch] text-[15.5px] text-mutado lg:mx-0"
          >
            Escribí la patente para ver en qué está tu reparación, o pedí un turno online en menos
            de un minuto.
          </motion.p>

          <motion.div
            custom={3}
            initial="oculto"
            animate="visible"
            variants={subir}
            className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <a
              href="#consulta"
              className="rounded-xl bg-primario px-6 py-3.5 text-[14.5px] font-semibold text-white"
            >
              Consultar mi vehículo
            </a>
            <Link
              href="/portal/turno"
              className="rounded-xl border border-borde bg-superficie px-6 py-3.5 text-[14.5px] font-semibold text-foreground"
            >
              Pedir turno
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-sm lg:max-w-none"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <IlustracionAuto className="w-full drop-shadow-xl" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
