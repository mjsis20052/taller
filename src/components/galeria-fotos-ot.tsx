"use client";

import { useRef, useState, useTransition } from "react";
import { eliminarFotoOT, subirFotoOT } from "@/app/ots/actions";

export function GaleriaFotosOT({
  otId,
  fotos,
}: {
  otId: string;
  fotos: { id: string; url: string }[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, empezarTransicion] = useTransition();
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

  function alElegirArchivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    const formData = new FormData();
    formData.set("foto", archivo);

    empezarTransicion(async () => {
      await subirFotoOT(otId, formData);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={alElegirArchivo}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={subiendo}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-borde bg-superficie py-3.5 text-[14px] font-semibold text-primario disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        {subiendo ? "Subiendo…" : "Sacar o subir foto"}
      </button>

      {fotos.length === 0 ? (
        <p className="text-center text-[13.5px] text-mutado">Sin fotos todavía.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((foto) => (
            <div key={foto.id} className="group relative aspect-square overflow-hidden rounded-xl border border-borde">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.url}
                alt=""
                className="h-full w-full cursor-pointer object-cover"
                onClick={() => setFotoAmpliada(foto.url)}
              />
              <form action={eliminarFotoOT.bind(null, foto.id, otId)} className="absolute right-1 top-1">
                <button
                  type="submit"
                  aria-label="Eliminar foto"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  ×
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {fotoAmpliada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setFotoAmpliada(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt="" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
