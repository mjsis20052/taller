import type { Metadata } from "next";
import Link from "next/link";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { cerrarSesion } from "@/app/(publico)/login/actions";

export const metadata: Metadata = { title: "Más" };

type Icono = (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;

const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const IconoClientes: Icono = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.4c2 .7 3.5 2.6 3.5 5.6" />
  </svg>
);
const IconoVehiculos: Icono = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M5 17h14l1.5-5.5a2 2 0 0 0-1.9-2.5H6.4a2 2 0 0 0-1.9 1.4L3 17Z" />
    <circle cx="7.5" cy="17.5" r="1.6" />
    <circle cx="16.5" cy="17.5" r="1.6" />
  </svg>
);
const IconoStock: Icono = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="m21 8-9-5-9 5 9 5 9-5Z" />
    <path d="M3 8v8l9 5 9-5V8M12 13v8" />
  </svg>
);
const IconoGastos: Icono = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3" y="6" width="18" height="13" rx="2.5" />
    <path d="M3 10h18M7 15h3" />
  </svg>
);
const IconoCobranzas: Icono = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.8 9.2c-.4-.9-1.4-1.4-2.8-1.4-1.6 0-2.6.8-2.6 1.9 0 2.7 5.4 1.3 5.4 4 0 1.2-1.1 2-2.8 2-1.5 0-2.6-.6-3-1.6M12 6.5v1.3M12 16.2v1.3" />
  </svg>
);
const IconoFacturacion: Icono = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M14 3v5h5M9 13h7M9 17h5" />
  </svg>
);
const IconoReportes: Icono = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 20V4M4 20h16" />
    <path d="M8 16v-4M12 16V8M16 16v-6" />
  </svg>
);
const IconoHorarios: Icono = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.2 2" />
  </svg>
);
const IconoCaja: Icono = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3" y="7" width="18" height="12" rx="2.5" />
    <path d="M7 7V5.5A1.5 1.5 0 0 1 8.5 4h7A1.5 1.5 0 0 1 17 5.5V7M3 12h18M11 12v2h2v-2" />
  </svg>
);
const IconoInformes: Icono = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M14 3v5h5" />
    <circle cx="10" cy="15" r="1.4" />
    <circle cx="15.5" cy="13" r="1.4" />
    <circle cx="15.5" cy="18" r="1.4" />
    <path d="m11.2 14.4 3-1M11.2 15.6l3 1.8" />
  </svg>
);
const IconoSalir: Icono = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" />
  </svg>
);
const IconoMicrofono: Icono = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="9" y="2.5" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7" />
  </svg>
);

const APPS: { href: string; etiqueta: string; Icono: Icono; color: string; externo?: boolean }[] = [
  { href: "/informes", etiqueta: "Informes", Icono: IconoInformes, color: "from-pink-500 to-rose-600" },
  { href: "/caja", etiqueta: "Caja", Icono: IconoCaja, color: "from-lime-500 to-green-600" },
  { href: "/clientes", etiqueta: "Clientes", Icono: IconoClientes, color: "from-indigo-500 to-violet-500" },
  { href: "/vehiculos", etiqueta: "Vehículos", Icono: IconoVehiculos, color: "from-sky-500 to-blue-600" },
  { href: "/stock", etiqueta: "Stock", Icono: IconoStock, color: "from-amber-400 to-orange-500" },
  { href: "/gastos", etiqueta: "Gastos", Icono: IconoGastos, color: "from-rose-400 to-red-500" },
  { href: "/cobranzas", etiqueta: "Cuenta corriente", Icono: IconoCobranzas, color: "from-emerald-400 to-teal-600" },
  { href: "/facturacion", etiqueta: "Facturación", Icono: IconoFacturacion, color: "from-cyan-400 to-sky-600" },
  { href: "/reportes", etiqueta: "Reportes", Icono: IconoReportes, color: "from-fuchsia-500 to-purple-600" },
  { href: "/configuracion", etiqueta: "Horarios", Icono: IconoHorarios, color: "from-slate-500 to-slate-700" },
  // Módulo aparte (carga de OT por voz, repo taller-carga-voz). Sin
  // CARGA_VOZ_URL configurada (todavía no desplegado) el botón ni aparece.
  ...(process.env.CARGA_VOZ_URL
    ? [
        {
          href: process.env.CARGA_VOZ_URL,
          etiqueta: "Carga por voz",
          Icono: IconoMicrofono,
          color: "from-violet-500 to-fuchsia-600",
          externo: true,
        },
      ]
    : []),
];

const clasesIcono =
  "flex h-[68px] w-[68px] items-center justify-center rounded-[22px] bg-linear-to-br text-white shadow-lg shadow-black/15 transition-transform group-active:scale-90";

export default function PaginaMas() {
  return (
    <section>
      <EncabezadoPagina titulo="Más" descripcion="Todo lo demás del taller, a un toque." />

      <div className="grid grid-cols-3 gap-x-3 gap-y-6 pt-2 lg:grid-cols-4">
        {APPS.map(({ href, etiqueta, Icono, color, externo }) =>
          externo ? (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 text-center"
            >
              <span className={`${clasesIcono} ${color}`}>
                <Icono className="h-8 w-8" />
              </span>
              <span className="text-[13px] font-semibold leading-tight text-foreground">{etiqueta}</span>
            </a>
          ) : (
            <Link key={href} href={href} className="group flex flex-col items-center gap-2 text-center">
              <span className={`${clasesIcono} ${color}`}>
                <Icono className="h-8 w-8" />
              </span>
              <span className="text-[13px] font-semibold leading-tight text-foreground">{etiqueta}</span>
            </Link>
          ),
        )}

        <form action={cerrarSesion} className="contents">
          <button type="submit" className="group flex flex-col items-center gap-2 text-center">
            <span className={`${clasesIcono} from-slate-400 to-slate-600`}>
              <IconoSalir className="h-8 w-8" />
            </span>
            <span className="text-[13px] font-semibold leading-tight text-peligro">Cerrar sesión</span>
          </button>
        </form>
      </div>
    </section>
  );
}
