"use client";

import { usePathname, useRouter } from "next/navigation";

const RAICES = new Set(["/", "/agenda", "/ots", "/mas"]);

export function BotonVolver() {
  const pathname = usePathname();
  const router = useRouter();

  if (RAICES.has(pathname)) return null;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Volver"
      className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground active:bg-black/5"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  );
}
