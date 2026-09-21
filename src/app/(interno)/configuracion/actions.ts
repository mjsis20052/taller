"use server";

import { revalidatePath } from "next/cache";
import { guardarConfigHorarios, hoyEnArgentina } from "@/lib/horarios";
import { guardarDatosCobro } from "@/lib/datos-cobro";
import { esFechaValida, normalizarHoras } from "@/lib/horarios-comunes";

export type ErroresConfigHorarios = { duracionMin?: string; ok?: boolean };

export async function actualizarConfigHorarios(
  _estadoPrevio: ErroresConfigHorarios,
  formData: FormData,
): Promise<ErroresConfigHorarios> {
  const duracionMin = Number(formData.get("duracionMin") ?? 60);
  if (!duracionMin || duracionMin < 5) return { duracionMin: "Duración inválida." };

  const horarios: Record<number, string[]> = {};
  for (let dia = 0; dia <= 6; dia++) {
    horarios[dia] = normalizarHoras(formData.getAll(`horas-${dia}`).map(String));
  }

  // Días especiales: llegan como JSON [{ fecha, horas }]; se descartan los ya pasados.
  const especiales: Record<string, string[]> = {};
  try {
    const lista = JSON.parse(String(formData.get("especiales") ?? "[]"));
    const hoy = hoyEnArgentina();
    if (Array.isArray(lista)) {
      for (const item of lista) {
        const fecha = String(item?.fecha ?? "");
        if (!esFechaValida(fecha) || fecha < hoy) continue;
        especiales[fecha] = normalizarHoras(Array.isArray(item?.horas) ? item.horas.map(String) : []);
      }
    }
  } catch {
    // JSON inválido: se ignora y se guardan sin días especiales.
  }

  await guardarConfigHorarios({ duracionMin, horarios, especiales });

  revalidatePath("/configuracion");
  revalidatePath("/agenda");
  revalidatePath("/portal");
  return { ok: true };
}

export async function actualizarDatosCobro(
  _previo: { ok?: boolean; error?: string },
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const alias = String(formData.get("alias") ?? "").trim().slice(0, 60);
  const titular = String(formData.get("titular") ?? "").trim().slice(0, 80);
  const link = String(formData.get("link") ?? "").trim().slice(0, 300);
  if (link && !/^https:\/\//i.test(link)) return { error: "El link tiene que empezar con https://" };
  await guardarDatosCobro({ alias, titular, link });
  revalidatePath("/configuracion");
  return { ok: true };
}
