"use client";

import Link from "next/link";
import { useState } from "react";
import { Drawer } from "vaul";
import type { Alerta } from "@/lib/alertas";

function IconoCampana(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export function CampanaNotificaciones({ alertas }: { alertas: Alerta[] }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <Drawer.Root open={abierto} onOpenChange={setAbierto}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          aria-label={`Notificaciones${alertas.length > 0 ? ` (${alertas.length})` : ""}`}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-mutado active:bg-black/5"
        >
          <IconoCampana className="h-5 w-5" />
          {alertas.length > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-peligro px-1 text-[10px] font-bold text-white">
              {alertas.length}
            </span>
          )}
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-3xl border border-borde bg-superficie outline-none">
          <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-borde" />
          <Drawer.Title className="px-5 pt-4 text-[13px] font-semibold uppercase tracking-wide text-mutado">
            Notificaciones
          </Drawer.Title>
          <div className="space-y-1.5 p-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            {alertas.length === 0 ? (
              <p className="px-2.5 py-6 text-center text-[13.5px] text-mutado">
                Sin novedades por ahora.
              </p>
            ) : (
              alertas.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  onClick={() => setAbierto(false)}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-alerta-suave px-4 py-3.5 text-[13.5px] font-medium text-alerta"
                >
                  {a.texto}
                  <span>›</span>
                </Link>
              ))
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
