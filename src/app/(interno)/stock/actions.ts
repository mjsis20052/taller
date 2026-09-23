"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TipoMovimientoStock } from "@/generated/prisma/enums";

export type ErroresFormularioRepuesto = Partial<
  Record<"descripcion" | "costo" | "precioVenta", string>
>;

function leerDatos(formData: FormData) {
  return {
    descripcion: String(formData.get("descripcion") ?? "").trim(),
    codigo: String(formData.get("codigo") ?? "").trim(),
    proveedor: String(formData.get("proveedor") ?? "").trim(),
    stock: Number(formData.get("stock") ?? 0),
    stockMinimo: Number(formData.get("stockMinimo") ?? 0),
    costo: Number(formData.get("costo") ?? 0),
    precioVenta: Number(formData.get("precioVenta") ?? 0),
  };
}

function validar(datos: ReturnType<typeof leerDatos>): ErroresFormularioRepuesto {
  const errores: ErroresFormularioRepuesto = {};
  if (!datos.descripcion) errores.descripcion = "Ingresá una descripción.";
  if (Number.isNaN(datos.costo) || datos.costo < 0) errores.costo = "Costo inválido.";
  if (Number.isNaN(datos.precioVenta) || datos.precioVenta < 0) {
    errores.precioVenta = "Precio de venta inválido.";
  }
  return errores;
}

export async function crearRepuesto(
  _estadoPrevio: ErroresFormularioRepuesto,
  formData: FormData,
): Promise<ErroresFormularioRepuesto> {
  const datos = leerDatos(formData);
  const errores = validar(datos);
  if (Object.keys(errores).length > 0) return errores;

  const repuesto = await prisma.$transaction(async (tx) => {
    const creado = await tx.repuesto.create({
      data: {
        descripcion: datos.descripcion,
        codigo: datos.codigo || null,
        proveedor: datos.proveedor || null,
        stock: 0,
        stockMinimo: datos.stockMinimo || 0,
        costo: datos.costo,
        precioVenta: datos.precioVenta,
      },
    });
    if (datos.stock > 0) {
      await tx.movimientoStock.create({
        data: { repuestoId: creado.id, tipo: TipoMovimientoStock.ENTRADA, cantidad: datos.stock },
      });
      await tx.repuesto.update({ where: { id: creado.id }, data: { stock: datos.stock } });
    }
    return creado;
  });

  revalidatePath("/stock");
  redirect(`/stock/${repuesto.id}`);
}

// Para carga rápida desde el panel de escritorio: guarda y vuelve al
// listado (no al detalle) para poder seguir cargando repuestos sin
// interrupciones, uno atrás de otro.
export async function crearRepuestoRapido(
  _estadoPrevio: ErroresFormularioRepuesto,
  formData: FormData,
): Promise<ErroresFormularioRepuesto> {
  const datos = leerDatos(formData);
  const errores = validar(datos);
  if (Object.keys(errores).length > 0) return errores;

  await prisma.$transaction(async (tx) => {
    const creado = await tx.repuesto.create({
      data: {
        descripcion: datos.descripcion,
        codigo: datos.codigo || null,
        proveedor: datos.proveedor || null,
        stock: 0,
        stockMinimo: datos.stockMinimo || 0,
        costo: datos.costo,
        precioVenta: datos.precioVenta,
      },
    });
    if (datos.stock > 0) {
      await tx.movimientoStock.create({
        data: { repuestoId: creado.id, tipo: TipoMovimientoStock.ENTRADA, cantidad: datos.stock },
      });
      await tx.repuesto.update({ where: { id: creado.id }, data: { stock: datos.stock } });
    }
  });

  revalidatePath("/stock");
  redirect("/stock");
}

export async function actualizarRepuesto(
  id: string,
  _estadoPrevio: ErroresFormularioRepuesto,
  formData: FormData,
): Promise<ErroresFormularioRepuesto> {
  const datos = leerDatos(formData);
  const errores = validar(datos);
  if (Object.keys(errores).length > 0) return errores;

  await prisma.repuesto.update({
    where: { id },
    data: {
      descripcion: datos.descripcion,
      codigo: datos.codigo || null,
      proveedor: datos.proveedor || null,
      stockMinimo: datos.stockMinimo || 0,
      costo: datos.costo,
      precioVenta: datos.precioVenta,
    },
  });

  revalidatePath("/stock");
  revalidatePath(`/stock/${id}`);
  redirect(`/stock/${id}`);
}

export async function registrarMovimientoStock(repuestoId: string, formData: FormData) {
  const tipo = String(formData.get("tipo") ?? "") as TipoMovimientoStock;
  const cantidad = Number(formData.get("cantidad") ?? 0);
  if (!cantidad || cantidad === 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.movimientoStock.create({ data: { repuestoId, tipo, cantidad: Math.abs(cantidad) } });
    const delta =
      tipo === TipoMovimientoStock.SALIDA ? -Math.abs(cantidad) : Math.abs(cantidad);
    await tx.repuesto.update({
      where: { id: repuestoId },
      data: { stock: { increment: delta } },
    });
  });

  revalidatePath(`/stock/${repuestoId}`);
  revalidatePath("/stock");
}

export async function listarRepuestosActivos() {
  const repuestos = await prisma.repuesto.findMany({
    where: { activo: true },
    select: { id: true, descripcion: true, precioVenta: true, stock: true },
    orderBy: { descripcion: "asc" },
  });
  return repuestos.map((r) => ({ ...r, precioVenta: Number(r.precioVenta) }));
}

export async function cambiarActivoRepuesto(id: string, activo: boolean) {
  await prisma.repuesto.update({ where: { id }, data: { activo } });
  revalidatePath("/stock");
  revalidatePath(`/stock/${id}`);
}
