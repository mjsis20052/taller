import { BotonPedirTurno } from "@/components/boton-pedir-turno";

export default function LayoutPublico({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-borde bg-superficie/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2.5 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primario text-base">
            🔧
          </span>
          <span className="text-[16px] font-bold tracking-tight text-foreground">
            Taller
          </span>
          <BotonPedirTurno className="ml-auto rounded-xl bg-primario px-4 py-2 text-[13.5px] font-semibold text-white">
            Pedir turno
          </BotonPedirTurno>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">{children}</main>
      <footer className="border-t border-borde px-5 py-6 text-center text-[12.5px] text-mutado">
        Taller mecánico · Gestión y turnos online
      </footer>
    </div>
  );
}
