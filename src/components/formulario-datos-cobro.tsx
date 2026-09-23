"use client";

import { useActionState, useState } from "react";
import { actualizarDatosCobro } from "@/app/(interno)/configuracion/actions";
import type { DatosCobro } from "@/lib/datos-cobro";

const campo = "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario";

export function FormularioDatosCobro({ datos }: { datos: DatosCobro }) {
  const [estado, accion, pendiente] = useActionState(actualizarDatosCobro, {});
  const [alias, setAlias] = useState(datos.alias);
  const [titular, setTitular] = useState(datos.titular);
  const [link, setLink] = useState(datos.link);

  return (
    <form action={accion} className="mt-10 space-y-3 rounded-2xl border border-borde bg-superficie p-4">
      <div>
        <h2 className="text-[17px] font-bold text-foreground">Datos para cobrar</h2>
        <p className="text-[12.5px] text-mutado">
          Lo que ve el cliente cuando toca «Hacer pago» en su informe. Más adelante podés pegar el link de Mercado Pago.
        </p>
      </div>
      <input name="alias" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Alias (ej: carmec.taller)" className={campo} />
      <input name="titular" value={titular} onChange={(e) => setTitular(e.target.value)} placeholder="Nombre del titular (opcional)" className={campo} />
      <input name="link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link de Mercado Pago (opcional)" inputMode="url" className={campo} />
      {estado.error && <p className="text-[13px] font-medium text-peligro">{estado.error}</p>}
      {estado.ok && <p className="text-[13px] font-medium text-exito">Guardado ✓</p>}
      <button type="submit" disabled={pendiente} className="w-full rounded-xl bg-primario py-3.5 text-[15px] font-bold text-white disabled:opacity-60">
        {pendiente ? "Guardando…" : "Guardar datos de cobro"}
      </button>
    </form>
  );
}
