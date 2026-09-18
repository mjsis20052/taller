import { prisma } from "@/lib/prisma";
import { normalizarHoras, type ConfigHorarios } from "@/lib/horarios-comunes";

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
      return { duracionMin, horarios };
    }

    // Formato anterior: apertura + cierre + duración + días cerrados.
    const cerrados: number[] = Array.isArray(datos.diasCerrado) ? datos.diasCerrado : [0];
    const rango = generarRango(datos.apertura ?? "09:00", datos.cierre ?? "18:00", duracionMin);
    const horarios: Record<number, string[]> = {};
    for (let dia = 0; dia <= 6; dia++) horarios[dia] = cerrados.includes(dia) ? [] : rango;
    return { duracionMin, horarios };
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

export function horariosDelDia(config: ConfigHorarios, diaSemana: number): string[] {
  return config.horarios[diaSemana] ?? [];
}
