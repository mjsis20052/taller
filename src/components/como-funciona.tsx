"use client";

import { motion } from "framer-motion";

function IconoTurno(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}

function IconoAuto(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 17h14l1.5-5.5a2 2 0 0 0-1.9-2.5H6.4a2 2 0 0 0-1.9 1.4L3 17" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
    </svg>
  );
}

function IconoCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

const PASOS = [
  { Icono: IconoTurno, titulo: "Pedís el turno", descripcion: "Elegís día y horario disponible, online, en menos de un minuto." },
  { Icono: IconoAuto, titulo: "Traés el vehículo", descripcion: "Te esperamos el día acordado. Sin filas ni sorpresas." },
  { Icono: IconoCheck, titulo: "Seguís el estado", descripcion: "Consultá por patente cuando quieras, sin tener que llamar." },
];

export function ComoFunciona() {
  return (
    <section>
      <h2 className="text-center text-[22px] font-bold tracking-tight text-foreground">
        Cómo funciona
      </h2>
      <div className="relative mt-8 grid gap-8 sm:grid-cols-3">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-6 hidden h-px bg-borde sm:block"
        />
        {PASOS.map((paso, i) => (
          <motion.div
            key={paso.titulo}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.12, ease: "easeOut" }}
            className="relative text-center"
          >
            <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primario text-white">
              <paso.Icono className="h-[22px] w-[22px]" />
            </div>
            <p className="mt-4 text-[15px] font-semibold text-foreground">
              {i + 1}. {paso.titulo}
            </p>
            <p className="mt-1 text-[13px] text-mutado">{paso.descripcion}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
