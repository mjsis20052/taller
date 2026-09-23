import { prisma } from "@/lib/prisma";
import {
  esFechaValida,
  horariosDeFecha,
  horasLibres,
  normalizarHoras,
  type ConfigHorarios,
  type TurnoOcupado,
} from "@/lib/horarios-comunes";

export type { ConfigHorarios };

const CLAVE = "horarios_turnos";

function minutosDesde(horaTexto: string): number {
  const [h, m] = horaTexto.split(":").map(Number);
  return h * 60 + m;
}

function formatearHora(minutos: number): string {
  const h = Math.floor(minutos / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutos % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function generarRango(apertura: string, cierre: string, duracionMin: number): string[] {
  const horas: string[] = [];
  for (let m = minutosDesde(apertura); m < minutosDesde(cierre); m += duracionMin) {
    horas.push(formatearHora(m));
  }
  return horas;
}

function porDefecto(): ConfigHorarios {
  const laborables = generarRango("09:00", "18:00", 60);
  return {
    duracionMin: 60,
    horarios: { 0: [], 1: laborables, 2: laborables, 3: laborables, 4: laborables, 5: laborables, 6: [] },
    especiales: {},
  };
}

export async function obtenerConfigHorarios(): Promise<ConfigHorarios> {
  const fila = await prisma.config.findUnique({ where: { clave: CLAVE } });
  if (!fila) return porDefecto();

  try {
    const datos = JSON.parse(fila.valor);
    const duracionMin = Number(datos.duracionMin) || 60;

    if (datos.horarios && typeof datos.horarios === "object") {
      const horarios: Record<number, string[]> = {};
      for (let dia = 0; dia <= 6; dia++) {
        const horas = datos.horarios[dia];
        horarios[dia] = Array.isArray(horas) ? normalizarHoras(horas.map(String)) : [];
      }
      const especiales: Record<string, string[]> = {};
      if (datos.especiales && typeof datos.especiales === "object") {
        for (const [fecha, horas] of Object.entries(datos.especiales)) {
          if (esFechaValida(fecha) && Array.isArray(horas)) especiales[fecha] = normalizarHoras(horas.map(String));
        }
      }
      return { duracionMin, horarios, especiales };
    }

    // Formato anterior: apertura + cierre + duración + días cerrados.
    const cerrados: number[] = Array.isArray(datos.diasCerrado) ? datos.diasCerrado : [0];
    const rango = generarRango(datos.apertura ?? "09:00", datos.cierre ?? "18:00", duracionMin);
    const horarios: Record<number, string[]> = {};
    for (let dia = 0; dia <= 6; dia++) horarios[dia] = cerrados.includes(dia) ? [] : rango;
    return { duracionMin, horarios, especiales: {} };
  } catch {
    return porDefecto();
  }
}

export async function guardarConfigHorarios(config: ConfigHorarios): Promise<void> {
  const valor = JSON.stringify(config);
  await prisma.config.upsert({
    where: { clave: CLAVE },
    create: { clave: CLAVE, valor },
    update: { valor },
  });
}

const ZONA = "America/Argentina/Buenos_Aires";

function minutosEnArgentina(fecha: Date): number {
  const [h, m] = new Intl.DateTimeFormat("sv-SE", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONA })
    .format(fecha)
    .split(":")
    .map(Number);
  return h * 60 + m;
}

export function hoyEnArgentina(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: ZONA });
}

// Turnos ya dados ese día (hora de Argentina, sin depender de la zona del servidor).
export async function turnosOcupadosDelDia(fecha: string): Promise<TurnoOcupado[]> {
  const turnos = await prisma.turno.findMany({
    where: {
      estado: "AGENDADO",
      fechaHora: { gte: new Date(`${fecha}T00:00:00-03:00`), lte: new Date(`${fecha}T23:59:59.999-03:00`) },
    },
    select: { fechaHora: true, duracionMin: true },
  });
  return turnos.map((t) => ({ inicioMin: minutosEnArgentina(t.fechaHora), duracionMin: t.duracionMin }));
}

// Horas que un cliente (o el dueño) puede tomar en una fecha: las configuradas,
// menos las que se pisan con un turno y las que ya pasaron.
export async function horasLibresDelDia(fecha: string, config?: ConfigHorarios): Promise<string[]> {
  const configuracion = config ?? (await obtenerConfigHorarios());
  const horas = horariosDeFecha(configuracion, fecha);
  if (horas.length === 0) return [];
  const ocupados = await turnosOcupadosDelDia(fecha);
  const ahoraMin = fecha === hoyEnArgentina() ? minutosEnArgentina(new Date()) : fecha < hoyEnArgentina() ? 24 * 60 : null;
  return horasLibres(horas, configuracion.duracionMin, ocupados, ahoraMin);
}
