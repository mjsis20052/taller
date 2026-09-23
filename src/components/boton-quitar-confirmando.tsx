"use client";

import { useState } from "react";
import { Drawer } from "vaul";

// Botón "×" que pide confirmación antes de borrar (un toque suelto no elimina nada).
export function BotonQuitarConfirmando({
  accion,
  titulo,
  detalle,
  textoConfirmar = "Sí, quitar",
  etiqueta = "Quitar",
}: {
  accion: () => Promise<void>;
  titulo: string;
  detalle?: string;
  textoConfirmar?: string;
  etiqueta?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  return (
    <Drawer.Root open={abierto} onOpenChange={setAbierto}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          aria-label={etiqueta}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[18px] leading-none text-peligro active:bg-peligro-suave"
        >
          ×
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-3xl border border-borde bg-superficie p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] outline-none">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-borde" />
          <Drawer.Title className="text-[18px] font-bold tracking-tight text-foreground">{titulo}</Drawer.Title>
          <Drawer.Description className="mt-1.5 text-[14px] text-mutado">
            {detalle ?? "Esta acción no se puede deshacer."}
          </Drawer.Description>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="rounded-xl border border-borde bg-superficie py-3.5 text-[15px] font-semibold text-foreground"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={enviando}
              onClick={async () => {
                setEnviando(true);
                await accion();
                setEnviando(false);
                setAbierto(false);
              }}
              className="rounded-xl bg-peligro py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
            >
              {enviando ? "Quitando…" : textoConfirmar}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
