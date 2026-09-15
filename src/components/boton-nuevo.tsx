"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function IconoNuevo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

const ACCIONES = [
  { href: "/agenda/nuevo", etiqueta: "Nuevo turno", descripcion: "Agendar un turno" },
  { href: "/ots/nuevo", etiqueta: "Recepcionar vehículo", descripcion: "Nueva orden de trabajo" },
  { href: "/clientes/nuevo", etiqueta: "Nuevo cliente", descripcion: "Cargar un cliente" },
];

export function BotonNuevo() {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    function alClickAfuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", alClickAfuera);
    return () => document.removeEventListener("mousedown", alClickAfuera);
  }, [abierto]);

  return (
    <div ref={ref} className="relative -mt-8 shrink-0">
      {abierto && (
        <div className="absolute bottom-[68px] left-1/2 w-60 -translate-x-1/2 rounded-2xl border border-borde bg-superficie p-1.5 shadow-lg">
          {ACCIONES.map((accion) => (
            <Link
              key={accion.href}
              href={accion.href}
              onClick={() => setAbierto(false)}
              className="block rounded-xl px-3.5 py-2.5 active:bg-black/[0.03]"
            >
              <p className="text-[14px] font-semibold text-foreground">{accion.etiqueta}</p>
              <p className="text-[12px] text-mutado">{accion.descripcion}</p>
            </Link>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Nueva acción"
        aria-expanded={abierto}
        className={`flex h-16 w-16 items-center justify-center rounded-full bg-primario text-white shadow-[0_8px_20px_-6px_rgba(29,78,216,0.6)] ring-4 ring-superficie transition-transform active:scale-95 ${
          abierto ? "rotate-45" : ""
        }`}
      >
        <IconoNuevo className="h-7 w-7 transition-transform" />
      </button>
    </div>
  );
}
