import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Taller — Gestión del taller mecánico",
    short_name: "Taller",
    description:
      "Gestión integral del taller mecánico: turnos, órdenes de trabajo, clientes y vehículos.",
    id: "/",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "es-AR",
    background_color: "#f5f5f5",
    theme_color: "#1d4ed8",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
