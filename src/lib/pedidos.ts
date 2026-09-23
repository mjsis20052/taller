// Ciclo de un repuesto que hay que pedir: A_PEDIR -> PEDIDO -> RECIBIDO (recepcionado al llegar).
export type EstadoPedido = "NO" | "A_PEDIR" | "PEDIDO" | "RECIBIDO";

export const ESTADOS_PEDIDO: EstadoPedido[] = ["NO", "A_PEDIR", "PEDIDO", "RECIBIDO"];

export const ETIQUETA_PEDIDO: Record<EstadoPedido, string> = {
  NO: "",
  A_PEDIR: "Hay que pedirlo",
  PEDIDO: "Pedido, esperando que llegue",
  RECIBIDO: "Recepcionado",
};

export type ResumenPedidos = "ESPERANDO" | "RECIBIDOS" | null;

// ESPERANDO: hay repuestos por pedir o que todavía no llegaron (el vehículo queda esperando).
// RECIBIDOS: había repuestos pedidos y ya llegaron todos (se puede seguir con el trabajo).
export function resumenPedidos(items: { tipo: string; estadoPedido: string }[]): ResumenPedidos {
  const repuestos = items.filter((i) => i.tipo === "REPUESTO");
  if (repuestos.some((i) => i.estadoPedido === "A_PEDIR" || i.estadoPedido === "PEDIDO")) return "ESPERANDO";
  if (repuestos.some((i) => i.estadoPedido === "RECIBIDO")) return "RECIBIDOS";
  return null;
}
