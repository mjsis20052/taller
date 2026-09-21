"use client";

import { useState } from "react";

// Fotos del trabajo para el cliente: grilla con vista ampliada al tocar.
export function FotosInforme({ fotos }: { fotos: { id: string; url: string }[] }) {
  const [abierta, setAbierta] = useState<string | null>(null);
  if (fotos.length === 0) return null;

  return (
    <section className="rounded-3xl border border-borde bg-superficie p-5">
      <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Fotos del trabajo</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {fotos.map((foto) => (
          <button
            key={foto.id}
            type="button"
            onClick={() => setAbierta(foto.url)}
            className="aspect-square overflow-hidden rounded-xl border border-borde active:scale-95"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto.url} alt="Foto del trabajo" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {abierta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setAbierta(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={abierta} alt="" className="max-h-full max-w-full rounded-lg" />
          <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-2xl text-white">×</span>
        </div>
      )}
    </section>
  );
}
