import type { Metadata } from "next";
import Link from "next/link";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { cerrarSesion } from "@/app/(publico)/login/actions";

export const metadata: Metadata = { title: "Más" };

const ENLACES = [
  { href: "/clientes", etiqueta: "Clientes" },
  { href: "/vehiculos", etiqueta: "Vehículos" },
  { href: "/stock", etiqueta: "Stock de repuestos" },
  { href: "/gastos", etiqueta: "Gastos" },
  { href: "/cobranzas", etiqueta: "Cobranzas y cuenta corriente" },
  { href: "/facturacion", etiqueta: "Facturación (cola manual)" },
  { href: "/reportes", etiqueta: "Reportes" },
  { href: "/configuracion", etiqueta: "Horarios de atención (portal)" },
];

export default function PaginaMas() {
  return (
    <section>
      <EncabezadoPagina
        titulo="Más"
        descripcion="Clientes, vehículos, stock, gastos, cobranzas, facturación y reportes."
      />

      <div className="space-y-2.5">
        {ENLACES.map((enlace) => (
          <Link
            key={enlace.href}
            href={enlace.href}
            className="flex items-center justify-between gap-3 rounded-2xl border border-borde bg-superficie px-4 py-3.5 active:bg-black/[0.03]"
          >
            <span className="text-[15px] font-semibold text-foreground">{enlace.etiqueta}</span>
            <span className="text-mutado">›</span>
          </Link>
        ))}
      </div>

      <form action={cerrarSesion} className="mt-6">
        <button
          type="submit"
          className="w-full rounded-2xl border border-borde bg-superficie py-3.5 text-[14.5px] font-semibold text-peligro"
        >
          Cerrar sesión
        </button>
      </form>
    </section>
  );
}
