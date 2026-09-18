export type ConfigHorarios = {
  duracionMin: number;
  // Horas exactas ofrecidas por día de la semana (0 = domingo … 6 = sábado).
  // Un día sin horas queda cerrado.
  horarios: Record<number, string[]>;
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

export function esHoraValida(hora: string): boolean {
  return FORMATO_HORA.test(hora);
}

export function normalizarHoras(horas: string[]): string[] {
  return [...new Set(horas.filter(esHoraValida))].sort();
}
