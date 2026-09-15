import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter } from "./storage-adapter";

const RAIZ_UPLOADS = path.join(process.cwd(), "uploads");

function extensionDe(nombreArchivo: string): string {
  const ext = path.extname(nombreArchivo);
  return ext ? ext.toLowerCase() : "";
}

export class LocalAdapter implements StorageAdapter {
  async guardar(archivo: File, carpeta: string): Promise<string> {
    const destino = path.join(RAIZ_UPLOADS, carpeta);
    await mkdir(destino, { recursive: true });

    const nombre = `${randomUUID()}${extensionDe(archivo.name)}`;
    const bytes = Buffer.from(await archivo.arrayBuffer());
    await writeFile(path.join(destino, nombre), bytes);

    return `${carpeta}/${nombre}`;
  }

  obtenerUrl(path: string): string {
    return `/uploads/${path}`;
  }

  async eliminar(relativo: string): Promise<void> {
    await unlink(path.join(RAIZ_UPLOADS, relativo)).catch(() => {});
  }
}

export const storageAdapter: StorageAdapter = new LocalAdapter();
