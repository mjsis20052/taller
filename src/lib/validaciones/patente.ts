const FORMATO_VIEJO = /^[A-Z]{3}\d{3}$/;
const FORMATO_MERCOSUR = /^[A-Z]{2}\d{3}[A-Z]{2}$/;

export function normalizarPatente(valor: string): string {
  return valor.trim().toUpperCase().replace(/[\s-]/g, "");
}

export function validarPatente(valor: string): boolean {
  const patente = normalizarPatente(valor);
  return FORMATO_VIEJO.test(patente) || FORMATO_MERCOSUR.test(patente);
}
