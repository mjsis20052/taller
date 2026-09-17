"use client";

import { useState } from "react";

export function CamposOpcionales({
  etiqueta = "Más datos (opcional)",
  abiertoInicial = false,
  children,
}: {
  etiqueta?: string;
  abiertoInicial?: boolean;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(abiertoInicial);

  if (abierto) {
    return <div className="space-y-5">{children}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => setAbierto(true)}
      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-borde py-3 text-[13.5px] font-semibold text-primario"
    >
      + {etiqueta}
    </button>
  );
}
