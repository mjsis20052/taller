import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";
import { TarjetaTurno } from "@/components/tarjeta-turno";
import { EstadoOT, EstadoTurno } from "@/generated/prisma/enums";

const ZONA = "America/Argentina/Buenos_Aires";

function hoyISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: ZONA });
}

export default async function Inicio() {
  const hoy = hoyISO();
  const inicio = new Date(`${hoy}T00:00:00`);
  const fin = new Date(`${hoy}T23:59:59.999`);

  const [turnosHoy, otsActivas] = await Promise.all([
    prisma.turno.findMany({
      where: { fechaHora: { gte: inicio, lte: fin }, estado: EstadoTurno.AGENDADO },
      include: {
        cliente: { select: { nombre: true, telefono: true } },
        vehiculo: { select: { patente: true, marca: true, modelo: true } },
      },
      orderBy: { fechaHora: "asc" },
    }),
    prisma.ordenTrabajo.findMany({
      where: { estado: { notIn: [EstadoOT.ENTREGADO, EstadoOT.CANCELADA] } },
      include: { cliente: { select: { nombre: true } }, vehiculo: { select: { patente: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <section>
      <EncabezadoPagina titulo="Inicio" descripcion="Turnos de hoy y OTs activas." />

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-foreground">Turnos de hoy</h2>
          <Link href="/agenda" className="text-[13.5px] font-semibold text-primario">
            Ver agenda ›
          </Link>
        </div>
        {turnosHoy.length === 0 ? (
          <EstadoVacio
            titulo="Sin turnos para hoy"
            descripcion="Cuando agendes un turno para hoy, aparece acá."
            icono={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
              </svg>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {turnosHoy.map((turno) => (
              <TarjetaTurno key={turno.id} turno={turno} mostrarFecha={false} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-foreground">OTs activas</h2>
          <Link href="/ots" className="text-[13.5px] font-semibold text-primario">
            Ver todas ›
          </Link>
        </div>
        {otsActivas.length === 0 ? (
          <EstadoVacio
            titulo="Sin OTs activas"
            descripcion="Las órdenes de trabajo en curso aparecen acá."
            icono={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {otsActivas.map((ot) => (
              <Link
                key={ot.id}
                href={`/ots/${ot.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-borde bg-superficie px-4 py-3.5"
              >
                <div>
                  <p className="text-[15px] font-semibold text-foreground">{ot.numero}</p>
                  <p className="text-[13px] text-mutado">
                    {ot.cliente.nombre} · {ot.vehiculo.patente}
                  </p>
                </div>
                <span className="rounded-full bg-primario-suave px-2.5 py-1 text-[11px] font-semibold text-primario">
                  {ot.estado}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
