import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";

export const metadata: Metadata = { title: "Facturación" };

const ETIQUETAS_ESTADO: Record<string, string> = {
  PENDIENTE: "Pendiente de enviar",
  ENVIADA: "En cola del estudio",
  FACTURADA: "Facturada",
  ERROR: "Con error",
};

export default async function PaginaFacturacion() {
  const solicitudes = await prisma.solicitudFacturacion.findMany({
    where: { estado: { not: "FACTURADA" } },
    include: { ot: { select: { numero: true, cliente: { select: { nombre: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <section>
      <EncabezadoPagina
        titulo="Facturación"
        descripcion="Cola manual: acá el estudio carga número, CAE y PDF de cada solicitud."
      />

      {solicitudes.length === 0 ? (
        <EstadoVacio
          titulo="Sin solicitudes pendientes"
          descripcion="Cuando una OT terminada genere una solicitud de facturación, aparece acá."
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M14 2v6h6" />
              <path d="M4 22V4a2 2 0 0 1 2-2h8l6 6v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {solicitudes.map((s) => (
            <Link
              key={s.id}
              href={`/facturacion/${s.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-borde bg-superficie px-4 py-3.5"
            >
              <div>
                <p className="text-[15px] font-semibold text-foreground">{s.ot.numero}</p>
                <p className="text-[13px] text-mutado">
                  {s.ot.cliente.nombre} · ${Number(s.total).toLocaleString("es-AR")}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  s.estado === "ERROR" ? "bg-peligro-suave text-peligro" : "bg-alerta-suave text-alerta"
                }`}
              >
                {ETIQUETAS_ESTADO[s.estado]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
