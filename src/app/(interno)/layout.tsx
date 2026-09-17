import Link from "next/link";
import { NavegacionInferior } from "@/components/navegacion-inferior";
import { BotonVolver } from "@/components/boton-volver";
import { TransicionPagina } from "@/components/transicion-pagina";
import { CampanaNotificaciones } from "@/components/campana-notificaciones";
import { obtenerAlertas } from "@/lib/alertas";

export default async function LayoutInterno({
  children,
}: {
  children: React.ReactNode;
}) {
  const alertas = await obtenerAlertas();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-borde bg-superficie/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-lg items-center gap-2 px-4 py-3 lg:max-w-4xl">
          <BotonVolver />
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primario text-base">
            🔧
          </span>
          <span className="text-[15px] font-bold tracking-tight text-foreground">
            Taller
          </span>
          <div className="ml-auto flex items-center gap-1">
            <CampanaNotificaciones alertas={alertas} />
            <Link
              href="/buscar"
              aria-label="Buscar por patente, nombre o teléfono"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-mutado active:bg-black/5"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-5 pb-28 lg:max-w-4xl">
        <TransicionPagina>{children}</TransicionPagina>
      </main>
      <NavegacionInferior />
    </div>
  );
}
