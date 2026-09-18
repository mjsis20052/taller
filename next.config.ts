import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acceder al servidor de desarrollo desde el celular/otras
  // PC de la red local (sin esto, Next bloquea los scripts y la
  // página queda en blanco cuando se entra por la IP de la red en
  // vez de localhost). Agregar acá cualquier IP nueva de la red.
  allowedDevOrigins: ["192.168.1.13", "172.25.208.1"],
};

export default nextConfig;
