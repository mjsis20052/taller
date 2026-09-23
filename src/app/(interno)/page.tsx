import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";
import { TarjetaTurno } from "@/components/tarjeta-turno";
import { BotonCompartirInforme } from "@/components/boton-compartir-informe";
import { resumenPedidos } from "@/lib/pedidos";
import { EstadoOT, EstadoTurno } from "@/generated/prisma/enums";

const ZONA = "America/Argentina/Buenos_Aires";

const ETIQUETAS_ESTADO: Record<string, string> = {
  INGRESADO: "Ingresado",
  EN_DIAGNOSTICO: "En diagnóstico",
  PRESUPUESTADO: "Presupuestado",
  APROBADO: "Aprobado",
  EN_EJECUCION: "En ejecución",
  TERMINADO: "Terminado",
  FACTURADO: "Facturado",
};

function hoyISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: ZONA });
}

export default async function Inicio() {
  const hoy = hoyISO();
  const inicio = new Date(`${hoy}T00:00:00-03:00`);
  const fin = new Date(`${hoy}T23:59:59.999-03:00`);

  const [turnosHoy, otsActivas, esperandoRepuesto] = await Promise.all([
    prisma.turno.findMany({
      where: { fechaHora: { gte: inicio, lte: fin }, estado: EstadoTurno.AGENDADO },
      include: {
        cliente: { select: { id: true, nombre: true, telefono: true } },
        vehiculo: { select: { patente: true, marca: true, modelo: true } },
      },
      orderBy: { fechaHora: "asc" },
    }),
    prisma.ordenTrabajo.findMany({
      where: { estado: { notIn: [EstadoOT.ENTREGADO, EstadoOT.CANCELADA] } },
      include: {
        cliente: { select: { id: true, nombre: true, telefono: true } },
        vehiculo: { select: { patente: true, marca: true, modelo: true } },
        items: { select: { tipo: true, estadoPedido: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.ordenTrabajo.findMany({
      where: {
        estado: { notIn: [EstadoOT.ENTREGADO, EstadoOT.CANCELADA] },
        items: { some: { tipo: "REPUESTO", estadoPedido: { in: ["A_PEDIR", "PEDIDO"] } } },
      },
      select: {
        id: true,
        numero: true,
        vehiculo: { select: { patente: true, marca: true, modelo: true } },
        items: {
          where: { tipo: "REPUESTO", estadoPedido: { in: ["A_PEDIR", "PEDIDO"] } },
          select: { id: true, descripcion: true, estadoPedido: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <section>
      <EncabezadoPagina titulo="Inicio" descripcion="Turnos de hoy y OTs activas." />

      {esperandoRepuesto.length > 0 && (
        <section className="mb-6 rounded-2xl border-2 border-alerta/50 bg-alerta-suave p-4">
          <h2 className="flex items-center gap-2 text-[15.5px] font-extrabold text-alerta">
            <span aria-hidden>⏳</span> Estamos esperando repuestos
          </h2>
          <p className="mb-3 text-[12.5px] text-mutado">No te olvides de reclamarlos o avisarle al cliente cuando lleguen.</p>
          <div className="space-y-2">
            {esperandoRepuesto.map((ot) => (
              <Link key={ot.id} href={`/ots/${ot.id}`} className="block rounded-xl bg-superficie px-3.5 py-3">
                <p className="text-[14px] font-bold text-foreground">
                  {ot.numero} · {ot.vehiculo.marca} {ot.vehiculo.modelo}{" "}
                  <span className="font-medium text-mutado">{ot.vehiculo.patente}</span>
                </p>
                <ul className="mt-1 space-y-0.5">
                  {ot.items.map((i) => {
                    const dias = Math.floor((Date.now() - i.createdAt.getTime()) / 86_400_000);
                    return (
                      <li key={i.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                        <span className="text-foreground">{i.descripcion}</span>
                        <span className="shrink-0 font-semibold text-alerta">
                          {i.estadoPedido === "A_PEDIR" ? "Por pedir" : "Pedido"} · {dias === 0 ? "hoy" : `hace ${dias} d`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </Link>
            ))}
          </div>
        </section>
      )}

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
            {otsActivas.map((ot) => {
              const espera = resumenPedidos(ot.items) === "ESPERANDO";
              return (
                <div
                  key={ot.id}
                  className="flex items-center gap-2 rounded-2xl border border-borde bg-superficie py-2.5 pl-4 pr-3"
                >
                  <Link href={`/ots/${ot.id}`} className="flex min-w-0 flex-1 items-center justify-between gap-3 py-1">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-foreground">{ot.numero}</p>
                      <p className="truncate text-[13px] text-mutado">
                        {ot.cliente.nombre} · {ot.vehiculo.patente}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="rounded-full bg-primario-suave px-2.5 py-1 text-[11px] font-semibold text-primario">
                        {ETIQUETAS_ESTADO[ot.estado] ?? ot.estado}
                      </span>
                      {espera && (
                        <span className="rounded-full bg-alerta-suave px-2.5 py-0.5 text-[10.5px] font-bold text-alerta">
                          Esperando repuesto
                        </span>
                      )}
                    </div>
                  </Link>
                  <BotonCompartirInforme
                    variante="icono"
                    ruta={`/informe/${ot.tokenInforme}`}
                    clienteId={ot.clienteId}
                    nombre={ot.cliente.nombre}
                    telefono={ot.cliente.telefono}
                    texto={`Hola ${ot.cliente.nombre.split(" ")[0]}! Te comparto el informe de tu ${ot.vehiculo.marca} ${ot.vehiculo.modelo} (${ot.numero}). Ahí ves cómo avanza:`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
