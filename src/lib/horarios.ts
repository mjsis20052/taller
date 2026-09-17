import { prisma } from "@/lib/prisma";

export type ConfigHorarios = {
  apertura: string; // "HH:mm"
  cierre: string; // "HH:mm"
  duracionMin: number;
  diasCerrado: number[]; // 0 = domingo … 6 = sábado
};

const VALORES_POR_DEFECTO: ConfigHorarios = {
  apertura: "09:00",
  cierre: "18:00",
  duracionMin: 60,
  diasCerrado: [0],
};

const CLAVE = "horarios_turnos";

export async function obtenerConfigHorarios(): Promise<ConfigHorarios> {
  const fila = await prisma.config.findUnique({ where: { clave: CLAVE } });
  if (!fila) return VALORES_POR_DEFECTO;

  try {
    const datos = JSON.parse(fila.valor);
    return {
      apertura: datos.apertura ?? VALORES_POR_DEFECTO.apertura,
      cierre: datos.cierre ?? VALORES_POR_DEFECTO.cierre,
      duracionMin: Number(datos.duracionMin) || VALORES_POR_DEFECTO.duracionMin,
      diasCerrado: Array.isArray(datos.diasCerrado) ? datos.diasCerrado : VALORES_POR_DEFECTO.diasCerrado,
    };
  } catch {
    return VALORES_POR_DEFECTO;
  }
}

export async function guardarConfigHorarios(config: ConfigHorarios): Promise<void> {
  await prisma.config.upsert({
    where: { clave: CLAVE },
    create: { clave: CLAVE, valor: JSON.stringify(config) },
    update: { valor: JSON.stringify(config) },
  });
}

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

export function generarHorariosDelDia(config: ConfigHorarios): string[] {
  const inicio = minutosDesde(config.apertura);
  const fin = minutosDesde(config.cierre);
  const horarios: string[] = [];
  for (let m = inicio; m < fin; m += config.duracionMin) {
    horarios.push(formatearHora(m));
  }
  return horarios;
}
