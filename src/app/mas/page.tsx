import type { Metadata } from "next";
import Link from "next/link";
import { EncabezadoPagina } from "@/components/encabezado-pagina";

export const metadata: Metadata = { title: "Más" };

export default function PaginaMas() {
  return (
    <section>
      <EncabezadoPagina
        titulo="Más"
        descripcion="Clientes, vehículos, stock, gastos, cobranzas y facturación."
      />

      <div className="space-y-2.5">
        <Link
          href="/clientes"
          className="flex items-center justify-between gap-3 rounded-2xl border border-borde bg-superficie px-4 py-3.5 active:bg-black/[0.03]"
        >
          <span className="text-[15px] font-semibold text-foreground">Clientes</span>
          <span className="text-mutado">›</span>
        </Link>

        <div className="rounded-2xl border border-dashed border-borde bg-superficie px-4 py-3.5 text-[15px] text-mutado">
          Vehículos — Tarea 4
        </div>
        <div className="rounded-2xl border border-dashed border-borde bg-superficie px-4 py-3.5 text-[15px] text-mutado">
          Stock, gastos y cobranzas — Fase 3
        </div>
        <div className="rounded-2xl border border-dashed border-borde bg-superficie px-4 py-3.5 text-[15px] text-mutado">
          Facturación — Fase 4
        </div>
      </div>
    </section>
  );
}
