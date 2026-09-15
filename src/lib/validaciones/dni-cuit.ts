export function normalizarDni(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function validarDni(valor: string): boolean {
  const dni = normalizarDni(valor);
  return dni.length >= 6 && dni.length <= 8;
}

export function normalizarCuit(valor: string): string {
  return valor.replace(/\D/g, "");
}

const PESOS_CUIT = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

export function validarCuit(valor: string): boolean {
  const cuit = normalizarCuit(valor);
  if (cuit.length !== 11) return false;

  const digitos = cuit.split("").map(Number);
  const suma = PESOS_CUIT.reduce((acc, peso, i) => acc + peso * digitos[i], 0);
  const resto = suma % 11;
  const verificadorEsperado = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;

  return verificadorEsperado === digitos[10];
}

export function formatearCuit(valor: string): string {
  const cuit = normalizarCuit(valor);
  if (cuit.length !== 11) return valor;
  return `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`;
}
