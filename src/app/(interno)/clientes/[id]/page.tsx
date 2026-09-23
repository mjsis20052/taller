import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EstadoVacio } from "@/components/estado-vacio";
import { SeccionVehiculosCliente } from "@/components/seccion-vehiculos-cliente";
import { EnlaceWhatsAppCliente } from "@/components/whatsapp-cliente";
import { cuentaCliente } from "@/lib/cuenta-corriente";
import { SeccionCuentaCliente } from "@/components/seccion-cuenta-cliente";
import { pesos } from "@/lib/formato";
import { cambiarActivoCliente } from "@/app/(interno)/clientes/actions";

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

  const cuenta = await cuentaCliente(cliente.id);

  return (
    <section>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-[26px] font-bold tracking-tight text-foreground">
            {cliente.nombre}
          </h1>
          <p className="mt-1 text-[14px] text-mutado">
            {ETIQUETAS_TIPO_PERSONA[cliente.tipoPersona]} ·{" "}
            {ETIQUETAS_CONDICION_FISCAL[cliente.condicionFiscal]}
          </p>
        </div>
        {cuenta.saldo !== 0 && (
          <a
            href="#cuenta"
            className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold ${
              cuenta.saldo > 0 ? "bg-alerta-suave text-alerta" : "bg-exito-suave text-exito"
            }`}
          >
            {cuenta.saldo > 0 ? `Debe ${pesos(cuenta.saldo)}` : `A favor ${pesos(-cuenta.saldo)}`}
          </a>
        )}
        {!cliente.activo && (
          <span className="shrink-0 rounded-full bg-alerta-suave px-2.5 py-1 text-[11px] font-semibold text-alerta">
            Inactivo
          </span>
        )}
      </header>

      <div className="flex gap-2">
        <EnlaceWhatsAppCliente
          clienteId={cliente.id}
          nombre={cliente.nombre}
          telefono={cliente.telefono}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-exito-suave py-3 text-[14px] font-semibold text-exito"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.8c2.19 0 4.25.85 5.8 2.4a8.13 8.13 0 0 1 2.4 5.8c0 4.52-3.68 8.2-8.2 8.2a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.35c0-4.52 3.68-8.19 8.2-8.19m-4.52 4.7c-.15 0-.4.06-.61.3-.21.24-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.11.15 1.6 2.45 3.9 3.4.55.24.98.38 1.31.48.55.18 1.05.15 1.44.09.44-.07 1.36-.55 1.55-1.09.19-.53.19-.98.13-1.08-.06-.09-.21-.15-.44-.27-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.11-.52.11-.15.23-.6.75-.73.9-.13.15-.27.17-.5.06-.23-.11-.96-.35-1.83-1.13-.68-.6-1.13-1.35-1.27-1.57-.13-.23-.01-.35.1-.46.11-.11.23-.27.35-.4.11-.13.15-.23.23-.38.08-.15.04-.29-.02-.4-.06-.11-.52-1.26-.72-1.72-.19-.45-.38-.39-.52-.4z" />
          </svg>
          WhatsApp
        </EnlaceWhatsAppCliente>
        <Link
          href={`/agenda/nuevo?clienteId=${cliente.id}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primario-suave py-3 text-[14px] font-semibold text-primario"
        >
          + Turno
        </Link>
      </div>

      <div className="mt-3 space-y-2 rounded-2xl border border-borde bg-superficie p-4 text-[14.5px]">
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

      <SeccionCuentaCliente cuenta={cuenta} />

      <SeccionVehiculosCliente clienteId={cliente.id} vehiculos={cliente.vehiculos} />

      <section className="mt-8">
        <h2 className="mb-3 text-[17px] font-semibold text-foreground">
          Órdenes de trabajo
        </h2>
        {cliente.ordenesTrabajo.length === 0 ? (
          <EstadoVacio
            titulo="Sin OTs"
            descripcion="Todavía no se cargó ninguna orden de trabajo para este cliente."
            icono={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {cliente.ordenesTrabajo.map((ot) => (
              <Link
                key={ot.id}
                href={`/ots/${ot.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-borde bg-superficie px-4 py-3.5"
              >
                <div>
                  <p className="text-[15px] font-semibold text-foreground">{ot.numero}</p>
                  <p className="text-[13px] text-mutado">{ot.estado}</p>
                </div>
                <span className="text-mutado">›</span>
              </Link>
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
