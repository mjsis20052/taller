import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, authConfigurada, tokenValido } from "@/lib/sesion";

// Públicas: el portal de clientes y lo mínimo que necesita para cargar/instalarse.
const PUBLICAS = /^\/(portal|login|_next|icons|splash|sw\.js|manifest\.webmanifest|favicon\.ico|offline|api\/version|informe)(\/|$|\.)/;

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (PUBLICAS.test(pathname)) return NextResponse.next();

  // Sin ADMIN_PASSWORD (desarrollo local) no se pide nada; en producción sin
  // configurar, todo el panel queda cerrado.
  if (!authConfigurada() && process.env.NODE_ENV !== "production") return NextResponse.next();

  if (await tokenValido(request.cookies.get(COOKIE_SESION)?.value)) return NextResponse.next();

  if (request.method !== "GET") return new NextResponse("No autorizado", { status: 401 });

  // Detrás de nginx/Cloudflare el host interno no es el público: se arma con los encabezados reenviados.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const protocolo = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const destino = new URL(`/login?next=${encodeURIComponent(pathname + search)}`, `${protocolo}://${host}`);
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
