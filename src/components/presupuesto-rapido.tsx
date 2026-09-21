"use client";

import { useState } from "react";
import { cargarPresupuesto } from "@/app/(interno)/ots/actions";
import { useWhatsAppCliente } from "@/components/whatsapp-cliente";
import { pesos } from "@/lib/formato";

// Un toque: arma el presupuesto con lo cargado en la OT y se lo manda al cliente por WhatsApp
// con el link donde lo aprueba. Si ya se envió, permite reenviar el mismo link.
export function PresupuestoRapido({
  otId,
  estado,
  cantidadItems,
  total,
  clienteId,
  nombreCliente,
  telefono,
  vehiculo,
  ruta,
}: {
  otId: string;
  estado: string;
  cantidadItems: number;
  total: number;
  clienteId: string;
  nombreCliente: string;
  telefono: string;
  vehiculo: string;
  ruta: string;
}) {
  const [enviando, setEnviando] = useState(false);
  const { enviar, modal } = useWhatsAppCliente({ clienteId, nombre: nombreCliente, telefono });
  const yaEnviado = estado === "PRESUPUESTADO";

  async function presupuestar() {
    if (enviando || cantidadItems === 0) return;
    setEnviando(true);
    if (!yaEnviado) {
      const datos = new FormData();
      datos.set("validezDias", "7");
      await cargarPresupuesto(otId, datos);
    }
    setEnviando(false);
    enviar(
      () =>
        `Hola ${nombreCliente.split(" ")[0]}! Te paso el presupuesto de tu ${vehiculo} por ${pesos(total)}. Miralo y aprobalo con un toque acá: ${window.location.origin}${ruta}`,
    );
  }

  return (
    <div className="rounded-2xl border border-primario/30 bg-primario-suave/60 p-4">
      {modal}
      <p className="text-[14.5px] font-bold text-foreground">Presupuesto rápido</p>
      <p className="mb-3 mt-0.5 text-[12.5px] text-mutado">
        {cantidadItems === 0
          ? "Cargá abajo la falla, la solución y el precio, y después mandalo desde acá."
          : `${cantidadItems} ítem${cantidadItems === 1 ? "" : "s"} · ${pesos(total)}. El cliente lo aprueba desde su celular.`}
      </p>
      <button
        type="button"
        disabled={enviando || cantidadItems === 0}
        onClick={presupuestar}
        className="w-full rounded-xl bg-primario py-3.5 text-[15px] font-bold text-white active:scale-[0.98] disabled:opacity-50"
      >
        {enviando ? "Preparando…" : yaEnviado ? "Reenviar presupuesto por WhatsApp" : "Enviar presupuesto por WhatsApp"}
      </button>
    </div>
  );
}
