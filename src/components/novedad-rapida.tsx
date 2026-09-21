"use client";

import { useState } from "react";
import { publicarNovedadOT } from "@/app/(interno)/ots/actions";
import { useWhatsAppCliente } from "@/components/whatsapp-cliente";

const RAPIDAS = [
  "Empezamos con el trabajo",
  "Desarmado, revisando piezas",
  "Esperando repuesto",
  "Llegó el repuesto, seguimos",
  "Probando el vehículo",
  "Lavado y detalles finales",
  "Listo para retirar",
];

// Publica una novedad de la reparación con un toque. Queda en el informe del cliente al instante
// y se puede avisar por WhatsApp desde acá mismo.
export function NovedadRapida({
  otId,
  clienteId,
  telefono,
  nombreCliente,
  vehiculo,
  ruta,
}: {
  otId: string;
  clienteId: string;
  telefono: string;
  nombreCliente: string;
  vehiculo: string;
  ruta: string;
}) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [ultima, setUltima] = useState<string | null>(null);
  const { enviar, modal } = useWhatsAppCliente({ clienteId, nombre: nombreCliente, telefono });

  async function publicar(contenido: string) {
    const limpio = contenido.trim();
    if (!limpio || enviando) return;
    setEnviando(true);
    await publicarNovedadOT(otId, limpio);
    setUltima(limpio);
    setTexto("");
    setEnviando(false);
  }

  function avisarPorWhatsapp() {
    if (!ultima) return;
    enviar(
      () =>
        `Hola ${nombreCliente.split(" ")[0]}! Novedad de tu ${vehiculo}: ${ultima}. Mirá cómo avanza acá: ${window.location.origin}${ruta}`,
    );
  }

  return (
    <div className="rounded-2xl border border-borde bg-superficie p-4">
      {modal}
      <p className="text-[14.5px] font-bold text-foreground">Novedad rápida</p>
      <p className="mb-3 mt-0.5 text-[12.5px] text-mutado">
        Tocá una y se publica al instante en el informe del cliente.
      </p>

      <div className="-mx-1 flex flex-wrap gap-2">
        {RAPIDAS.map((novedad) => (
          <button
            key={novedad}
            type="button"
            disabled={enviando}
            onClick={() => publicar(novedad)}
            className="rounded-full bg-primario-suave px-3.5 py-2 text-[13px] font-semibold text-primario active:scale-95 disabled:opacity-50"
          >
            {novedad}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void publicar(texto);
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribí otra novedad…"
          className="w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[14.5px] text-foreground outline-none focus:border-primario"
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          className="shrink-0 rounded-xl bg-primario px-4 text-[14px] font-bold text-white disabled:opacity-40"
        >
          Publicar
        </button>
      </form>

      {ultima && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-exito-suave px-3.5 py-2.5">
          <p className="min-w-0 text-[13px] text-exito">
            <span className="font-bold">Publicado:</span> {ultima}
          </p>
          <button
            type="button"
            onClick={avisarPorWhatsapp}
            className="shrink-0 rounded-lg bg-exito px-3 py-1.5 text-[12.5px] font-bold text-white"
          >
            Avisar por WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
