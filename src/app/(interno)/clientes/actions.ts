"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { validarCuit, validarDni } from "@/lib/validaciones/dni-cuit";
import { normalizarTelefono, validarTelefono } from "@/lib/validaciones/telefono";
import type { CondicionFiscal, TipoPersona } from "@/generated/prisma/enums";

export type ErroresFormularioCliente = Partial<
  Record<"nombre" | "dni" | "cuit" | "telefono", string>
>;

function leerDatosCliente(formData: FormData) {
  return {
    nombre: String(formData.get("nombre") ?? "").trim(),
    tipoPersona: String(formData.get("tipoPersona") ?? "FISICA") as TipoPersona,
    dni: String(formData.get("dni") ?? "").trim(),
    cuit: String(formData.get("cuit") ?? "").trim(),
    condicionFiscal: String(
      formData.get("condicionFiscal") ?? "CONSUMIDOR_FINAL",
    ) as CondicionFiscal,
    telefono: normalizarTelefono(String(formData.get("telefono") ?? "")),
    email: String(formData.get("email") ?? "").trim(),
    domicilio: String(formData.get("domicilio") ?? "").trim(),
    notas: String(formData.get("notas") ?? "").trim(),
  };
}

function validarDatosCliente(
  datos: ReturnType<typeof leerDatosCliente>,
): ErroresFormularioCliente {
  const errores: ErroresFormularioCliente = {};

  if (!datos.nombre) {
    errores.nombre = "Ingresá un nombre o razón social.";
  }
  if (datos.dni && !validarDni(datos.dni)) {
    errores.dni = "El DNI debe tener entre 6 y 8 dígitos.";
  }
  if (datos.cuit && !validarCuit(datos.cuit)) {
    errores.cuit = "El CUIT no es válido (11 dígitos con dígito verificador correcto).";
  }
  if (!datos.telefono) {
    errores.telefono = "El teléfono es obligatorio.";
  } else if (!validarTelefono(datos.telefono)) {
    errores.telefono = "Teléfono inválido. Cargalo con el código de área, ej: 2245506078.";
  }

  return errores;
}

export async function crearCliente(
  _estadoPrevio: ErroresFormularioCliente,
  formData: FormData,
): Promise<ErroresFormularioCliente> {
  const datos = leerDatosCliente(formData);
  const errores = validarDatosCliente(datos);
  if (Object.keys(errores).length > 0) return errores;

  const cliente = await prisma.cliente.create({
    data: {
      nombre: datos.nombre,
      tipoPersona: datos.tipoPersona,
      dni: datos.dni || null,
      cuit: datos.cuit || null,
      condicionFiscal: datos.condicionFiscal,
      telefono: datos.telefono,
      email: datos.email || null,
      domicilio: datos.domicilio || null,
      notas: datos.notas || null,
    },
  });

  revalidatePath("/clientes");
  redirect(`/clientes/${cliente.id}`);
}

export async function actualizarCliente(
  id: string,
  _estadoPrevio: ErroresFormularioCliente,
  formData: FormData,
): Promise<ErroresFormularioCliente> {
  const datos = leerDatosCliente(formData);
  const errores = validarDatosCliente(datos);
  if (Object.keys(errores).length > 0) return errores;

  await prisma.cliente.update({
    where: { id },
    data: {
      nombre: datos.nombre,
      tipoPersona: datos.tipoPersona,
      dni: datos.dni || null,
      cuit: datos.cuit || null,
      condicionFiscal: datos.condicionFiscal,
      telefono: datos.telefono,
      email: datos.email || null,
      domicilio: datos.domicilio || null,
      notas: datos.notas || null,
    },
  });

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}`);
}

export async function cambiarActivoCliente(id: string, activo: boolean) {
  await prisma.cliente.update({ where: { id }, data: { activo } });
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
}
