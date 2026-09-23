import type { MetadataRoute } from "next";

const TAMANOS_ANY = [72, 96, 128, 144, 152, 180, 192, 384, 512];

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Car-Mec — Gestión del taller",
    short_name: "Car-Mec",
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
    background_color: "#6366f1",
    theme_color: "#6366f1",
    categories: ["business", "productivity"],
    icons: [
      ...TAMANOS_ANY.map((tamano) => ({
        src: `/icons/icon-${tamano}.png?v=5`,
        sizes: `${tamano}x${tamano}`,
        type: "image/png" as const,
        purpose: "any" as const,
      })),
      {
        src: "/icons/icon-512-maskable.png?v=5",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
