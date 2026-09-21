import type { Metadata } from "next";
import Link from "next/link";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";
import { FormularioCobroCliente } from "@/components/formulario-cobro-cliente";
import { listarCuentas } from "@/lib/cuenta-corriente";
import { pesos } from "@/lib/formato";
import { EnlaceWhatsAppCliente } from "@/components/whatsapp-cliente";

export const metadata: Metadata = { title: "Cuenta corriente" };

export default async function PaginaCobranzas() {
  const cuentas = await listarCuentas();
  const deudores = cuentas.filter((c) => c.saldo > 0);
  const aFavor = cuentas.filter((c) => c.saldo < 0);
  const alDia = cuentas.filter((c) => c.saldo === 0);
  const totalAdeudado = deudores.reduce((acc, d) => acc + d.saldo, 0);
  const totalEnCurso = deudores.reduce((acc, d) => acc + d.enCurso, 0);

  return (
    <section>
      <EncabezadoPagina titulo="Cuenta corriente" descripcion="Todas las cuentas de tus clientes: quién debe, quién tiene a favor y quién está al día." />

      <div className="mb-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl border border-alerta/30 bg-alerta-suave p-4">
          <p className="text-[12px] font-semibold text-alerta">Por cobrar</p>
          <p className="text-[24px] font-extrabold tracking-tight text-alerta">{pesos(totalAdeudado)}</p>
          <p className="text-[12px] text-mutado">
            {deudores.length} cliente{deudores.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/caja" className="rounded-2xl border border-borde bg-superficie p-4">
          <p className="text-[12px] font-semibold text-mutado">Caja</p>
          <p className="mt-1 text-[15px] font-bold text-primario">Ver ingresos y gastos ›</p>
          {totalEnCurso > 0 && (
            <p className="mt-1 text-[12px] text-mutado">{pesos(totalEnCurso)} en trabajos en curso</p>
          )}
        </Link>
      </div>

      {deudores.length === 0 ? (
        <EstadoVacio
          titulo="Nadie te debe nada"
          descripcion="Cuando cargues trabajos en una OT, lo que el cliente todavía no pagó aparece acá."
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <circle cx="12" cy="12" r="10" />
              <path d="m8 12 3 3 5-6" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-3">
          {deudores.map((d) => {
            const texto = `Hola ${d.nombre.split(" ")[0]}! Te escribimos del taller por un saldo pendiente de ${pesos(d.saldo)}. Cualquier duda, escribinos.`;
            return (
              <details key={d.id} className="group rounded-2xl border border-borde bg-superficie p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15.5px] font-bold text-foreground">{d.nombre}</p>
                    <p className="text-[12px] text-mutado">
                      {d.pendientes.length} OT con saldo
                      {d.enCurso > 0 ? ` · ${pesos(d.enCurso)} en curso` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-alerta-suave px-3 py-1.5 text-[14px] font-extrabold text-alerta">
                    {pesos(d.saldo)}
                  </span>
                </summary>

                <div className="mt-3 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {d.pendientes.map((ot) => (
                      <Link
                        key={ot.id}
                        href={`/ots/${ot.id}`}
                        className="rounded-full bg-primario-suave px-3 py-1 text-[12.5px] font-semibold text-primario"
                      >
                        {ot.numero} · {pesos(ot.saldo)}
                      </Link>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <EnlaceWhatsAppCliente
                      clienteId={d.id}
                      nombre={d.nombre}
                      telefono={d.telefono}
                      mensaje={texto}
                      className="flex-1 rounded-xl bg-exito-suave py-2.5 text-center text-[13px] font-semibold text-exito"
                    >
                      Recordar por WhatsApp
                    </EnlaceWhatsAppCliente>
                    <Link
                      href={`/clientes/${d.id}#cuenta`}
                      className="rounded-xl border border-borde px-4 py-2.5 text-[13px] font-semibold text-foreground"
                    >
                      Ver cuenta
                    </Link>
                  </div>

                  <FormularioCobroCliente clienteId={d.id} saldo={d.saldo} pendientes={d.pendientes} />
                </div>
              </details>
            );
          })}
        </div>
      )}

      {aFavor.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-[14px] font-semibold text-foreground">Con saldo a favor</h2>
          <div className="space-y-2">
            {aFavor.map((c) => (
              <Link
                key={c.id}
                href={`/clientes/${c.id}#cuenta`}
                className="flex items-center justify-between gap-3 rounded-xl border border-borde bg-superficie px-4 py-3"
              >
                <span className="text-[14px] font-medium text-foreground">{c.nombre}</span>
                <span className="rounded-full bg-exito-suave px-2.5 py-1 text-[12.5px] font-bold text-exito">
                  {pesos(-c.saldo)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {alDia.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-[14px] font-semibold text-foreground">Al día</h2>
          <div className="space-y-2">
            {alDia.map((c) => (
              <Link
                key={c.id}
                href={`/clientes/${c.id}#cuenta`}
                className="flex items-center justify-between gap-3 rounded-xl border border-borde bg-superficie px-4 py-3"
              >
                <span className="text-[14px] font-medium text-foreground">{c.nombre}</span>
                <span className="text-[12.5px] font-semibold text-exito">Sin deuda ✓</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
