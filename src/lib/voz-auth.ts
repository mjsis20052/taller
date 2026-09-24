import { iguales } from "@/lib/sesion";

// Autenticación de los endpoints /api/voz/*: el módulo aparte taller-carga-voz
// manda este header en vez de la cookie de sesión del panel (no tiene usuario
// humano detrás). Nunca loguear el valor recibido ni el esperado.
const ENCABEZADO = "x-voz-key";

export function vozAutorizado(request: Request): boolean {
  const clave = process.env.VOZ_API_KEY;
  if (!clave) return false; // sin VOZ_API_KEY configurada, el endpoint queda cerrado
  const recibida = request.headers.get(ENCABEZADO);
  if (!recibida) return false;
  return iguales(recibida, clave);
}

// Usuario logueado en taller-carga-voz que hizo la acción (para auditoría en
// el timeline, ver TimelineEvento.usuario en schema.prisma). Todos los
// endpoints nuevos de voz lo exigen: sin este header, 400.
const ENCABEZADO_USUARIO = "x-voz-usuario";

export function vozUsuario(request: Request): string | null {
  const usuario = request.headers.get(ENCABEZADO_USUARIO)?.trim();
  return usuario || null;
}
