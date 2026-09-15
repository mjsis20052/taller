"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizarPatente, validarPatente } from "@/lib/validaciones/patente";
import { storageAdapter } from "@/lib/storage/local-adapter";
import { EntidadFoto } from "@/generated/prisma/enums";

export type ErroresFormularioVehiculo = Partial<
  Record<"patente" | "marca" | "modelo" | "anio", string>
>;

function leerDatosVehiculo(formData: FormData) {
  const anioTexto = String(formData.get("anio") ?? "").trim();
  return {
    patente: String(formData.get("patente") ?? "").trim(),
    marca: String(formData.get("marca") ?? "").trim(),
    modelo: String(formData.get("modelo") ?? "").trim(),
    anio: anioTexto ? Number(anioTexto) : null,
    color: String(formData.get("color") ?? "").trim(),
    vin: String(formData.get("vin") ?? "").trim(),
  };
}

function validarDatosVehiculo(
  datos: ReturnType<typeof leerDatosVehiculo>,
): ErroresFormularioVehiculo {
  const errores: ErroresFormularioVehiculo = {};

  if (!datos.patente || !validarPatente(datos.patente)) {
    errores.patente = "Patente inválida. Formatos: AAA123 o AA123BB.";
  }
  if (!datos.marca) {
    errores.marca = "Ingresá la marca.";
  }
  if (!datos.modelo) {
    errores.modelo = "Ingresá el modelo.";
  }
  if (datos.anio !== null && (Number.isNaN(datos.anio) || datos.anio < 1950 || datos.anio > 2100)) {
    errores.anio = "Año inválido.";
  }

  return errores;
}

export async function crearVehiculo(
  clienteId: string,
  _estadoPrevio: ErroresFormularioVehiculo,
  formData: FormData,
): Promise<ErroresFormularioVehiculo> {
  const datos = leerDatosVehiculo(formData);
  const errores = validarDatosVehiculo(datos);
  if (Object.keys(errores).length > 0) return errores;

  const patenteNormalizada = normalizarPatente(datos.patente);
  const existente = await prisma.vehiculo.findUnique({
    where: { patente: patenteNormalizada },
  });
  if (existente) {
    return { patente: "Ya hay un vehículo cargado con esa patente." };
  }

  const vehiculo = await prisma.vehiculo.create({
    data: {
      clienteId,
      patente: patenteNormalizada,
      marca: datos.marca,
      modelo: datos.modelo,
      anio: datos.anio,
      color: datos.color || null,
      vin: datos.vin || null,
    },
  });

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/vehiculos");
  redirect(`/vehiculos/${vehiculo.id}`);
}

export async function actualizarVehiculo(
  id: string,
  _estadoPrevio: ErroresFormularioVehiculo,
  formData: FormData,
): Promise<ErroresFormularioVehiculo> {
  const datos = leerDatosVehiculo(formData);
  const errores = validarDatosVehiculo(datos);
  if (Object.keys(errores).length > 0) return errores;

  const patenteNormalizada = normalizarPatente(datos.patente);
  const otro = await prisma.vehiculo.findUnique({
    where: { patente: patenteNormalizada },
  });
  if (otro && otro.id !== id) {
    return { patente: "Ya hay un vehículo cargado con esa patente." };
  }

  const vehiculo = await prisma.vehiculo.update({
    where: { id },
    data: {
      patente: patenteNormalizada,
      marca: datos.marca,
      modelo: datos.modelo,
      anio: datos.anio,
      color: datos.color || null,
      vin: datos.vin || null,
    },
  });

  revalidatePath(`/clientes/${vehiculo.clienteId}`);
  revalidatePath("/vehiculos");
  revalidatePath(`/vehiculos/${id}`);
  redirect(`/vehiculos/${id}`);
}

export async function cambiarActivoVehiculo(id: string, activo: boolean) {
  const vehiculo = await prisma.vehiculo.update({ where: { id }, data: { activo } });
  revalidatePath(`/clientes/${vehiculo.clienteId}`);
  revalidatePath("/vehiculos");
  revalidatePath(`/vehiculos/${id}`);
}

export async function registrarKilometraje(vehiculoId: string, formData: FormData) {
  const kmTexto = String(formData.get("km") ?? "").trim();
  const km = Number(kmTexto);

  if (!kmTexto || Number.isNaN(km) || km < 0) {
    return;
  }

  await prisma.kilometrajeRegistro.create({
    data: { vehiculoId, km },
  });

  revalidatePath(`/vehiculos/${vehiculoId}`);
}

export type ErrorBusquedaVehiculo = { error?: string };

export async function buscarVehiculoPorPatente(
  _estadoPrevio: ErrorBusquedaVehiculo,
  formData: FormData,
): Promise<ErrorBusquedaVehiculo> {
  const patente = normalizarPatente(String(formData.get("patente") ?? ""));
  if (!patente) return { error: "Ingresá una patente." };

  const vehiculo = await prisma.vehiculo.findUnique({ where: { patente } });
  if (!vehiculo) {
    return { error: `No hay ningún vehículo cargado con la patente ${patente}.` };
  }

  redirect(`/vehiculos/${vehiculo.id}`);
}

export type ResultadoBusquedaAsignacion = {
  error?: string;
  vehiculo?: {
    id: string;
    patente: string;
    marca: string;
    modelo: string;
    clienteActualNombre: string;
    yaEsDeEsteCliente: boolean;
  };
};

export async function buscarVehiculoParaAsignar(
  clienteId: string,
  _estadoPrevio: ResultadoBusquedaAsignacion,
  formData: FormData,
): Promise<ResultadoBusquedaAsignacion> {
  const patente = normalizarPatente(String(formData.get("patente") ?? ""));
  if (!patente) return { error: "Ingresá una patente." };

  const vehiculo = await prisma.vehiculo.findUnique({
    where: { patente },
    include: { cliente: { select: { id: true, nombre: true } } },
  });

  if (!vehiculo) {
    return { error: `No hay ningún vehículo cargado con la patente ${patente}.` };
  }

  return {
    vehiculo: {
      id: vehiculo.id,
      patente: vehiculo.patente,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      clienteActualNombre: vehiculo.cliente.nombre,
      yaEsDeEsteCliente: vehiculo.clienteId === clienteId,
    },
  };
}

export async function asignarVehiculoACliente(vehiculoId: string, clienteId: string) {
  const vehiculo = await prisma.vehiculo.update({
    where: { id: vehiculoId },
    data: { clienteId, activo: true },
  });

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath(`/vehiculos/${vehiculoId}`);
  redirect(`/vehiculos/${vehiculo.id}`);
}

export async function subirFotoVehiculo(vehiculoId: string, formData: FormData) {
  const archivo = formData.get("foto");
  if (!(archivo instanceof File) || archivo.size === 0) return;

  const rutaGuardada = await storageAdapter.guardar(archivo, `vehiculos/${vehiculoId}`);

  await prisma.foto.create({
    data: {
      entidad: EntidadFoto.VEHICULO,
      vehiculoId,
      path: rutaGuardada,
    },
  });

  revalidatePath(`/vehiculos/${vehiculoId}`);
}

export async function eliminarFotoVehiculo(fotoId: string, vehiculoId: string) {
  const foto = await prisma.foto.findUnique({ where: { id: fotoId } });
  if (!foto) return;

  await prisma.foto.delete({ where: { id: fotoId } });
  await storageAdapter.eliminar(foto.path);

  revalidatePath(`/vehiculos/${vehiculoId}`);
}
