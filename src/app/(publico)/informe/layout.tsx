import type { Metadata } from "next";
import { AutoRefresco } from "@/components/auto-refresco";

export const metadata: Metadata = {
  title: "Informe",
  robots: { index: false, follow: false },
};

export default function LayoutInforme({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-borde bg-superficie/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl items-center gap-2.5 px-5 py-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primario text-base">🔧</span>
          <span className="text-[16px] font-extrabold tracking-tight text-foreground">Taller</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-6">{children}</main>
      <footer className="mx-auto w-full max-w-xl space-y-1 px-5 pb-8 pt-2 text-center">
        <AutoRefresco />
        <p className="text-[12px] text-mutado">Informe privado: solo lo ve quien tiene este link.</p>
      </footer>
    </div>
  );
}
