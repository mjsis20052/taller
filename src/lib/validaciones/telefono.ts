const FORMATO_INTERNACIONAL = /^\+[1-9]\d{7,14}$/;

export function validarTelefono(valor: string): boolean {
  return FORMATO_INTERNACIONAL.test(valor.trim());
}

// Deja el teléfono en formato internacional argentino de celular (+549…)
// aunque se cargue "2245506078", "0224 550-6078" o "5492245506078".
// Si no parece un número (menos de 8 dígitos) lo devuelve como vino.
export function normalizarTelefono(valor: string): string {
  const original = valor.trim();
  const digitos = original.replace(/\D/g, "");
  if (digitos.length < 8) return original;

  if (original.startsWith("+")) return `+${digitos}`;
  if (digitos.startsWith("549")) return `+${digitos}`;
  if (digitos.startsWith("54") && digitos.length === 12) return `+549${digitos.slice(2)}`;
  return `+549${digitos.replace(/^0+/, "")}`;
}

// "Cargado" = tiene al menos 8 dígitos (sirve para armar el link de WhatsApp).
export function tieneTelefono(valor: string | null | undefined): boolean {
  return (valor ?? "").replace(/\D/g, "").length >= 8;
}
