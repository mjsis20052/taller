"use server";

import { prisma } from "@/lib/prisma";
import { normalizarPatente, validarPatente } from "@/lib/validaciones/patente";
import { validarTelefono } from "@/lib/validaciones/telefono";
import { MARCADOR_PEDIDO_PORTAL } from "@/lib/turno-portal";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Acciones públicas (sin login — este sistema no tiene autenticación).
// A propósito devuelven lo MÍNIMO indispensable: nunca nombre, teléfono,
// DNI/CUIT ni montos de otra persona. Conocer una patente no debería
// alcanzar para ver quién es el dueño ni cuánto pagó.
// ---------------------------------------------------------------------------

const ETIQUETAS_ESTADO_PUBLICO: Record<string, string> = {
  TURNO_AGENDADO: "Tenés un turno agendado, todavía no ingresó al taller.",
  INGRESADO: "Ingresó al taller y está en revisión.",
  EN_DIAGNOSTICO: "Lo estamos diagnosticando.",
  PRESUPUESTADO: "Te enviamos un presupuesto — revisá tu WhatsApp.",
  APROBADO: "Presupuesto aprobado, en cola para reparar.",
  EN_EJECUCION: "Estamos trabajando en tu vehículo.",
  TERMINADO: "¡Listo! Podés pasar a retirarlo.",
  FACTURADO: "Listo y facturado. Te esperamos para la entrega.",
  ENTREGADO: "Ya fue entregado.",
};

export type ResultadoConsultaPublica = {
  error?: string;
  encontrado?: boolean;
  patente?: string;
  marca?: string;
  modelo?: string;
  mensaje?: string;
};

export async function consultarPatentePublico(
  _estadoPrevio: ResultadoConsultaPublica,
  formData: FormData,
): Promise<ResultadoConsultaPublica> {
  const patenteTexto = String(formData.get("patente") ?? "");
  if (!validarPatente(patenteTexto)) {
    return { error: "Ingresá una patente válida (ej: AB123CD)." };
  }
  const patente = normalizarPatente(patenteTexto);

  const vehiculo = await prisma.vehiculo.findUnique({
    where: { patente },
    select: {
      patente: true,
      marca: true,
      modelo: true,
      ordenesTrabajo: {
        where: { estado: { not: "CANCELADA" } },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { estado: true },
      },
    },
  });

  if (!vehiculo) {
    return { encontrado: false };
  }

  const ultimaOT = vehiculo.ordenesTrabajo[0];

  return {
    encontrado: true,
    patente: vehiculo.patente,
    marca: vehiculo.marca,
    modelo: vehiculo.modelo,
    mensaje: ultimaOT
      ? (ETIQUETAS_ESTADO_PUBLICO[ultimaOT.estado] ?? "Sin novedades por ahora.")
      : "Todavía no tiene ninguna orden de trabajo cargada.",
  };
}

export type ErroresTurnoPublico = Partial<
  Record<"nombre" | "telefono" | "patente" | "marca" | "modelo" | "fecha" | "hora" | "motivo", string>
> & { ok?: boolean };

export async function solicitarTurnoPublico(
  _estadoPrevio: ErroresTurnoPublico,
  formData: FormData,
): Promise<ErroresTurnoPublico> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const patenteTexto = String(formData.get("patente") ?? "").trim();
  const marca = String(formData.get("marca") ?? "").trim();
  const modelo = String(formData.get("modelo") ?? "").trim();
  const motivo = String(formData.get("motivo") ?? "").trim();
  const fecha = String(formData.get("fecha") ?? "").trim();
  const hora = String(formData.get("hora") ?? "").trim();

  const errores: ErroresTurnoPublico = {};
  if (!nombre) errores.nombre = "Ingresá tu nombre.";
  if (!telefono || !validarTelefono(telefono)) {
    errores.telefono = "Formato internacional, ej: +5491122334455.";
  }
  if (!patenteTexto || !validarPatente(patenteTexto)) {
    errores.patente = "Ingresá una patente válida (ej: AB123CD).";
  }
  if (!motivo) errores.motivo = "Contanos brevemente qué necesita el vehículo.";
  if (!fecha) errores.fecha = "Elegí una fecha.";
  if (!hora) errores.hora = "Elegí un horario.";

  const patente = validarPatente(patenteTexto) ? normalizarPatente(patenteTexto) : null;

  let vehiculoExistente = null;
  if (patente) {
    vehiculoExistente = await prisma.vehiculo.findUnique({ where: { patente } });
    if (!vehiculoExistente && (!marca || !modelo)) {
      errores.marca = errores.marca ?? "Contanos marca y modelo (no encontramos esa patente).";
      errores.modelo = errores.modelo ?? " ";
    }
  }

  const fechaHora = fecha && hora ? new Date(`${fecha}T${hora}:00`) : null;
  if (fechaHora && (Number.isNaN(fechaHora.getTime()) || fechaHora.getTime() < Date.now())) {
    errores.hora = "Elegí una fecha y hora futuras.";
  }

  if (Object.keys(errores).length > 0) return errores;

  await prisma.$transaction(async (tx) => {
    let cliente = await tx.cliente.findFirst({ where: { telefono } });
    if (!cliente) {
      cliente = await tx.cliente.create({
        data: { nombre, telefono, tipoPersona: "FISICA", condicionFiscal: "CONSUMIDOR_FINAL" },
      });
    }

    let vehiculo = vehiculoExistente;
    if (!vehiculo && patente) {
      vehiculo = await tx.vehiculo.create({
        data: { clienteId: cliente.id, patente, marca, modelo },
      });
    }
    if (!vehiculo) throw new Error("no debería pasar: patente inválida ya filtrada arriba");

    await tx.turno.create({
      data: {
        clienteId: cliente.id,
        vehiculoId: vehiculo.id,
        fechaHora: fechaHora!,
        duracionMin: 60,
        motivo: `${MARCADOR_PEDIDO_PORTAL}${motivo}`,
      },
    });
  });

  revalidatePath("/agenda");
  revalidatePath("/");

  return { ok: true };
}
