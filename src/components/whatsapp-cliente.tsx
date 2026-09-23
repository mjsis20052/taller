"use client";

import { useRef, useState } from "react";
import { Drawer } from "vaul";
import { guardarTelefonoCliente } from "@/app/(interno)/clientes/actions";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { tieneTelefono } from "@/lib/validaciones/telefono";

type Mensaje = string | (() => string);

// Envía por WhatsApp a un cliente. Si su teléfono no está cargado, abre un modal para pedirlo
// (se guarda en la ficha del cliente) y recién ahí manda el mensaje.
export function useWhatsAppCliente({
  clienteId,
  nombre,
  telefono,
}: {
  clienteId: string;
  nombre: string;
  telefono: string;
}) {
  const [tel, setTel] = useState(telefono);
  const [abierto, setAbierto] = useState(false);
  const [valor, setValor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const pendiente = useRef<() => string>(() => "");

  function armar(mensaje: Mensaje): () => string {
    return typeof mensaje === "function" ? mensaje : () => mensaje;
  }

  function enviar(mensaje: Mensaje = "") {
    const texto = armar(mensaje);
    if (tieneTelefono(tel)) {
      window.open(enlaceWhatsApp(tel, texto()), "_blank", "noopener,noreferrer");
      return;
    }
    pendiente.current = texto;
    setValor("");
    setError(null);
    setAbierto(true);
  }

  async function guardarYEnviar(e: React.FormEvent) {
    e.preventDefault();
    // La ventana se abre ya, dentro del toque, para que el celular no la bloquee.
    const ventana = window.open("", "_blank");
    setGuardando(true);
    const resultado = await guardarTelefonoCliente(clienteId, valor);
    setGuardando(false);

    if (!resultado.ok || !resultado.telefono) {
      ventana?.close();
      setError(resultado.error ?? "No se pudo guardar el teléfono.");
      return;
    }

    setTel(resultado.telefono);
    setAbierto(false);
    const url = enlaceWhatsApp(resultado.telefono, pendiente.current());
    if (ventana) ventana.location.href = url;
    else window.location.href = url;
  }

  const modal = (
    <Drawer.Root open={abierto} onOpenChange={setAbierto}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[70] bg-black/50" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-w-lg rounded-t-3xl border border-borde bg-superficie p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] outline-none">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-borde" />
          <Drawer.Title className="text-[20px] font-extrabold tracking-tight text-foreground">
            Falta el teléfono de {nombre.split(" ")[0]}
          </Drawer.Title>
          <Drawer.Description className="mt-1 text-[14px] text-mutado">
            Cargalo para enviar el mensaje por WhatsApp. Queda guardado en su ficha.
          </Drawer.Description>

          <form onSubmit={guardarYEnviar} className="mt-5 space-y-3">
            <input
              type="tel"
              inputMode="tel"
              autoFocus
              autoComplete="off"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ej: 2245506078"
              className="w-full rounded-xl border border-borde bg-superficie px-4 py-3.5 text-[17px] text-foreground outline-none focus:border-primario"
            />
            <p className="text-[12.5px] text-mutado">El +549 se agrega solo.</p>
            {error && (
              <p role="alert" className="rounded-xl bg-peligro-suave px-3.5 py-2.5 text-[13.5px] font-medium text-peligro">
                {error}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="rounded-xl border border-borde bg-superficie py-3.5 text-[15px] font-semibold text-foreground"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando || !valor.trim()}
                className="rounded-xl bg-exito py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
              >
                {guardando ? "Guardando…" : "Guardar y enviar"}
              </button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );

  return { enviar, modal };
}

// Botón/enlace de WhatsApp para un cliente, con el modal de teléfono incluido.
export function EnlaceWhatsAppCliente({
  clienteId,
  nombre,
  telefono,
  mensaje = "",
  className,
  alTocar,
  children,
}: {
  clienteId: string;
  nombre: string;
  telefono: string;
  mensaje?: Mensaje;
  className?: string;
  alTocar?: () => void;
  children: React.ReactNode;
}) {
  const { enviar, modal } = useWhatsAppCliente({ clienteId, nombre, telefono });
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          alTocar?.();
          enviar(mensaje);
        }}
      >
        {children}
      </button>
      {modal}
    </>
  );
}
