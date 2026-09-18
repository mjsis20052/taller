"use server";

import { prisma } from "@/lib/prisma";
import { normalizarPatente } from "@/lib/validaciones/patente";
import { normalizarTelefono } from "@/lib/validaciones/telefono";
import { MARCADOR_PEDIDO_PORTAL } from "@/lib/turno-portal";
import { obtenerConfigHorarios, horariosDelDia } from "@/lib/horarios";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Acciones públicas (sin login — este sistema no tiene autenticación).
// A propósito devuelven lo MÍNIMO indispensable: nunca nombre, teléfono,
// DNI/CUIT ni montos de otra persona. Conocer una patente no debería
// alcanzar para ver quién es el dueño ni cuánto pagó.
//
// El teléfono y la patente NO se validan con un formato estricto acá (a
// propósito, para no trabar a un cliente real con un formato raro) — solo
// se pide que no estén vacíos. La validación estricta sigue existiendo
// para el panel interno (src/lib/validaciones/).
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
  if (!patenteTexto.trim()) {
    return { error: "Ingresá la patente de tu vehículo." };
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

// Horarios que puede elegir el cliente para una fecha dada, según lo que
// el dueño configuró en /configuracion — sin los que ya están ocupados.
export async function obtenerHorariosDisponiblesPublico(fecha: string): Promise<string[]> {
  if (!fecha) return [];

  const diaSemana = new Date(`${fecha}T12:00:00`).getDay();
  const config = await obtenerConfigHorarios();
  const todos = horariosDelDia(config, diaSemana);
  if (todos.length === 0) return [];

  const inicio = new Date(`${fecha}T00:00:00`);
  const fin = new Date(`${fecha}T23:59:59.999`);
  const ocupados = await prisma.turno.findMany({
    where: { fechaHora: { gte: inicio, lte: fin }, estado: "AGENDADO" },
    select: { fechaHora: true },
  });
  const horasOcupadas = new Set(
    ocupados.map((t) =>
      new Intl.DateTimeFormat("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/Argentina/Buenos_Aires",
      }).format(t.fechaHora),
    ),
  );

  const esHoy = fecha === new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
  const ahoraMin = esHoy
    ? Number(
        new Intl.DateTimeFormat("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "America/Argentina/Buenos_Aires",
        })
          .format(new Date())
          .replace(":", ""),
      )
    : -1;

  return todos.filter((h) => {
    if (horasOcupadas.has(h)) return false;
    if (esHoy && Number(h.replace(":", "")) <= ahoraMin) return false;
    return true;
  });
}

export type ErroresTurnoPublico = Partial<
  Record<"nombre" | "telefono" | "patente" | "marca" | "modelo" | "fecha" | "hora" | "motivo", string>
> & { ok?: boolean };

export async function solicitarTurnoPublico(
  _estadoPrevio: ErroresTurnoPublico,
  formData: FormData,
): Promise<ErroresTurnoPublico> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const telefono = normalizarTelefono(String(formData.get("telefono") ?? ""));
  const patenteTexto = String(formData.get("patente") ?? "").trim();
  const marca = String(formData.get("marca") ?? "").trim();
  const modelo = String(formData.get("modelo") ?? "").trim();
  const motivo = String(formData.get("motivo") ?? "").trim();
  const fecha = String(formData.get("fecha") ?? "").trim();
  const hora = String(formData.get("hora") ?? "").trim();

  const errores: ErroresTurnoPublico = {};
  if (!nombre) errores.nombre = "Ingresá tu nombre.";
  if (!telefono) errores.telefono = "Ingresá tu teléfono.";
  if (!patenteTexto) errores.patente = "Ingresá la patente de tu vehículo.";
  if (!motivo) errores.motivo = "Contanos brevemente qué necesita el vehículo.";
  if (!fecha) errores.fecha = "Elegí una fecha.";
  if (!hora) errores.hora = "Elegí un horario.";

  const patente = patenteTexto ? normalizarPatente(patenteTexto) : null;

  let vehiculoExistente = null;
  if (patente) {
    vehiculoExistente = await prisma.vehiculo.findUnique({ where: { patente } });
    if (!vehiculoExistente && (!marca || !modelo)) {
      errores.marca = errores.marca ?? "Contanos marca y modelo (no encontramos esa patente).";
      errores.modelo = errores.modelo ?? " ";
    }
  }

  // El horario tiene que ser uno de los que ofrece el panel para esa
  // fecha — no cualquiera. Se revalida acá, no solo en el navegador.
  if (fecha && hora) {
    const disponibles = await obtenerHorariosDisponiblesPublico(fecha);
    if (!disponibles.includes(hora)) {
      errores.hora = "Ese horario ya no está disponible, elegí otro.";
    }
  }

  if (Object.keys(errores).length > 0) return errores;

  const fechaHora = new Date(`${fecha}T${hora}:00`);

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
    if (!vehiculo) throw new Error("no debería pasar: patente vacía ya filtrada arriba");

    const config = await obtenerConfigHorarios();

    await tx.turno.create({
      data: {
        clienteId: cliente.id,
        vehiculoId: vehiculo.id,
        fechaHora,
        duracionMin: config.duracionMin,
        motivo: `${MARCADOR_PEDIDO_PORTAL}${motivo}`,
      },
    });
  });

  revalidatePath("/agenda");
  revalidatePath("/");

  return { ok: true };
}
