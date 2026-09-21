"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import type { DatosCobro } from "@/lib/datos-cobro";
import { pesos } from "@/lib/formato";

// Botón «Hacer pago» del informe: muestra el alias (y el link de Mercado Pago cuando esté cargado).
export function BotonHacerPago({ saldo, cobro }: { saldo: number; cobro: DatosCobro }) {
  const [copiado, setCopiado] = useState(false);
  if (saldo <= 0 || (!cobro.alias && !cobro.link)) return null;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(cobro.alias);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copiá el alias:", cobro.alias);
    }
  }

  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button type="button" className="w-full rounded-2xl bg-primario py-4 text-[16px] font-extrabold text-white shadow-lg shadow-primario/25 active:scale-[0.98]">
          Hacer pago · {pesos(saldo)}
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-3xl border border-borde bg-superficie p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] outline-none">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-borde" />
          <Drawer.Title className="text-[20px] font-extrabold tracking-tight text-foreground">Hacer pago</Drawer.Title>
          <Drawer.Description className="mt-1 text-[14px] text-mutado">
            Falta pagar {pesos(saldo)}. Transferí al alias y avisanos por WhatsApp con el comprobante.
          </Drawer.Description>

          {cobro.alias && (
            <div className="mt-4 rounded-2xl bg-primario-suave p-4 text-center">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-primario">Alias</p>
              <p className="mt-1 break-all text-[24px] font-extrabold text-foreground">{cobro.alias}</p>
              {cobro.titular && <p className="text-[13px] text-mutado">{cobro.titular}</p>}
              <button type="button" onClick={copiar} className="mt-3 w-full rounded-xl bg-primario py-3 text-[14.5px] font-bold text-white">
                {copiado ? "¡Alias copiado!" : "Copiar alias"}
              </button>
            </div>
          )}
          {cobro.link && (
            <a href={cobro.link} target="_blank" rel="noopener noreferrer" className="mt-3 block w-full rounded-xl bg-[#009ee3] py-3.5 text-center text-[15px] font-bold text-white">
              Pagar con Mercado Pago
            </a>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
