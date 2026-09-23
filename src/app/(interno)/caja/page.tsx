import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { hoyEnArgentina } from "@/lib/horarios";
import { resumenDeuda } from "@/lib/cuenta-corriente";
import { montoFirmado, pesos } from "@/lib/formato";

export const metadata: Metadata = { title: "Caja" };

const PERIODOS = [
  { valor: "hoy", etiqueta: "Hoy" },
  { valor: "semana", etiqueta: "7 días" },
  { valor: "mes", etiqueta: "Este mes" },
] as const;

const ETIQUETAS_CATEGORIA: Record<string, string> = {
  REPUESTOS: "Repuestos",
  HERRAMIENTAS: "Herramientas",
  ALQUILER: "Alquiler",
  SERVICIOS: "Servicios",
  OTROS: "Otros",
};

const formatoHora = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});

function restarDias(iso: string, dias: number): string {
  const fecha = new Date(`${iso}T12:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() - dias);
  return fecha.toISOString().slice(0, 10);
}

type Movimiento = {
  id: string;
  fecha: Date;
  titulo: string;
  detalle: string;
  monto: number;
};

export default async function PaginaCaja({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  const { periodo: periodoPedido } = await searchParams;
  const periodo = PERIODOS.find((p) => p.valor === periodoPedido)?.valor ?? "hoy";

  const hoy = hoyEnArgentina();
  const desde = periodo === "hoy" ? hoy : periodo === "semana" ? restarDias(hoy, 6) : `${hoy.slice(0, 8)}01`;
  const rango = {
    gte: new Date(`${desde}T00:00:00-03:00`),
    lte: new Date(`${hoy}T23:59:59.999-03:00`),
  };

  const [cobros, gastos, deuda] = await Promise.all([
    prisma.cobro.findMany({
      where: { fecha: rango },
      include: { cliente: { select: { nombre: true } }, ot: { select: { numero: true } } },
      orderBy: { fecha: "desc" },
    }),
    prisma.gasto.findMany({ where: { fecha: rango }, orderBy: { fecha: "desc" } }),
    resumenDeuda(),
  ]);

  const ingresos = cobros.reduce((acc, c) => acc + montoFirmado(c), 0);
  const egresos = gastos.reduce((acc, g) => acc + Number(g.monto), 0);
  const neto = ingresos - egresos;

  const porMetodo = new Map<string, number>();
  for (const c of cobros) {
    const metodo = c.metodo ?? "Sin especificar";
    porMetodo.set(metodo, (porMetodo.get(metodo) ?? 0) + montoFirmado(c));
  }

  const porCategoria = new Map<string, number>();
  for (const g of gastos) {
    porCategoria.set(g.categoria, (porCategoria.get(g.categoria) ?? 0) + Number(g.monto));
  }

  const movimientos: Movimiento[] = [
    ...cobros.map((c) => ({
      id: `c-${c.id}`,
      fecha: c.fecha,
      titulo: c.cliente.nombre,
      detalle: `${c.concepto === "SENA" ? "Seña" : c.concepto === "DEVOLUCION" ? "Devolución" : "Cobro"} · ${c.metodo ?? "sin especificar"}${c.ot ? ` · ${c.ot.numero}` : ""}`,
      monto: montoFirmado(c),
    })),
    ...gastos.map((g) => ({
      id: `g-${g.id}`,
      fecha: g.fecha,
      titulo: g.proveedor,
      detalle: `Gasto · ${ETIQUETAS_CATEGORIA[g.categoria] ?? g.categoria}`,
      monto: -Number(g.monto),
    })),
  ].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  return (
    <section>
      <EncabezadoPagina titulo="Caja" descripcion="Lo que entró, lo que salió y lo que queda." />

      <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl border border-borde bg-superficie p-1">
        {PERIODOS.map((p) => (
          <Link
            key={p.valor}
            href={`/caja?periodo=${p.valor}`}
            className={`rounded-lg py-2 text-center text-[13px] font-semibold ${
              periodo === p.valor ? "bg-primario-suave text-primario" : "text-mutado"
            }`}
          >
            {p.etiqueta}
          </Link>
        ))}
      </div>

      <div
        className={`rounded-2xl border p-4 ${
          neto >= 0 ? "border-exito/30 bg-exito-suave" : "border-peligro/30 bg-peligro-suave"
        }`}
      >
        <p className={`text-[12.5px] font-semibold ${neto >= 0 ? "text-exito" : "text-peligro"}`}>Queda en caja</p>
        <p className={`text-[30px] font-extrabold tracking-tight ${neto >= 0 ? "text-exito" : "text-peligro"}`}>
          {neto < 0 ? "−" : ""}
          {pesos(Math.abs(neto))}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[12px] text-mutado">Entró</p>
            <p className="text-[17px] font-bold text-foreground">{pesos(ingresos)}</p>
          </div>
          <div>
            <p className="text-[12px] text-mutado">Salió</p>
            <p className="text-[17px] font-bold text-foreground">{pesos(egresos)}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <Link href="/cobranzas" className="rounded-xl bg-primario py-3.5 text-center text-[14px] font-bold text-white">
          + Cobrar
        </Link>
        <Link
          href="/gastos/nuevo"
          className="rounded-xl border border-borde bg-superficie py-3.5 text-center text-[14px] font-bold text-foreground"
        >
          + Gasto
        </Link>
      </div>

      <Link
        href="/cobranzas"
        className="mt-3 flex items-center justify-between rounded-2xl border border-alerta/30 bg-alerta-suave px-4 py-3.5"
      >
        <div>
          <p className="text-[12px] font-semibold text-alerta">Por cobrar (cuentas pendientes)</p>
          <p className="text-[19px] font-extrabold text-alerta">{pesos(deuda.total)}</p>
        </div>
        <span className="text-[13px] font-semibold text-alerta">
          {deuda.cantidad} cliente{deuda.cantidad === 1 ? "" : "s"} ›
        </span>
      </Link>

      {(porMetodo.size > 0 || porCategoria.size > 0) && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {porMetodo.size > 0 && (
            <div className="rounded-2xl border border-borde bg-superficie p-4">
              <p className="mb-2 text-[13px] font-semibold text-foreground">Cómo entró la plata</p>
              <ul className="space-y-1.5 text-[13.5px]">
                {[...porMetodo.entries()].map(([metodo, monto]) => (
                  <li key={metodo} className="flex justify-between gap-3">
                    <span className="text-mutado">{metodo}</span>
                    <span className="font-bold text-foreground">{pesos(monto)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {porCategoria.size > 0 && (
            <div className="rounded-2xl border border-borde bg-superficie p-4">
              <p className="mb-2 text-[13px] font-semibold text-foreground">En qué se gastó</p>
              <ul className="space-y-1.5 text-[13.5px]">
                {[...porCategoria.entries()].map(([categoria, monto]) => (
                  <li key={categoria} className="flex justify-between gap-3">
                    <span className="text-mutado">{ETIQUETAS_CATEGORIA[categoria] ?? categoria}</span>
                    <span className="font-bold text-foreground">{pesos(monto)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <h2 className="mb-2 mt-6 text-[15px] font-semibold text-foreground">Movimientos</h2>
      {movimientos.length === 0 ? (
        <p className="rounded-2xl border border-borde bg-superficie p-4 text-center text-[13.5px] text-mutado">
          Todavía no hay movimientos en este período.
        </p>
      ) : (
        <div className="space-y-2">
          {movimientos.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-borde bg-superficie px-3.5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-foreground">{m.titulo}</p>
                <p className="text-[12px] text-mutado">
                  {m.detalle} · {formatoHora.format(m.fecha)}
                </p>
              </div>
              <span className={`shrink-0 text-[15px] font-extrabold ${m.monto >= 0 ? "text-exito" : "text-peligro"}`}>
                {m.monto >= 0 ? "+" : "−"}
                {pesos(Math.abs(m.monto))}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
