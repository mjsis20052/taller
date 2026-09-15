export interface StorageAdapter {
  guardar(archivo: File, carpeta: string): Promise<string>;
  obtenerUrl(path: string): string;
  eliminar(path: string): Promise<void>;
}
