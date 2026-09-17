import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";
import { TarjetaTurno } from "@/components/tarjeta-turno";
import { EstadoTurno } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Agenda" };

const ZONA = "America/Argentina/Buenos_Aires";
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function hoyISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: ZONA });
}

function sumarDias(fechaISO: string, dias: number): string {
  const fecha = new Date(`${fechaISO}T00:00:00`);
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

function limitesDelDia(fechaISO: string) {
  const inicio = new Date(`${fechaISO}T00:00:00`);
  const fin = new Date(`${fechaISO}T23:59:59.999`);
  return { inicio, fin };
}

export default async function PaginaAgenda({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; vista?: string }>;
}) {
  const { fecha, vista } = await searchParams;
  const fechaSeleccionada = fecha ?? hoyISO();
  const esLista = vista === "lista";

  const diasSemana = Array.from({ length: 7 }, (_, i) => sumarDias(fechaSeleccionada, i - 3));

  const turnos = esLista
    ? await prisma.turno.findMany({
        where: {
          estado: EstadoTurno.AGENDADO,
          fechaHora: { gte: new Date() },
        },
        include: {
          cliente: { select: { nombre: true, telefono: true } },
          vehiculo: { select: { patente: true, marca: true, modelo: true } },
        },
        orderBy: { fechaHora: "asc" },
        take: 30,
      })
    : await prisma.turno.findMany({
        where: { fechaHora: { gte: limitesDelDia(fechaSeleccionada).inicio, lte: limitesDelDia(fechaSeleccionada).fin } },
        include: {
          cliente: { select: { nombre: true, telefono: true } },
          vehiculo: { select: { patente: true, marca: true, modelo: true } },
        },
        orderBy: { fechaHora: "asc" },
      });

  return (
    <section>
      <div className="mb-5 flex items-start justify-between gap-3">
        <EncabezadoPagina titulo="Agenda" />
        <div className="flex shrink-0 gap-1 rounded-xl border border-borde bg-superficie p-1">
          <Link
            href={`/agenda?fecha=${fechaSeleccionada}`}
            className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold ${
              !esLista ? "bg-primario-suave text-primario" : "text-mutado"
            }`}
          >
            Día
          </Link>
          <Link
            href="/agenda?vista=lista"
            className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold ${
              esLista ? "bg-primario-suave text-primario" : "text-mutado"
            }`}
          >
            Lista
          </Link>
        </div>
      </div>

      {!esLista && (
        <div className="mb-5 grid grid-cols-7 gap-1.5">
          {diasSemana.map((dia) => {
            const fechaObj = new Date(`${dia}T12:00:00`);
            const esHoy = dia === hoyISO();
            const esSeleccionado = dia === fechaSeleccionada;
            return (
              <Link
                key={dia}
                href={`/agenda?fecha=${dia}`}
                className={`flex flex-col items-center gap-1 rounded-xl border py-2 text-center ${
                  esSeleccionado
                    ? "border-primario bg-primario text-white"
                    : "border-borde bg-superficie text-foreground"
                }`}
              >
                <span
                  className={`text-[10.5px] font-medium uppercase ${
                    esSeleccionado ? "text-white/80" : "text-mutado"
                  }`}
                >
                  {DIAS_SEMANA[fechaObj.getDay()]}
                </span>
                <span className={`text-[15px] font-bold ${esHoy && !esSeleccionado ? "text-primario" : ""}`}>
                  {fechaObj.getDate()}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/agenda?fecha=${sumarDias(fechaSeleccionada, -1)}`}
          className="rounded-lg p-2 text-mutado"
          aria-label="Día anterior"
        >
          ‹
        </Link>
        <div className="text-center">
          <p className="text-[14.5px] font-semibold text-foreground">
            {esLista
              ? "Próximos turnos"
              : new Intl.DateTimeFormat("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  timeZone: ZONA,
                }).format(new Date(`${fechaSeleccionada}T12:00:00`))}
          </p>
          {!esLista && fechaSeleccionada !== hoyISO() && (
            <Link href="/agenda" className="text-[12.5px] font-semibold text-primario">
              Ir a hoy
            </Link>
          )}
        </div>
        {esLista ? (
          <span className="w-9" />
        ) : (
          <Link
            href={`/agenda?fecha=${sumarDias(fechaSeleccionada, 1)}`}
            className="rounded-lg p-2 text-mutado"
            aria-label="Día siguiente"
          >
            ›
          </Link>
        )}
      </div>

      {turnos.length === 0 ? (
        <EstadoVacio
          titulo={esLista ? "Sin turnos próximos" : "Sin turnos este día"}
          descripcion="Agendá un turno con el botón + de abajo."
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
          {turnos.map((turno) => (
            <TarjetaTurno key={turno.id} turno={turno} mostrarFecha={esLista} />
          ))}
        </div>
      )}
    </section>
  );
}
