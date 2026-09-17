"use client";

import { Drawer } from "vaul";
import { FormularioTurnoPublico } from "@/components/formulario-turno-publico";

export function BotonPedirTurno({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button type="button" className={className}>
          {children}
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90vh] max-w-lg flex-col rounded-t-3xl border border-borde bg-superficie outline-none">
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-borde" />
          <div className="overflow-y-auto p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
            <Drawer.Title className="text-[19px] font-bold tracking-tight text-foreground">
              Pedir turno
            </Drawer.Title>
            <Drawer.Description className="mt-1 text-[13.5px] text-mutado">
              Completá tus datos y te confirmamos por WhatsApp.
            </Drawer.Description>
            <div className="mt-5">
              <FormularioTurnoPublico />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
