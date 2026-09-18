import type { MetadataRoute } from "next";

const TAMANOS_ANY = [72, 96, 128, 144, 152, 180, 192, 384, 512];

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Taller — Gestión del taller mecánico",
    short_name: "Taller",
    description:
      "Gestión integral del taller mecánico: turnos, órdenes de trabajo, clientes y vehículos.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    lang: "es-AR",
    dir: "ltr",
    background_color: "#f4f5f9",
    theme_color: "#6366f1",
    categories: ["business", "productivity"],
    icons: [
      ...TAMANOS_ANY.map((tamano) => ({
        src: `/icons/icon-${tamano}.png`,
        sizes: `${tamano}x${tamano}`,
        type: "image/png" as const,
        purpose: "any" as const,
      })),
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
