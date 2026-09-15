const FORMATO_INTERNACIONAL = /^\+[1-9]\d{7,14}$/;

export function validarTelefono(valor: string): boolean {
  return FORMATO_INTERNACIONAL.test(valor.trim());
}
