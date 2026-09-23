// Marca los turnos que llegan del portal público (src/app/(publico)/portal)
// para poder distinguirlos en la Agenda interna y ofrecer un botón de
// "confirmar" en vez del recordatorio genérico.
export const MARCADOR_PEDIDO_PORTAL = "[Pedido por el cliente desde el portal] ";

export function esPedidoDePortal(motivo: string): boolean {
  return motivo.startsWith(MARCADOR_PEDIDO_PORTAL);
}

export function limpiarMotivoPortal(motivo: string): string {
  return esPedidoDePortal(motivo) ? motivo.slice(MARCADOR_PEDIDO_PORTAL.length) : motivo;
}
