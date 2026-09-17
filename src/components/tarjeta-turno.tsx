"use client";

import Link from "next/link";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { esPedidoDePortal, limpiarMotivoPortal } from "@/lib/turno-portal";
import { cancelarTurno, confirmarPedidoWeb } from "@/app/(interno)/agenda/actions";

const ETIQUETAS_ESTADO: Record<string, { texto: string; clase: string }> = {
  AGENDADO: { texto: "Agendado", clase: "bg-primario-suave text-primario" },
  CANCELADO: { texto: "Cancelado", clase: "bg-peligro-suave text-peligro" },
  CONVERTIDO_OT: { texto: "Convertido a OT", clase: "bg-exito-suave text-exito" },
};

type Turno = {
  id: string;
  fechaHora: Date;
  duracionMin: number;
  motivo: string;
  estado: string;
  cliente: { nombre: string; telefono: string };
  vehiculo: { patente: string; marca: string; modelo: string };
};

export function TarjetaTurno({
  turno,
  mostrarFecha,
}: {
  turno: Turno;
  mostrarFecha: boolean;
}) {
  const hora = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(turno.fechaHora);

  const fecha = mostrarFecha
    ? new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
        timeZone: "America/Argentina/Buenos_Aires",
      }).format(turno.fechaHora)
    : null;

  const fechaCorta = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(turno.fechaHora);

  const estado = ETIQUETAS_ESTADO[turno.estado] ?? ETIQUETAS_ESTADO.AGENDADO;
  const esDePortal = esPedidoDePortal(turno.motivo);
  const motivoLimpio = limpiarMotivoPortal(turno.motivo);
  const nombrePila = turno.cliente.nombre.split(" ")[0];

  const textoWhatsapp = esDePortal
    ? `Hola ${nombrePila}! Recibimos tu pedido de turno para el ${fechaCorta} a las ${hora} hs (${motivoLimpio}). Te lo confirmamos, ¡te esperamos!`
    : `Hola ${nombrePila}! Te recuerdo tu turno en el taller el ${fechaCorta} a las ${hora} hs (${motivoLimpio}). ¡Te esperamos!`;

  return (
    <div className="rounded-2xl border border-borde bg-superficie p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[17px] font-bold text-foreground">{hora}</span>
          {fecha && <span className="text-[12.5px] text-mutado">{fecha}</span>}
          <span className="text-[12.5px] text-mutado">· {turno.duracionMin} min</span>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {esDePortal && (
            <span className="rounded-full bg-exito-suave px-2.5 py-1 text-[11px] font-semibold text-exito">
              Pedido web
            </span>
          )}
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${estado.clase}`}>
            {estado.texto}
          </span>
        </div>
      </div>

      <p className="mt-2 text-[15px] font-semibold text-foreground">{turno.cliente.nombre}</p>
      <p className="text-[13px] text-mutado">
        {turno.vehiculo.patente} · {turno.vehiculo.marca} {turno.vehiculo.modelo}
      </p>
      <p className="mt-1 text-[13.5px] text-foreground">{motivoLimpio}</p>

      {turno.estado === "AGENDADO" && (
        <div className="mt-3 space-y-2">
          <Link
            href={`/ots/nuevo?turnoId=${turno.id}`}
            className="block w-full rounded-lg bg-primario py-2.5 text-center text-[13px] font-semibold text-white"
          >
            Recepcionar vehículo
          </Link>
          <div className="flex gap-2">
            <a
              href={enlaceWhatsApp(turno.cliente.telefono, textoWhatsapp)}
              target="_blank"
              rel="noreferrer"
              onClick={esDePortal ? () => confirmarPedidoWeb(turno.id) : undefined}
              className="flex-1 rounded-lg bg-exito-suave py-2 text-center text-[12.5px] font-semibold text-exito"
            >
              {esDePortal ? "Confirmar por WhatsApp" : "Recordar"}
            </a>
            <Link
              href={`/agenda/${turno.id}/editar`}
              className="rounded-lg border border-borde px-3 py-2 text-[12.5px] font-semibold text-foreground"
            >
              Editar
            </Link>
            <form action={cancelarTurno.bind(null, turno.id)}>
              <button
                type="submit"
                className="rounded-lg border border-borde px-3 py-2 text-[12.5px] font-semibold text-peligro"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
