"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Vuelve a pedir los datos cada tanto (y al volver a la pestaña) para que el informe
// muestre las novedades sin tener que recargar a mano.
export function AutoRefresco({ cadaSegundos = 30 }: { cadaSegundos?: number }) {
  const router = useRouter();
  const [ultima, setUltima] = useState<string | null>(null);

  useEffect(() => {
    const marcar = () =>
      setUltima(
        new Intl.DateTimeFormat("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Argentina/Buenos_Aires",
        }).format(new Date()),
      );
    marcar();

    const refrescar = () => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
      marcar();
    };
    const intervalo = setInterval(refrescar, cadaSegundos * 1000);
    document.addEventListener("visibilitychange", refrescar);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", refrescar);
    };
  }, [router, cadaSegundos]);

  return (
    <p className="flex items-center justify-center gap-1.5 text-[12px] text-mutado">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-exito opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-exito" />
      </span>
      Se actualiza solo{ultima ? ` · revisado ${ultima} hs` : ""}
    </p>
  );
}
