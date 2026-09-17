"use server";

import { revalidatePath } from "next/cache";
import { guardarConfigHorarios } from "@/lib/horarios";

export type ErroresConfigHorarios = Partial<Record<"apertura" | "cierre" | "duracionMin", string>>;

export async function actualizarConfigHorarios(
  _estadoPrevio: ErroresConfigHorarios,
  formData: FormData,
): Promise<ErroresConfigHorarios> {
  const apertura = String(formData.get("apertura") ?? "").trim();
  const cierre = String(formData.get("cierre") ?? "").trim();
  const duracionMin = Number(formData.get("duracionMin") ?? 60);
  const diasCerrado = formData.getAll("diasCerrado").map(Number);

  const errores: ErroresConfigHorarios = {};
  if (!apertura) errores.apertura = "Elegí un horario de apertura.";
  if (!cierre) errores.cierre = "Elegí un horario de cierre.";
  if (apertura && cierre && apertura >= cierre) {
    errores.cierre = "Tiene que ser después de la apertura.";
  }
  if (!duracionMin || duracionMin <= 0) errores.duracionMin = "Duración inválida.";
  if (Object.keys(errores).length > 0) return errores;

  await guardarConfigHorarios({ apertura, cierre, duracionMin, diasCerrado });

  revalidatePath("/configuracion");
  return {};
}
