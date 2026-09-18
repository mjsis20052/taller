import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";
import { TarjetaTurno } from "@/components/tarjeta-turno";
import { CintaDiasAgenda, type DiaCinta } from "@/components/cinta-dias-agenda";
import { EstadoTurno } from "@/generated/prisma/enums";
import { MARCADOR_PEDIDO_PORTAL } from "@/lib/turno-portal";

export const metadata: Metadata = { title: "Agenda" };

const ZONA = "America/Argentina/Buenos_Aires";
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

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

  // Cinta deslizable: 2 semanas hacia atrás y ~3 meses hacia adelante (y siempre la fecha elegida).
  const hoy = hoyISO();
  const desde = fechaSeleccionada < hoy ? sumarDias(fechaSeleccionada, -14) : sumarDias(hoy, -14);
  const hasta = fechaSeleccionada > sumarDias(hoy, 90) ? sumarDias(fechaSeleccionada, 14) : sumarDias(hoy, 90);
  const diasCinta: DiaCinta[] = [];
  for (let dia = desde; dia <= hasta; dia = sumarDias(dia, 1)) {
    const fechaObj = new Date(`${dia}T12:00:00`);
    diasCinta.push({
      iso: dia,
      diaSemana: DIAS_SEMANA[fechaObj.getDay()],
      numero: fechaObj.getDate(),
      mes: fechaObj.getDate() === 1 ? MESES[fechaObj.getMonth()] : null,
    });
  }

  const incluir = {
    cliente: { select: { nombre: true, telefono: true } },
    vehiculo: { select: { patente: true, marca: true, modelo: true } },
  };
  const sinPedidosWeb = { NOT: { motivo: { startsWith: MARCADOR_PEDIDO_PORTAL } } };

  const porConfirmar = await prisma.turno.findMany({
    where: { estado: EstadoTurno.AGENDADO, motivo: { startsWith: MARCADOR_PEDIDO_PORTAL } },
    include: incluir,
    orderBy: { fechaHora: "asc" },
  });

  const turnos = esLista
    ? await prisma.turno.findMany({
        where: { estado: EstadoTurno.AGENDADO, fechaHora: { gte: new Date() }, ...sinPedidosWeb },
        include: incluir,
        orderBy: { fechaHora: "asc" },
        take: 30,
      })
    : await prisma.turno.findMany({
        where: {
          fechaHora: { gte: limitesDelDia(fechaSeleccionada).inicio, lte: limitesDelDia(fechaSeleccionada).fin },
          ...sinPedidosWeb,
        },
        include: incluir,
        orderBy: { fechaHora: "asc" },
      });

  return (
    <section>
      {porConfirmar.length > 0 && (
        <div id="por-confirmar" className="mb-6 scroll-mt-24 rounded-3xl border border-alerta/30 bg-alerta-suave p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-alerta px-1.5 text-[12px] font-bold text-white">
              {porConfirmar.length}
            </span>
            <p className="text-[15px] font-bold text-foreground">
              {porConfirmar.length === 1 ? "Turno por confirmar" : "Turnos por confirmar"}
            </p>
          </div>
          <p className="mb-3 text-[12.5px] text-mutado">
            Pedidos que hicieron los clientes desde la web. Confirmalos por WhatsApp para avisarles.
          </p>
          <div className="space-y-2.5">
            {porConfirmar.map((turno) => (
              <TarjetaTurno key={turno.id} turno={turno} mostrarFecha />
            ))}
          </div>
        </div>
      )}

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

      {!esLista && <CintaDiasAgenda dias={diasCinta} seleccionado={fechaSeleccionada} hoy={hoy} />}

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
