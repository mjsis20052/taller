"use client";

import { usePathname } from "next/navigation";

export function TransicionPagina({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animar-entrada">
      {children}
    </div>
  );
}
