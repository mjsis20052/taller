// La patente puede tener cualquier formato (autos, motos, patentes viejas o de otro país):
// solo se pasa a mayúsculas y se sacan espacios y guiones para poder buscarla siempre igual.
export function normalizarPatente(valor: string): string {
  return valor.trim().toUpperCase().replace(/[\s-]/g, "");
}
