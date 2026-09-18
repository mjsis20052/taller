import { obtenerConfigHorarios } from "@/lib/horarios";
import { DIAS_SEMANA } from "@/lib/horarios-comunes";

export async function HorariosPublico() {
  const config = await obtenerConfigHorarios();
  const hayAlgunDia = DIAS_SEMANA.some((d) => (config.horarios[d.valor] ?? []).length > 0);
  if (!hayAlgunDia) return null;

  return (
    <section>
      <h2 className="text-[22px] font-bold tracking-tight text-foreground">Cuándo atendemos</h2>
      <p className="mt-1.5 text-[14.5px] text-mutado">
        Estos son los horarios en los que podés pedir turno online.
      </p>
      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {DIAS_SEMANA.map((dia) => {
          const horas = config.horarios[dia.valor] ?? [];
          return (
            <div
              key={dia.valor}
              className={`rounded-2xl border p-4 ${
                horas.length > 0 ? "border-borde bg-superficie" : "border-borde/60 bg-transparent"
              }`}
            >
              <p className={`text-[14.5px] font-semibold ${horas.length > 0 ? "text-foreground" : "text-mutado"}`}>
                {dia.etiqueta}
              </p>
              {horas.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {horas.map((hora) => (
                    <span
                      key={hora}
                      className="rounded-full bg-primario-suave px-2.5 py-1 text-[12.5px] font-semibold text-primario"
                    >
                      {hora}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-[13px] text-mutado">Cerrado</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
