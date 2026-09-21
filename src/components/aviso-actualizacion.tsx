"use client";

import { useEffect, useState } from "react";
import { Drawer } from "vaul";

const MI_VERSION = process.env.NEXT_PUBLIC_BUILD_ID;
const CADA_MS = 60_000;

// Avisa con un modal cuando se publicó una versión nueva de la app, para no
// quedarse con pantallas viejas (sobre todo instalada en el celular).
export function AvisoActualizacion() {
  const [hayNueva, setHayNueva] = useState(false);
  const [descartada, setDescartada] = useState(false);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    if (!MI_VERSION) return;
    let vivo = true;

    async function revisar() {
      try {
        const respuesta = await fetch("/api/version", { cache: "no-store" });
        if (!respuesta.ok) return;
        const { id } = (await respuesta.json()) as { id?: string };
        if (vivo && id && id !== MI_VERSION) setHayNueva(true);
      } catch {
        // Sin conexión: se vuelve a intentar en el próximo chequeo.
      }
    }

    void revisar();
    const intervalo = setInterval(revisar, CADA_MS);
    const alVolver = () => {
      if (document.visibilityState === "visible") void revisar();
    };
    document.addEventListener("visibilitychange", alVolver);
    window.addEventListener("focus", alVolver);

    return () => {
      vivo = false;
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolver);
      window.removeEventListener("focus", alVolver);
    };
  }, []);

  async function actualizar() {
    setActualizando(true);
    try {
      const registros = (await navigator.serviceWorker?.getRegistrations()) ?? [];
      await Promise.all(registros.map((r) => r.update().catch(() => undefined)));
      const claves = (await caches?.keys()) ?? [];
      await Promise.all(claves.map((c) => caches.delete(c)));
    } catch {
      // Si algo de esto falla igual se recarga.
    }
    window.location.reload();
  }

  return (
    <Drawer.Root open={hayNueva && !descartada} onOpenChange={(abierto) => !abierto && setDescartada(true)}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/50" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[60] mx-auto max-w-lg rounded-t-3xl border border-borde bg-superficie p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] outline-none">
          <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-borde" />
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-linear-to-br from-indigo-400 to-indigo-700 text-white shadow-lg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
                <path d="M3 12A9 9 0 0 1 18.5 5.8L21 8" />
                <path d="M21 3v5h-5M3 21v-5h5" />
              </svg>
            </span>
            <Drawer.Title className="mt-4 text-[21px] font-extrabold tracking-tight text-foreground">
              Hay una actualización
            </Drawer.Title>
            <Drawer.Description className="mt-1.5 max-w-[32ch] text-[14.5px] text-mutado">
              Publicamos mejoras y arreglos. Actualizá para tener la última versión, tarda un segundo.
            </Drawer.Description>
          </div>

          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              onClick={actualizar}
              disabled={actualizando}
              className="w-full rounded-xl bg-primario py-4 text-[16px] font-bold text-white disabled:opacity-60"
            >
              {actualizando ? "Actualizando…" : "Actualizar ahora"}
            </button>
            <button
              type="button"
              onClick={() => setDescartada(true)}
              className="w-full rounded-xl py-3 text-[14.5px] font-semibold text-mutado"
            >
              Más tarde
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
