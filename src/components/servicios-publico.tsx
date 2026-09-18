"use client";

import { motion } from "framer-motion";

type Props = React.SVGProps<SVGSVGElement>;

function DibujoAceite(props: Props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <path d="M32 6C32 6 14 26 14 38a18 18 0 0 0 36 0C50 26 32 6 32 6Z" fill="#fbbf24" />
      <path d="M32 6C32 6 14 26 14 38a18 18 0 0 0 9 15.6C18 44 22 26 32 6Z" fill="#f59e0b" />
      <ellipse cx="25" cy="34" rx="3.5" ry="6" fill="#fff" opacity=".55" transform="rotate(20 25 34)" />
    </svg>
  );
}

function DibujoFrenos(props: Props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <circle cx="30" cy="34" r="24" fill="#cbd5e1" />
      <circle cx="30" cy="34" r="24" stroke="#94a3b8" strokeWidth="3" />
      <circle cx="30" cy="34" r="9" fill="#475569" />
      {[0, 60, 120, 180, 240, 300].map((g) => (
        <circle
          key={g}
          cx={30 + Math.cos((g * Math.PI) / 180) * 16}
          cy={34 + Math.sin((g * Math.PI) / 180) * 16}
          r="2.6"
          fill="#475569"
        />
      ))}
      <path d="M44 8h10a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H44Z" fill="#ef4444" />
      <path d="M44 8h10a4 4 0 0 1 4 4v6H44Z" fill="#f87171" />
    </svg>
  );
}

function DibujoRueda(props: Props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <circle cx="32" cy="32" r="27" fill="#1e293b" />
      <circle cx="32" cy="32" r="18" fill="#e2e8f0" />
      <circle cx="32" cy="32" r="18" stroke="#94a3b8" strokeWidth="2" />
      {[0, 72, 144, 216, 288].map((g) => (
        <rect key={g} x="30" y="16" width="4" height="14" rx="2" fill="#64748b" transform={`rotate(${g} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="4.5" fill="#475569" />
    </svg>
  );
}

function DibujoMotor(props: Props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <rect x="10" y="20" width="38" height="28" rx="5" fill="#64748b" />
      <rect x="14" y="14" width="30" height="8" rx="3" fill="#94a3b8" />
      <rect x="4" y="28" width="7" height="12" rx="2" fill="#475569" />
      <rect x="48" y="26" width="10" height="16" rx="3" fill="#475569" />
      <circle cx="29" cy="34" r="8" fill="#f1f5f9" />
      <circle cx="29" cy="34" r="3.5" fill="#22c55e" />
      {[20, 29, 38].map((x) => (
        <rect key={x} x={x - 2} y="8" width="4" height="7" rx="1.5" fill="#cbd5e1" />
      ))}
    </svg>
  );
}

function DibujoBateria(props: Props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <rect x="6" y="18" width="52" height="34" rx="6" fill="#0ea5e9" />
      <rect x="6" y="18" width="52" height="12" rx="6" fill="#38bdf8" />
      <rect x="14" y="10" width="10" height="9" rx="2" fill="#334155" />
      <rect x="40" y="10" width="10" height="9" rx="2" fill="#334155" />
      <path d="M35 24 24 38h8l-3 11 12-16h-8Z" fill="#fde047" stroke="#facc15" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function DibujoDiagnostico(props: Props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <circle cx="27" cy="27" r="19" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="5" />
      <path d="m41 41 16 16" stroke="#7c3aed" strokeWidth="7" strokeLinecap="round" />
      <path
        d="M13 28h8l3-8 5 15 4-10 3 3h7"
        stroke="#8b5cf6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SERVICIOS = [
  { titulo: "Cambio de aceite", detalle: "Aceite y filtro al día", Dibujo: DibujoAceite, fondo: "from-amber-400/30 to-orange-500/10" },
  { titulo: "Frenos", detalle: "Pastillas y discos", Dibujo: DibujoFrenos, fondo: "from-rose-400/30 to-red-500/10" },
  { titulo: "Alineación y balanceo", detalle: "Más agarre, menos desgaste", Dibujo: DibujoRueda, fondo: "from-emerald-400/30 to-teal-500/10" },
  { titulo: "Service completo", detalle: "Revisión del motor", Dibujo: DibujoMotor, fondo: "from-sky-400/30 to-blue-500/10" },
  { titulo: "Batería y electricidad", detalle: "Arranque sin sorpresas", Dibujo: DibujoBateria, fondo: "from-cyan-400/30 to-sky-500/10" },
  { titulo: "Diagnóstico", detalle: "Encontramos la falla", Dibujo: DibujoDiagnostico, fondo: "from-violet-400/30 to-fuchsia-500/10" },
];

export function ServiciosPublico() {
  return (
    <section className="relative -mx-5 overflow-hidden bg-linear-to-br from-[#0b1020] via-[#111d4a] to-[#1d4ed8] px-5 py-12 sm:mx-0 sm:rounded-3xl">
      <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primario/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative">
        <p className="text-center text-[12.5px] font-semibold uppercase tracking-widest text-sky-300">
          Lo que hacemos
        </p>
        <h2 className="mt-2 text-center text-[26px] font-bold tracking-tight text-white sm:text-[30px]">
          Todo para que tu vehículo ande como nuevo
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {SERVICIOS.map((servicio, i) => (
            <motion.div
              key={servicio.titulo}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -6 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08, ease: "easeOut" }}
              className="rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur"
            >
              <div className={`flex h-20 items-center justify-center rounded-xl bg-linear-to-br ${servicio.fondo}`}>
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3 + (i % 3) * 0.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <servicio.Dibujo className="h-14 w-14 drop-shadow-lg" />
                </motion.div>
              </div>
              <p className="mt-3 text-[14.5px] font-semibold leading-tight text-white">{servicio.titulo}</p>
              <p className="mt-0.5 text-[12.5px] text-white/65">{servicio.detalle}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
