"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export type DiaCinta = {
  iso: string;
  diaSemana: string;
  numero: number;
  // Solo el día 1 de cada mes lleva el nombre del mes.
  mes: string | null;
};

export function CintaDiasAgenda({
  dias,
  seleccionado,
  hoy,
}: {
  dias: DiaCinta[];
  seleccionado: string;
  hoy: string;
}) {
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const caja = contenedor.current;
    const elegido = caja?.querySelector<HTMLElement>("[data-seleccionado]");
    if (!caja || !elegido) return;
    caja.scrollLeft = elegido.offsetLeft - (caja.clientWidth - elegido.offsetWidth) / 2;
  }, [seleccionado]);

  return (
    <div
      ref={contenedor}
      className="sin-barra -mx-4 mb-5 flex snap-x snap-proximity gap-1.5 overflow-x-auto px-4 pb-1"
      aria-label="Días de la agenda: deslizá para ver más"
    >
      {dias.map((dia) => {
        const esSeleccionado = dia.iso === seleccionado;
        const esHoy = dia.iso === hoy;
        return (
          <Link
            key={dia.iso}
            href={`/agenda?fecha=${dia.iso}`}
            prefetch={false}
            {...(esSeleccionado ? { "data-seleccionado": "" } : {})}
            className={`flex w-[52px] shrink-0 snap-center flex-col items-center gap-1 rounded-xl border py-2 text-center ${
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
              {dia.mes ?? dia.diaSemana}
            </span>
            <span className={`text-[16px] font-bold ${esHoy && !esSeleccionado ? "text-primario" : ""}`}>
              {dia.numero}
            </span>
            <span
              className={`h-1 w-1 rounded-full ${esHoy ? (esSeleccionado ? "bg-white" : "bg-primario") : "bg-transparent"}`}
            />
          </Link>
        );
      })}
    </div>
  );
}
