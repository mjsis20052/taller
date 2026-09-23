"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { storageAdapter } from "@/lib/storage/local-adapter";
import { CategoriaGasto, EntidadFoto } from "@/generated/prisma/enums";

export type ErroresFormularioGasto = Partial<
  Record<"proveedor" | "monto" | "fecha", string>
>;

export async function crearGasto(
  _estadoPrevio: ErroresFormularioGasto,
  formData: FormData,
): Promise<ErroresFormularioGasto> {
  const proveedor = String(formData.get("proveedor") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "OTROS") as CategoriaGasto;
  const montoTexto = String(formData.get("monto") ?? "").trim();
  const monto = Number(montoTexto);
  const fechaTexto = String(formData.get("fecha") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();
  const foto = formData.get("foto");

  const errores: ErroresFormularioGasto = {};
  if (!proveedor) errores.proveedor = "Ingresá el proveedor.";
  if (!montoTexto || Number.isNaN(monto) || monto <= 0) errores.monto = "Monto inválido.";
  if (!fechaTexto) errores.fecha = "Ingresá la fecha.";
  if (Object.keys(errores).length > 0) return errores;

  const gasto = await prisma.gasto.create({
    data: {
      proveedor,
      categoria,
      monto,
      fecha: new Date(`${fechaTexto}T12:00:00`),
      notas: notas || null,
    },
  });

  if (foto instanceof File && foto.size > 0) {
    const rutaGuardada = await storageAdapter.guardar(foto, `gastos/${gasto.id}`);
    await prisma.foto.create({
      data: { entidad: EntidadFoto.GASTO, gastoId: gasto.id, path: rutaGuardada },
    });
  }

  revalidatePath("/gastos");
  redirect("/gastos");
}

export async function eliminarGasto(id: string) {
  const fotos = await prisma.foto.findMany({ where: { gastoId: id } });
  await Promise.all(fotos.map((f) => storageAdapter.eliminar(f.path)));
  await prisma.gasto.delete({ where: { id } });
  revalidatePath("/gastos");
}
