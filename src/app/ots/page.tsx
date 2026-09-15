import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";
import { EstadoOT } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Órdenes de trabajo" };

const ETIQUETAS_ESTADO: Record<string, string> = {
  TURNO_AGENDADO: "Turno agendado",
  INGRESADO: "Ingresado",
  EN_DIAGNOSTICO: "En diagnóstico",
  PRESUPUESTADO: "Presupuestado",
  APROBADO: "Aprobado",
  EN_EJECUCION: "En ejecución",
  TERMINADO: "Terminado",
  FACTURADO: "Facturado",
  ENTREGADO: "Entregado",
  CANCELADA: "Cancelada",
};

const FILTROS = [
  { valor: "activas", etiqueta: "Activas" },
  { valor: "todas", etiqueta: "Todas" },
  { valor: "ENTREGADO", etiqueta: "Entregadas" },
  { valor: "CANCELADA", etiqueta: "Canceladas" },
];

export default async function PaginaOTs({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const filtro = estado ?? "activas";

  const where =
    filtro === "todas"
      ? {}
      : filtro === "activas"
        ? { estado: { notIn: [EstadoOT.ENTREGADO, EstadoOT.CANCELADA] } }
        : { estado: filtro as EstadoOT };

  const ots = await prisma.ordenTrabajo.findMany({
    where,
    include: {
      cliente: { select: { nombre: true } },
      vehiculo: { select: { patente: true, marca: true, modelo: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <section>
      <EncabezadoPagina titulo="Órdenes de trabajo" descripcion="Listado por estado." />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <Link
            key={f.valor}
            href={`/ots?estado=${f.valor}`}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${
              filtro === f.valor
                ? "border-primario bg-primario-suave text-primario"
                : "border-borde bg-superficie text-mutado"
            }`}
          >
            {f.etiqueta}
          </Link>
        ))}
      </div>

      {ots.length === 0 ? (
        <EstadoVacio
          titulo="Sin órdenes de trabajo"
          descripcion="Las OTs se crean recepcionando un vehículo, desde un turno o de forma directa."
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {ots.map((ot) => (
            <Link
              key={ot.id}
              href={`/ots/${ot.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-borde bg-superficie px-4 py-3.5"
            >
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-foreground">{ot.numero}</p>
                <p className="truncate text-[13px] text-mutado">
                  {ot.cliente.nombre} · {ot.vehiculo.patente}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-primario-suave px-2.5 py-1 text-[11px] font-semibold text-primario">
                {ETIQUETAS_ESTADO[ot.estado]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
