import type { NextConfig } from "next";

// Cambia en cada build: la app abierta lo compara con /api/version para avisar que hay una actualización.
const BUILD_ID = process.env.BUILD_ID ?? new Date().toISOString().replace(/\D/g, "").slice(0, 14);

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },
  // Permite acceder al servidor de desarrollo desde el celular/otras
  // PC de la red local (sin esto, Next bloquea los scripts y la
  // página queda en blanco cuando se entra por la IP de la red en
  // vez de localhost). Agregar acá cualquier IP nueva de la red.
  allowedDevOrigins: ["192.168.1.13", "172.25.208.1"],
  // Bundle standalone para producción: el runtime del contenedor no
  // necesita node_modules completo, así pesa y consume mucha menos
  // RAM al arrancar (clave para VPS chicos).
  output: "standalone",
};

export default nextConfig;
