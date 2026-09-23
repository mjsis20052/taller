export type ConfigHorarios = {
  duracionMin: number;
  // Horas exactas ofrecidas por día de la semana (0 = domingo … 6 = sábado).
  // Un día sin horas queda cerrado.
  horarios: Record<number, string[]>;
  // Días puntuales que pisan al día de la semana: feriados (sin horas = cerrado)
  // o días con horarios distintos. Clave "AAAA-MM-DD".
  especiales: Record<string, string[]>;
};

export const DIAS_SEMANA = [
  { valor: 1, etiqueta: "Lunes" },
  { valor: 2, etiqueta: "Martes" },
  { valor: 3, etiqueta: "Miércoles" },
  { valor: 4, etiqueta: "Jueves" },
  { valor: 5, etiqueta: "Viernes" },
  { valor: 6, etiqueta: "Sábado" },
  { valor: 0, etiqueta: "Domingo" },
];

const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

export function esHoraValida(hora: string): boolean {
  return FORMATO_HORA.test(hora);
}

export function esFechaValida(fecha: string): boolean {
  return FORMATO_FECHA.test(fecha) && !Number.isNaN(new Date(`${fecha}T12:00:00`).getTime());
}

export function normalizarHoras(horas: string[]): string[] {
  return [...new Set(horas.filter(esHoraValida))].sort();
}

// Horas que se ofrecen en una fecha concreta: el día especial, si existe, o el día de la semana.
export function horariosDeFecha(config: ConfigHorarios, fecha: string): string[] {
  const especial = config.especiales[fecha];
  if (especial) return especial;
  return config.horarios[new Date(`${fecha}T12:00:00`).getDay()] ?? [];
}

function aMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export type TurnoOcupado = { inicioMin: number; duracionMin: number };

// Horas libres del día: sin las que se pisan con un turno ya dado (aunque el
// turno sea de otra duración u hora suelta) y, si es hoy, sin las que ya pasaron.
export function horasLibres(
  horas: string[],
  duracionSlotMin: number,
  ocupados: TurnoOcupado[],
  ahoraMin: number | null,
): string[] {
  return horas.filter((hora) => {
    const inicio = aMinutos(hora);
    if (ahoraMin !== null && inicio <= ahoraMin) return false;
    return !ocupados.some((t) => t.inicioMin < inicio + duracionSlotMin && t.inicioMin + t.duracionMin > inicio);
  });
}
