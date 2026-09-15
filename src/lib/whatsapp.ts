export function enlaceWhatsApp(telefono: string, texto?: string): string {
  const numero = telefono.replace(/\D/g, "");
  const query = texto ? `?text=${encodeURIComponent(texto)}` : "";
  return `https://wa.me/${numero}${query}`;
}
