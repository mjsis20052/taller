export function pesos(valor: number | { toString(): string }): string {
  return `$${Number(valor).toLocaleString("es-AR")}`;
}

// Una devolución resta; un cobro o una seña suman.
export function montoFirmado(cobro: { monto: { toString(): string } | number; concepto: string }): number {
  const monto = Number(cobro.monto);
  return cobro.concepto === "DEVOLUCION" ? -monto : monto;
}
