// Sesión del panel: una cookie firmada con HMAC (no se guarda nada en la base).
// Usa solo Web Crypto para que ande igual en el proxy y en las acciones.
export const COOKIE_SESION = "taller_sesion";
export const DURACION_SESION_SEG = 60 * 60 * 24 * 30;

export function authConfigurada(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET);
}

async function firmar(dato: string): Promise<string> {
  const clave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.SESSION_SECRET ?? ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const firma = await crypto.subtle.sign("HMAC", clave, new TextEncoder().encode(dato));
  return Array.from(new Uint8Array(firma))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Comparación en tiempo constante para no filtrar nada por el tiempo de respuesta.
export function iguales(a: string, b: string): boolean {
  const largo = Math.max(a.length, b.length);
  let diferencia = a.length ^ b.length;
  for (let i = 0; i < largo; i++) {
    diferencia |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diferencia === 0;
}

export async function crearToken(): Promise<string> {
  const vence = String(Math.floor(Date.now() / 1000) + DURACION_SESION_SEG);
  return `${vence}.${await firmar(vence)}`;
}

export async function tokenValido(token: string | undefined | null): Promise<boolean> {
  if (!token || !authConfigurada()) return false;
  const [vence, firma] = token.split(".");
  if (!vence || !firma) return false;
  if (Number(vence) < Date.now() / 1000) return false;
  return iguales(firma, await firmar(vence));
}

export function credencialesValidas(usuario: string, clave: string): boolean {
  const usuarioOk = iguales(usuario, process.env.ADMIN_USER ?? "admin");
  const claveOk = iguales(clave, process.env.ADMIN_PASSWORD ?? "");
  return usuarioOk && claveOk;
}

// Solo rutas internas del propio sitio, para que nadie use el login para redirigir afuera.
export function rutaSegura(destino: string | null | undefined): string {
  if (!destino || !destino.startsWith("/") || destino.startsWith("//") || destino.startsWith("/login")) return "/";
  return destino;
}
