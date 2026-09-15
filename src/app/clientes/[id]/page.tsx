import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EstadoVacio } from "@/components/estado-vacio";
import { cambiarActivoCliente } from "@/app/clientes/actions";

const ETIQUETAS_CONDICION_FISCAL: Record<string, string> = {
  CONSUMIDOR_FINAL: "Consumidor final",
  RESPONSABLE_INSCRIPTO: "Responsable inscripto",
  MONOTRIBUTISTA: "Monotributista",
  EXENTO: "Exento",
};

const ETIQUETAS_TIPO_PERSONA: Record<string, string> = {
  FISICA: "Física",
  JURIDICA: "Jurídica",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    select: { nombre: true },
  });
  return { title: cliente?.nombre ?? "Cliente" };
}

export default async function PaginaDetalleCliente({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      vehiculos: { orderBy: { patente: "asc" } },
      ordenesTrabajo: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!cliente) notFound();

  return (
    <section>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-foreground">
            {cliente.nombre}
          </h1>
          <p className="mt-1 text-[14px] text-mutado">
            {ETIQUETAS_TIPO_PERSONA[cliente.tipoPersona]} ·{" "}
            {ETIQUETAS_CONDICION_FISCAL[cliente.condicionFiscal]}
          </p>
        </div>
        {!cliente.activo && (
          <span className="shrink-0 rounded-full bg-alerta-suave px-2.5 py-1 text-[11px] font-semibold text-alerta">
            Inactivo
          </span>
        )}
      </header>

      <div className="space-y-2 rounded-2xl border border-borde bg-superficie p-4 text-[14.5px]">
        <FilaDato etiqueta="Teléfono" valor={cliente.telefono} />
        {cliente.dni && <FilaDato etiqueta="DNI" valor={cliente.dni} />}
        {cliente.cuit && <FilaDato etiqueta="CUIT" valor={cliente.cuit} />}
        {cliente.email && <FilaDato etiqueta="Email" valor={cliente.email} />}
        {cliente.domicilio && <FilaDato etiqueta="Domicilio" valor={cliente.domicilio} />}
        {cliente.notas && <FilaDato etiqueta="Notas" valor={cliente.notas} />}
      </div>

      <div className="mt-3 flex gap-2">
        <Link
          href={`/clientes/${cliente.id}/editar`}
          className="flex-1 rounded-xl border border-borde bg-superficie py-3 text-center text-[14px] font-semibold text-foreground"
        >
          Editar
        </Link>
        <form
          action={cambiarActivoCliente.bind(null, cliente.id, !cliente.activo)}
          className="flex-1"
        >
          <button
            type="submit"
            className="w-full rounded-xl border border-borde bg-superficie py-3 text-[14px] font-semibold text-peligro"
          >
            {cliente.activo ? "Dar de baja" : "Reactivar"}
          </button>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-[17px] font-semibold text-foreground">Vehículos</h2>
        {cliente.vehiculos.length === 0 ? (
          <EstadoVacio
            etiquetaFase="Tarea 4"
            titulo="Sin vehículos"
            descripcion="El alta de vehículos se arma en la Tarea 4 del roadmap."
            icono={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <path d="M5 17h14l1.5-5.5a2 2 0 0 0-1.9-2.5H6.4a2 2 0 0 0-1.9 1.4L3 17" />
                <circle cx="7.5" cy="17.5" r="1.5" />
                <circle cx="16.5" cy="17.5" r="1.5" />
              </svg>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {cliente.vehiculos.map((vehiculo) => (
              <div
                key={vehiculo.id}
                className="rounded-2xl border border-borde bg-superficie px-4 py-3.5"
              >
                <p className="text-[15px] font-semibold text-foreground">
                  {vehiculo.patente}
                </p>
                <p className="text-[13px] text-mutado">
                  {vehiculo.marca} {vehiculo.modelo}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-[17px] font-semibold text-foreground">
          Órdenes de trabajo
        </h2>
        {cliente.ordenesTrabajo.length === 0 ? (
          <EstadoVacio
            etiquetaFase="Tarea 6"
            titulo="Sin OTs"
            descripcion="El módulo de órdenes de trabajo se arma en la Tarea 6 del roadmap."
            icono={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {cliente.ordenesTrabajo.map((ot) => (
              <div
                key={ot.id}
                className="rounded-2xl border border-borde bg-superficie px-4 py-3.5"
              >
                <p className="text-[15px] font-semibold text-foreground">{ot.numero}</p>
                <p className="text-[13px] text-mutado">{ot.estado}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function FilaDato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-mutado">{etiqueta}</span>
      <span className="text-right font-medium text-foreground">{valor}</span>
    </div>
  );
}
