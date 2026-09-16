"use client";

import Link from "next/link";
import { useState } from "react";
import { Drawer } from "vaul";
import { motion } from "framer-motion";

function IconoNuevo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function IconoAgenda(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function IconoLlave(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function IconoPersona(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

const ACCIONES = [
  { href: "/agenda/nuevo", etiqueta: "Nuevo turno", descripcion: "Agendar un turno", Icono: IconoAgenda },
  { href: "/ots/nuevo", etiqueta: "Recepcionar vehículo", descripcion: "Nueva orden de trabajo", Icono: IconoLlave },
  { href: "/clientes/nuevo", etiqueta: "Nuevo cliente", descripcion: "Cargar un cliente", Icono: IconoPersona },
] as const;

export function BotonNuevo() {
  const [abierto, setAbierto] = useState(false);

  return (
    <Drawer.Root open={abierto} onOpenChange={setAbierto}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          aria-label="Nueva acción"
          className="-mt-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primario text-white ring-4 ring-superficie"
        >
          <motion.span animate={{ rotate: abierto ? 45 : 0 }} transition={{ duration: 0.18 }}>
            <IconoNuevo className="h-7 w-7" />
          </motion.span>
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-3xl border border-borde bg-superficie outline-none">
          <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-borde" />
          <Drawer.Title className="px-5 pt-4 text-[13px] font-semibold uppercase tracking-wide text-mutado">
            Acción rápida
          </Drawer.Title>
          <div className="space-y-1 p-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            {ACCIONES.map((accion) => (
              <Link
                key={accion.href}
                href={accion.href}
                onClick={() => setAbierto(false)}
                className="flex items-center gap-3.5 rounded-2xl px-3.5 py-3.5 active:bg-black/[0.03]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primario-suave text-primario">
                  <accion.Icono className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-foreground">{accion.etiqueta}</p>
                  <p className="text-[12.5px] text-mutado">{accion.descripcion}</p>
                </div>
              </Link>
            ))}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
