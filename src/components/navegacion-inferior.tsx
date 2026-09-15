"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";
import { BotonNuevo } from "@/components/boton-nuevo";

function IconoInicio(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconoAgenda(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function IconoOTs(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function IconoMas(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

const PESTANAS_IZQUIERDA = [
  { href: "/", etiqueta: "Inicio", Icono: IconoInicio },
  { href: "/agenda", etiqueta: "Agenda", Icono: IconoAgenda },
] as const;

const PESTANAS_DERECHA = [
  { href: "/ots", etiqueta: "OTs", Icono: IconoOTs },
  { href: "/mas", etiqueta: "Más", Icono: IconoMas },
] as const;

function Pestana({ href, etiqueta, Icono, activa }: { href: string; etiqueta: string; Icono: (props: SVGProps<SVGSVGElement>) => React.ReactElement; activa: boolean }) {
  return (
    <Link
      href={href}
      aria-current={activa ? "page" : undefined}
      className={`flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] leading-none transition-colors ${
        activa
          ? "bg-primario-suave font-semibold text-primario"
          : "text-mutado active:bg-black/5"
      }`}
    >
      <Icono className="h-6 w-6" />
      {etiqueta}
    </Link>
  );
}

export function NavegacionInferior() {
  const pathname = usePathname();
  const activa = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-borde bg-superficie/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-lg items-end justify-around px-2 pt-1.5">
        {PESTANAS_IZQUIERDA.map(({ href, etiqueta, Icono }) => (
          <Pestana key={href} href={href} etiqueta={etiqueta} Icono={Icono} activa={activa(href)} />
        ))}

        <BotonNuevo />

        {PESTANAS_DERECHA.map(({ href, etiqueta, Icono }) => (
          <Pestana key={href} href={href} etiqueta={etiqueta} Icono={Icono} activa={activa(href)} />
        ))}
      </div>
    </nav>
  );
}
