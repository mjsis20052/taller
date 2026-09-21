"use client";

import Link from "next/link";
import { useState } from "react";
import { Drawer } from "vaul";
import type { DeudorDetalle } from "@/lib/cuenta-corriente";
import { pesos } from "@/lib/formato";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { FormularioCobroCliente } from "@/components/formulario-cobro-cliente";

function IconoBilletera(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
      <path d="M3 7h16a2 2 0 0 1 2 2v2h-4a2 2 0 0 0 0 4h4" />
      <circle cx="17.5" cy="13" r=".6" fill="currentColor" />
    </svg>
  );
}

// Ícono con el número de clientes que no pagaron. Abre la cuenta corriente: quién debe,
// todo lo que se le cargó y desde ahí mismo se cobra, se devuelve o se le recuerda por WhatsApp.
export function IconoCuentaCorriente({ deudores }: { deudores: DeudorDetalle[] }) {
  const [abierto, setAbierto] = useState(false);
  const total = deudores.reduce((acc, d) => acc + d.saldo, 0);

  return (
    <Drawer.Root open={abierto} onOpenChange={setAbierto}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          aria-label={`Cuenta corriente${deudores.length > 0 ? `: ${deudores.length} clientes deben` : ""}`}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-mutado active:bg-black/5"
        >
          <IconoBilletera className="h-5 w-5" />
          {deudores.length > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-alerta px-1 text-[10px] font-bold text-white">
              {deudores.length}
            </span>
          )}
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92vh] max-w-lg flex-col rounded-t-3xl border border-borde bg-superficie outline-none">
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-borde" />
          <div className="overflow-y-auto p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
            <Drawer.Title className="text-[20px] font-extrabold tracking-tight text-foreground">
              Cuenta corriente
            </Drawer.Title>
            <Drawer.Description className="mt-1 text-[13.5px] text-mutado">
              Clientes que todavía no pagaron todo.
            </Drawer.Description>

            {deudores.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-borde bg-background p-5 text-center text-[14px] text-mutado">
                Nadie te debe nada. ¡Todo al día!
              </p>
            ) : (
              <>
                <div className="mt-4 rounded-2xl border border-alerta/30 bg-alerta-suave p-4">
                  <p className="text-[12px] font-semibold text-alerta">Por cobrar</p>
                  <p className="text-[26px] font-extrabold tracking-tight text-alerta">{pesos(total)}</p>
                  <p className="text-[12px] text-mutado">
                    {deudores.length} cliente{deudores.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {deudores.map((d) => (
                    <details key={d.id} className="rounded-2xl border border-borde bg-superficie p-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[15.5px] font-bold text-foreground">{d.nombre}</p>
                          <p className="text-[12px] text-mutado">
                            {d.ots.length} OT · {d.telefono}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-alerta-suave px-3 py-1.5 text-[14px] font-extrabold text-alerta">
                          {pesos(d.saldo)}
                        </span>
                      </summary>

                      <div className="mt-4 space-y-4">
                        {d.ots.map((ot) => (
                          <div key={ot.id} className="rounded-xl border border-borde bg-background p-3">
                            <div className="flex items-center justify-between gap-2">
                              <Link
                                href={`/ots/${ot.id}`}
                                onClick={() => setAbierto(false)}
                                className="text-[13.5px] font-bold text-primario"
                              >
                                {ot.numero} ›
                              </Link>
                              <span className="text-[12px] font-bold text-alerta">
                                {ot.saldo > 0 ? `Debe ${pesos(ot.saldo)}` : "Pagada"}
                              </span>
                            </div>
                            <p className="text-[12px] text-mutado">{ot.vehiculo}</p>
                            <ul className="mt-2 space-y-1 text-[13px]">
                              {ot.items.map((i) => (
                                <li key={i.id} className="flex justify-between gap-3">
                                  <span className="text-foreground">
                                    {i.descripcion}
                                    {i.tipo === "REPUESTO" && i.cantidad !== 1 ? ` ×${i.cantidad}` : ""}
                                  </span>
                                  <span className="shrink-0 font-semibold text-foreground">{pesos(i.subtotal)}</span>
                                </li>
                              ))}
                              {ot.items.length === 0 && <li className="text-mutado">Sin trabajos cargados todavía.</li>}
                            </ul>
                            <p className="mt-2 flex justify-between border-t border-borde pt-1.5 text-[13px] font-bold text-foreground">
                              <span>Total OT</span>
                              <span>{pesos(ot.total)}</span>
                            </p>
                          </div>
                        ))}

                        <p className="flex justify-between text-[13px] text-mutado">
                          <span>Ya pagó</span>
                          <span className="font-bold text-foreground">{pesos(d.pagado)}</span>
                        </p>

                        <div className="flex gap-2">
                          <a
                            href={enlaceWhatsApp(
                              d.telefono,
                              `Hola ${d.nombre.split(" ")[0]}! Te escribimos del taller por un saldo pendiente de ${pesos(d.saldo)}. Cualquier duda, escribinos.`,
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 rounded-xl bg-exito-suave py-2.5 text-center text-[13px] font-semibold text-exito"
                          >
                            Recordar por WhatsApp
                          </a>
                          <Link
                            href={`/clientes/${d.id}#cuenta`}
                            onClick={() => setAbierto(false)}
                            className="rounded-xl border border-borde px-4 py-2.5 text-[13px] font-semibold text-foreground"
                          >
                            Ver cuenta
                          </Link>
                        </div>

                        <FormularioCobroCliente
                          clienteId={d.id}
                          saldo={d.saldo}
                          pendientes={d.ots.filter((o) => o.saldo > 0).map((o) => ({ id: o.id, numero: o.numero, saldo: o.saldo }))}
                        />
                      </div>
                    </details>
                  ))}
                </div>
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
