import { hoyEnArgentina, obtenerConfigHorarios } from "@/lib/horarios";
import { DIAS_SEMANA } from "@/lib/horarios-comunes";

export async function HorariosPublico() {
  const config = await obtenerConfigHorarios();
  const hoy = hoyEnArgentina();
  const proximosEspeciales = Object.entries(config.especiales)
    .filter(([fecha]) => fecha >= hoy)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 6);
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

      {proximosEspeciales.length > 0 && (
        <div className="mt-4 rounded-2xl border border-borde bg-superficie p-4">
          <p className="text-[14.5px] font-semibold text-foreground">Días especiales</p>
          <ul className="mt-2 space-y-1.5">
            {proximosEspeciales.map(([fecha, horas]) => (
              <li key={fecha} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px]">
                <span className="font-medium capitalize text-foreground">
                  {new Date(`${fecha}T12:00:00`).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                </span>
                {horas.length === 0 ? (
                  <span className="rounded-full bg-peligro-suave px-2.5 py-0.5 text-[11.5px] font-semibold text-peligro">Cerrado</span>
                ) : (
                  horas.map((hora) => (
                    <span key={hora} className="rounded-full bg-primario-suave px-2.5 py-0.5 text-[12px] font-semibold text-primario">
                      {hora}
                    </span>
                  ))
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
