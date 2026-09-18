"use client";

import { motion } from "framer-motion";

function trazadoEngranaje(dientes: number, radioExterno: number, radioInterno: number): string {
  const puntos: string[] = [];
  const paso = (Math.PI * 2) / dientes;
  for (let i = 0; i < dientes; i++) {
    const a = i * paso;
    const angulos = [
      [a - paso * 0.28, radioInterno],
      [a - paso * 0.16, radioExterno],
      [a + paso * 0.16, radioExterno],
      [a + paso * 0.28, radioInterno],
    ];
    for (const [ang, radio] of angulos) {
      puntos.push(`${(50 + Math.cos(ang) * radio).toFixed(2)},${(50 + Math.sin(ang) * radio).toFixed(2)}`);
    }
  }
  return `M${puntos.join(" L")} Z`;
}

const TRAZADO = trazadoEngranaje(10, 48, 38);

export function Engranaje({
  className,
  segundos = 24,
  sentido = 1,
}: {
  className?: string;
  segundos?: number;
  sentido?: 1 | -1;
}) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      aria-hidden
      className={className}
      animate={{ rotate: 360 * sentido }}
      transition={{ duration: segundos, repeat: Infinity, ease: "linear" }}
    >
      <path d={TRAZADO} fill="currentColor" fillRule="evenodd" />
      <circle cx="50" cy="50" r="14" fill="var(--background)" />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
    </motion.svg>
  );
}
