export interface FacturacionAdapter {
  solicitarFactura(solicitudId: string): Promise<void>;
  consultarEstado(solicitudId: string): Promise<string>;
}
