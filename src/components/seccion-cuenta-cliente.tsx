import Link from "next/link";
import type { CuentaCliente } from "@/lib/cuenta-corriente";
import { pesos } from "@/lib/formato";
import { FormularioCobroCliente } from "@/components/formulario-cobro-cliente";
import { BotonQuitarConfirmando } from "@/components/boton-quitar-confirmando";
import { eliminarPagoOT } from "@/app/(interno)/cobranzas/actions";

const ETIQUETAS_CONCEPTO: Record<string, { texto: string; clase: string }> = {
  SENA: { texto: "Seña", clase: "bg-primario-suave text-primario" },
  PAGO: { texto: "Pago", clase: "bg-exito-suave text-exito" },
  DEVOLUCION: { texto: "Devolución", clase: "bg-peligro-suave text-peligro" },
};

const ETIQUETAS_ESTADO: Record<string, string> = {
  INGRESADO: "Ingresado",
  EN_DIAGNOSTICO: "En diagnóstico",
  PRESUPUESTADO: "Presupuestado",
  APROBADO: "Aprobado",
  EN_EJECUCION: "En ejecución",
  TERMINADO: "Terminado",
  FACTURADO: "Facturado",
  ENTREGADO: "Entregado",
};

const formatoFecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeZone: "America/Argentina/Buenos_Aires" });

// Cuenta corriente del cliente: lo que se le cargó, lo que pagó y lo que debe.
export function SeccionCuentaCliente({ cuenta }: { cuenta: CuentaCliente }) {
  const debe = cuenta.saldo > 0;
  const aFavor = cuenta.saldo < 0;

  return (
    <section id="cuenta" className="mt-8 scroll-mt-20">
      <h2 className="mb-3 text-[17px] font-semibold text-foreground">Cuenta corriente</h2>

      <div
        className={`rounded-2xl border p-4 ${
          debe ? "border-alerta/30 bg-alerta-suave" : aFavor ? "border-exito/30 bg-exito-suave" : "border-borde bg-superficie"
        }`}
      >
        <p className={`text-[12.5px] font-semibold ${debe ? "text-alerta" : aFavor ? "text-exito" : "text-mutado"}`}>
          {debe ? "Debe" : aFavor ? "Saldo a favor" : "Al día"}
        </p>
        <p className={`text-[26px] font-extrabold tracking-tight ${debe ? "text-alerta" : aFavor ? "text-exito" : "text-foreground"}`}>
          {pesos(Math.abs(cuenta.saldo))}
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[12px]">
          <div>
            <p className="text-mutado">Terminado</p>
            <p className="font-bold text-foreground">{pesos(cuenta.totalTerminado)}</p>
          </div>
          <div>
            <p className="text-mutado">En curso</p>
            <p className="font-bold text-foreground">{pesos(cuenta.totalEnCurso)}</p>
          </div>
          <div>
            <p className="text-mutado">Pagó</p>
            <p className="font-bold text-foreground">{pesos(cuenta.cobrado)}</p>
          </div>
        </div>
        {cuenta.totalEnCurso > 0 && (
          <p className="mt-2 text-[12px] text-mutado">
            Lo &quot;en curso&quot; ya suma: cada trabajo o repuesto que cargás en una OT se agrega a lo que debe.
          </p>
        )}
      </div>

      {cuenta.ots.length > 0 && (
        <div className="mt-3 space-y-2">
          {cuenta.ots.map((ot) => (
            <Link
              key={ot.id}
              href={`/ots/${ot.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-borde bg-superficie px-3.5 py-3"
            >
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-foreground">{ot.numero}</p>
                <p className="text-[12px] text-mutado">
                  {ETIQUETAS_ESTADO[ot.estado] ?? ot.estado} · {pesos(ot.total)} · pagó {pesos(ot.pagado)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold ${
                  ot.saldo > 0 ? "bg-alerta-suave text-alerta" : "bg-exito-suave text-exito"
                }`}
              >
                {ot.saldo > 0 ? `Debe ${pesos(ot.saldo)}` : ot.saldo < 0 ? `A favor ${pesos(-ot.saldo)}` : "Saldada"}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-3">
        <FormularioCobroCliente
          clienteId={cuenta.clienteId}
          saldo={Math.max(cuenta.saldo, 0)}
          pendientes={cuenta.pendientes.map((o) => ({ id: o.id, numero: o.numero, saldo: o.saldo }))}
        />
      </div>

      {cuenta.movimientos.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-[14px] font-semibold text-foreground">Pagos y devoluciones</h3>
          <div className="space-y-2">
            {cuenta.movimientos.map((m) => {
              const etiqueta = ETIQUETAS_CONCEPTO[m.concepto] ?? ETIQUETAS_CONCEPTO.PAGO;
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-borde bg-superficie px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium text-foreground">
                      <span className={`mr-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${etiqueta.clase}`}>
                        {etiqueta.texto}
                      </span>
                      {m.metodo ?? "Sin especificar"}
                      {m.otNumero ? ` · ${m.otNumero}` : " · a cuenta"}
                    </p>
                    <p className="text-[12px] text-mutado">
                      {formatoFecha.format(m.fecha)}
                      {m.notas ? ` · ${m.notas}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className={`text-[14.5px] font-bold ${m.monto < 0 ? "text-peligro" : "text-foreground"}`}>
                      {m.monto < 0 ? "−" : ""}
                      {pesos(Math.abs(m.monto))}
                    </span>
                    <BotonQuitarConfirmando
                      accion={eliminarPagoOT.bind(null, m.id, m.otId ?? "")}
                      titulo={`¿Borrar este ${etiqueta.texto.toLowerCase()} de ${pesos(Math.abs(m.monto))}?`}
                      detalle="Se saca de la cuenta del cliente y de la caja. Usalo solo si lo cargaste por error."
                      textoConfirmar="Sí, borrar"
                      etiqueta="Borrar movimiento"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
