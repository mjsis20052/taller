import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sin conexión" };

export default function PaginaOffline() {
  return (
    <section className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primario-suave text-primario">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
          <path d="M1 1l22 22" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <path d="M12 20h.01" />
        </svg>
      </div>
      <h1 className="text-[19px] font-bold text-foreground">Sin conexión</h1>
      <p className="max-w-[28ch] text-[14px] text-mutado">
        No se pudo cargar esta pantalla porque no hay internet en este momento. Los datos del
        taller viven en el servidor — probá de nuevo cuando vuelva la señal.
      </p>
    </section>
  );
}
