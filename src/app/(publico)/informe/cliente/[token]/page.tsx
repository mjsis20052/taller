import Link from "next/link";
import { notFound } from "next/navigation";
import { MENSAJES_ESTADO, Progreso, TarjetaImportes } from "@/components/informe-vista";
import { cargarInformeCliente } from "@/lib/informe";
import { BotonHacerPago } from "@/components/boton-hacer-pago";
import { pesos } from "@/lib/formato";

export const dynamic = "force-dynamic";

const fechaCorta = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
});

export default async function PaginaInformeCliente({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const informe = await cargarInformeCliente(token);
  if (!informe) notFound();

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#4338ca] via-[#6366f1] to-[#818cf8] p-6 text-white shadow-xl">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
        <p className="text-[12.5px] font-semibold uppercase tracking-widest text-white/80">Historial de trabajos</p>
        <h1 className="mt-2 text-[27px] font-extrabold leading-tight tracking-tight">{informe.nombre}</h1>
        <p className="mt-2 text-[13.5px] text-white/85">
          {informe.ots.length} trabajo{informe.ots.length === 1 ? "" : "s"} en el taller
        </p>
      </section>

      {informe.ots.length > 0 && <TarjetaImportes total={informe.total} pagado={informe.pagado} saldo={informe.saldo} />}
      <BotonHacerPago saldo={informe.saldo} cobro={informe.cobro} />

      {informe.ots.length === 0 && (
        <p className="rounded-3xl border border-borde bg-superficie p-6 text-center text-[14px] text-mutado">
          Todavía no hay trabajos registrados.
        </p>
      )}

      <div className="space-y-3">
        {informe.ots.map((ot) => {
          const mensaje = MENSAJES_ESTADO[ot.estado];
          return (
            <details key={ot.token} className="group rounded-3xl border border-borde bg-superficie p-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[16px] font-extrabold tracking-tight text-foreground">
                    {ot.vehiculo.marca} {ot.vehiculo.modelo}
                  </p>
                  <p className="text-[12.5px] text-mutado">
                    {ot.numero} · {ot.vehiculo.patente} · {fechaCorta.format(ot.fecha)}
                  </p>
                  <p className="mt-1.5 inline-block rounded-full bg-primario-suave px-2.5 py-0.5 text-[12px] font-bold text-primario">
                    {mensaje?.titulo ?? ot.estado}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[16px] font-extrabold text-foreground">{pesos(ot.total)}</p>
                  <p className={`text-[11.5px] font-semibold ${ot.saldo > 0 ? "text-alerta" : "text-exito"}`}>
                    {ot.saldo > 0 ? `Falta ${pesos(ot.saldo)}` : "Pagado ✓"}
                  </p>
                </div>
              </summary>

              <div className="mt-5 space-y-4 border-t border-borde pt-4">
                <Progreso estado={ot.estado} />

                {ot.trabajos.length > 0 && (
                  <div>
                    <p className="mb-1 text-[13px] font-bold uppercase tracking-wide text-mutado">Trabajos</p>
                    <ul className="divide-y divide-borde">
                      {ot.trabajos.map((t) => (
                        <li key={t.id} className="flex justify-between gap-3 py-2.5 text-[13.5px]">
                          <span className="text-foreground">{t.descripcion}</span>
                          <span className="shrink-0 font-bold text-foreground">{pesos(t.subtotal)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {ot.repuestos.length > 0 && (
                  <div>
                    <p className="mb-1 text-[13px] font-bold uppercase tracking-wide text-mutado">Repuestos</p>
                    <ul className="divide-y divide-borde">
                      {ot.repuestos.map((r) => (
                        <li key={r.id} className="flex justify-between gap-3 py-2.5 text-[13.5px]">
                          <span className="text-foreground">
                            {r.descripcion} <span className="text-mutado">×{r.cantidad}</span>
                          </span>
                          <span className="shrink-0 font-bold text-foreground">{pesos(r.subtotal)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link
                  href={`/informe/${ot.token}`}
                  className="block rounded-xl bg-primario-suave py-3 text-center text-[14px] font-bold text-primario"
                >
                  Ver el informe completo de {ot.numero} ›
                </Link>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
