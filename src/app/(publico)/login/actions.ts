"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_SESION,
  DURACION_SESION_SEG,
  authConfigurada,
  credencialesValidas,
  crearToken,
  rutaSegura,
} from "@/lib/sesion";

export type EstadoLogin = { error?: string; usuario?: string };

// Freno simple contra adivinar la clave: 8 intentos cada 15 minutos por IP.
const VENTANA_MS = 15 * 60 * 1000;
const MAX_INTENTOS = 8;
const intentos = new Map<string, { cantidad: number; desde: number }>();

export async function iniciarSesion(_previo: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const siguiente = rutaSegura(String(formData.get("siguiente") ?? ""));

  if (!authConfigurada()) {
    if (process.env.NODE_ENV !== "production") redirect(siguiente);
    return { error: "El acceso todavía no está configurado en el servidor." };
  }

  const cabeceras = await headers();
  const ip = (cabeceras.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  const ahora = Date.now();
  const registro = intentos.get(ip);
  if (registro && ahora - registro.desde < VENTANA_MS && registro.cantidad >= MAX_INTENTOS) {
    return { error: "Demasiados intentos. Esperá unos minutos y probá de nuevo." };
  }

  const usuario = String(formData.get("usuario") ?? "").trim();
  const clave = String(formData.get("clave") ?? "");

  if (!credencialesValidas(usuario, clave)) {
    const vigente = registro && ahora - registro.desde < VENTANA_MS;
    intentos.set(ip, { cantidad: vigente ? registro.cantidad + 1 : 1, desde: vigente ? registro.desde : ahora });
    return { error: "Usuario o contraseña incorrectos.", usuario };
  }

  intentos.delete(ip);
  (await cookies()).set(COOKIE_SESION, await crearToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: cabeceras.get("x-forwarded-proto") === "https",
    path: "/",
    maxAge: DURACION_SESION_SEG,
  });

  redirect(siguiente);
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE_SESION);
  redirect("/login");
}
