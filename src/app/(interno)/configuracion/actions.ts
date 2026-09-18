"use server";

import { revalidatePath } from "next/cache";
import { guardarConfigHorarios } from "@/lib/horarios";
import { normalizarHoras } from "@/lib/horarios-comunes";

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

  await guardarConfigHorarios({ duracionMin, horarios });

  revalidatePath("/configuracion");
  revalidatePath("/portal");
  return { ok: true };
}
