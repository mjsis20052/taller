"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EstadoTurno } from "@/generated/prisma/enums";
import { esPedidoDePortal, limpiarMotivoPortal } from "@/lib/turno-portal";

export type ErroresFormularioTurno = Partial<
  Record<"clienteId" | "vehiculoId" | "motivo" | "fecha" | "hora" | "duracionMin", string>
>;

function construirFechaHora(fecha: string, hora: string): Date | null {
  if (!fecha || !hora) return null;
  const fechaHora = new Date(`${fecha}T${hora}:00`);
  return Number.isNaN(fechaHora.getTime()) ? null : fechaHora;
}

function leerDatosTurno(formData: FormData) {
  return {
    clienteId: String(formData.get("clienteId") ?? "").trim(),
    vehiculoId: String(formData.get("vehiculoId") ?? "").trim(),
    motivo: String(formData.get("motivo") ?? "").trim(),
    fecha: String(formData.get("fecha") ?? "").trim(),
    hora: String(formData.get("hora") ?? "").trim(),
    duracionMin: Number(formData.get("duracionMin") ?? 60),
  };
}

function validarDatosTurno(
  datos: ReturnType<typeof leerDatosTurno>,
): ErroresFormularioTurno {
  const errores: ErroresFormularioTurno = {};
  if (!datos.clienteId) errores.clienteId = "Elegí un cliente.";
  if (!datos.vehiculoId) errores.vehiculoId = "Elegí un vehículo.";
  if (!datos.motivo) errores.motivo = "Ingresá el motivo del turno.";
  if (!construirFechaHora(datos.fecha, datos.hora)) {
    errores.hora = "Fecha u hora inválida.";
  }
  if (!datos.duracionMin || datos.duracionMin <= 0) {
    errores.duracionMin = "Duración inválida.";
  }
  return errores;
}

export async function crearTurno(
  _estadoPrevio: ErroresFormularioTurno,
  formData: FormData,
): Promise<ErroresFormularioTurno> {
  const datos = leerDatosTurno(formData);
  const errores = validarDatosTurno(datos);
  if (Object.keys(errores).length > 0) return errores;

  const fechaHora = construirFechaHora(datos.fecha, datos.hora)!;

  await prisma.turno.create({
    data: {
      clienteId: datos.clienteId,
      vehiculoId: datos.vehiculoId,
      motivo: datos.motivo,
      fechaHora,
      duracionMin: datos.duracionMin,
    },
  });

  revalidatePath("/agenda");
  revalidatePath("/");
  redirect(`/agenda?fecha=${datos.fecha}`);
}

export async function actualizarTurno(
  id: string,
  _estadoPrevio: ErroresFormularioTurno,
  formData: FormData,
): Promise<ErroresFormularioTurno> {
  const datos = leerDatosTurno(formData);
  const errores = validarDatosTurno(datos);
  if (Object.keys(errores).length > 0) return errores;

  const fechaHora = construirFechaHora(datos.fecha, datos.hora)!;

  await prisma.turno.update({
    where: { id },
    data: {
      clienteId: datos.clienteId,
      vehiculoId: datos.vehiculoId,
      motivo: datos.motivo,
      fechaHora,
      duracionMin: datos.duracionMin,
    },
  });

  revalidatePath("/agenda");
  redirect(`/agenda?fecha=${datos.fecha}`);
}

export async function cancelarTurno(id: string): Promise<void> {
  await prisma.turno.update({
    where: { id },
    data: { estado: EstadoTurno.CANCELADO },
  });
  revalidatePath("/agenda");
  revalidatePath("/");
}

// Se llama cuando el dueño toca "Confirmar por WhatsApp" en un pedido que
// vino del portal: saca la marca de "pedido web" (se pasa a tratar como
// un turno normal) para que no siga apareciendo como pendiente en la
// campanita de notificaciones.
export async function confirmarPedidoWeb(id: string): Promise<void> {
  const turno = await prisma.turno.findUnique({ where: { id }, select: { motivo: true } });
  if (!turno || !esPedidoDePortal(turno.motivo)) return;

  await prisma.turno.update({
    where: { id },
    data: { motivo: limpiarMotivoPortal(turno.motivo) },
  });

  revalidatePath("/agenda");
  revalidatePath("/");
}

export async function buscarClientesParaTurno(query: string) {
  const texto = query.trim();
  if (texto.length < 2) return [];

  return prisma.cliente.findMany({
    where: {
      activo: true,
      OR: [
        { nombre: { contains: texto, mode: "insensitive" } },
        { telefono: { contains: texto, mode: "insensitive" } },
      ],
    },
    select: { id: true, nombre: true, telefono: true },
    orderBy: { nombre: "asc" },
    take: 8,
  });
}

export async function listarVehiculosDeCliente(clienteId: string) {
  if (!clienteId) return [];
  return prisma.vehiculo.findMany({
    where: { clienteId, activo: true },
    select: { id: true, patente: true, marca: true, modelo: true },
    orderBy: { patente: "asc" },
  });
}

export async function listarServiciosFrecuentes() {
  return prisma.servicioFrecuente.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, duracionMin: true },
    orderBy: { nombre: "asc" },
  });
}
