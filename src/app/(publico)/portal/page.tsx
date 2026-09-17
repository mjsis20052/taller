import type { Metadata } from "next";
import Link from "next/link";
import { ConsultaPatentePublica } from "@/components/consulta-patente-publica";
import { HeroPublico } from "@/components/hero-publico";
import { FeaturesPublico } from "@/components/features-publico";
import { ComoFunciona } from "@/components/como-funciona";
import { IlustracionHerramientas } from "@/components/ilustracion-herramientas";

export const metadata: Metadata = {
  title: "Consultá tu vehículo o pedí un turno",
  description:
    "Consultá el estado de tu vehículo por patente o pedí un turno online, sin llamar.",
};

export default function PaginaPortal() {
  return (
    <div className="space-y-16">
      <HeroPublico />

      <FeaturesPublico />

      <ComoFunciona />

      <section id="consulta" className="scroll-mt-20">
        <h2 className="text-[22px] font-bold tracking-tight text-foreground">
          Consultá tu vehículo
        </h2>
        <p className="mt-1.5 text-[14.5px] text-mutado">
          Escribí la patente y te contamos en qué está tu auto o moto.
        </p>
        <div className="mt-5 rounded-3xl border border-borde bg-superficie p-6">
          <ConsultaPatentePublica />
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-primario px-6 py-10 text-center text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"
        />
        <IlustracionHerramientas
          aria-hidden
          className="pointer-events-none absolute -right-6 -bottom-8 h-40 w-40 opacity-90 sm:h-48 sm:w-48"
        />
        <div className="relative mx-auto max-w-[26ch] sm:max-w-none">
          <h2 className="text-[22px] font-bold tracking-tight">¿Necesitás un turno?</h2>
          <p className="mx-auto mt-2 max-w-[42ch] text-[14.5px] text-white/85">
            Pedilo online en un minuto, sin llamar ni esperar. Te confirmamos por WhatsApp.
          </p>
          <Link
            href="/portal/turno"
            className="mt-5 inline-block rounded-xl bg-white px-7 py-3.5 text-[15px] font-semibold text-primario"
          >
            Pedir turno online
          </Link>
        </div>
      </section>
    </div>
  );
}
