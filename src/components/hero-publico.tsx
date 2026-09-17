"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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
    <section className="pt-4 text-center">
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
        className="mx-auto mt-5 max-w-[18ch] text-[34px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[42px]"
      >
        Consultá tu vehículo o pedí un turno, sin llamar
      </motion.h1>

      <motion.p
        custom={2}
        initial="oculto"
        animate="visible"
        variants={subir}
        className="mx-auto mt-4 max-w-[46ch] text-[15.5px] text-mutado"
      >
        Escribí la patente para ver en qué está tu reparación, o pedí un turno online en menos de
        un minuto.
      </motion.p>

      <motion.div
        custom={3}
        initial="oculto"
        animate="visible"
        variants={subir}
        className="mt-7 flex flex-wrap items-center justify-center gap-3"
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
    </section>
  );
}
