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
