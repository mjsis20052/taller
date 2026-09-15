import type { ReactNode } from "react";

export function EstadoVacio({
  icono,
  titulo,
  descripcion,
  etiquetaFase,
}: {
  icono: ReactNode;
  titulo: string;
  descripcion: string;
  etiquetaFase?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde bg-superficie px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primario-suave text-primario">
        {icono}
      </div>
      <div className="space-y-1">
        <h2 className="text-[15px] font-semibold text-foreground">{titulo}</h2>
        <p className="mx-auto max-w-[26ch] text-[13.5px] leading-snug text-mutado">
          {descripcion}
        </p>
      </div>
      {etiquetaFase && (
        <span className="mt-1 rounded-full bg-alerta-suave px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-alerta">
          {etiquetaFase}
        </span>
      )}
    </div>
  );
}
