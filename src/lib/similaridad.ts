// Distancia de edición (Levenshtein) entre dos strings, para encontrar
// patentes "parecidas" cuando no hay coincidencia exacta (la transcripción
// por voz puede traer algún carácter mal). No es para nada más: es O(n·m),
// pensado para comparar strings cortos como una patente, no textos largos.
export function distanciaLevenshtein(a: string, b: string): number {
  const filas = a.length + 1;
  const columnas = b.length + 1;
  const matriz: number[][] = Array.from({ length: filas }, (_, i) => [i, ...Array(columnas - 1).fill(0)]);
  for (let j = 0; j < columnas; j++) matriz[0][j] = j;

  for (let i = 1; i < filas; i++) {
    for (let j = 1; j < columnas; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      matriz[i][j] = Math.min(
        matriz[i - 1][j] + 1, // borrar
        matriz[i][j - 1] + 1, // insertar
        matriz[i - 1][j - 1] + costo, // sustituir
      );
    }
  }
  return matriz[filas - 1][columnas - 1];
}
