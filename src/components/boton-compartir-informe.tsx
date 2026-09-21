"use client";

import { useState } from "react";
import { useWhatsAppCliente } from "@/components/whatsapp-cliente";

function IconoWhatsapp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.8c2.19 0 4.25.85 5.8 2.4a8.13 8.13 0 0 1 2.4 5.8c0 4.52-3.68 8.2-8.2 8.2a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.35c0-4.52 3.68-8.19 8.2-8.19m-4.52 4.7c-.15 0-.4.06-.61.3-.21.24-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.11.15 1.6 2.45 3.9 3.4.55.24.98.38 1.31.48.55.18 1.05.15 1.44.09.44-.07 1.36-.55 1.55-1.09.19-.53.19-.98.13-1.08-.06-.09-.21-.15-.44-.27-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.11-.52.11-.15.23-.6.75-.73.9-.13.15-.27.17-.5.06-.23-.11-.96-.35-1.83-1.13-.68-.6-1.13-1.35-1.27-1.57-.13-.23-.01-.35.1-.46.11-.11.23-.27.35-.4.11-.13.15-.23.23-.38.08-.15.04-.29-.02-.4-.06-.11-.52-1.26-.72-1.72-.19-.45-.38-.39-.52-.4z" />
    </svg>
  );
}

// Comparte por WhatsApp el enlace a un informe (OT o historial del cliente). El enlace se arma
// con la dirección real del sitio para que ande igual en la web publicada y en el celular.
export function BotonCompartirInforme({
  ruta,
  clienteId,
  nombre,
  telefono,
  texto,
  variante = "completo",
}: {
  ruta: string;
  clienteId: string;
  nombre: string;
  telefono: string;
  texto: string;
  variante?: "completo" | "icono";
}) {
  const [copiado, setCopiado] = useState(false);
  const { enviar, modal } = useWhatsAppCliente({ clienteId, nombre, telefono });

  function url() {
    return `${window.location.origin}${ruta}`;
  }

  function compartir(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    enviar(() => `${texto} ${url()}`);
  }

  async function copiar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copiá el enlace:", url());
    }
  }

  if (variante === "icono") {
    return (
      <>
        <button
          type="button"
          onClick={compartir}
          aria-label="Compartir informe por WhatsApp"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-exito-suave text-exito active:scale-90"
        >
          <IconoWhatsapp className="h-[18px] w-[18px]" />
        </button>
        {modal}
      </>
    );
  }

  return (
    <div className="flex gap-2">
      {modal}
      <button
        type="button"
        onClick={compartir}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-exito py-3 text-[14px] font-bold text-white active:scale-[0.98]"
      >
        <IconoWhatsapp className="h-[18px] w-[18px]" />
        Compartir por WhatsApp
      </button>
      <button
        type="button"
        onClick={copiar}
        className="rounded-xl border border-borde bg-superficie px-4 py-3 text-[13.5px] font-semibold text-foreground"
      >
        {copiado ? "¡Copiado!" : "Copiar link"}
      </button>
    </div>
  );
}
