import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const RAIZ_UPLOADS = path.join(process.cwd(), "uploads");

const TIPOS_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segmentos } = await params;

  // Evita path traversal: cada segmento se valida individualmente.
  if (segmentos.some((s) => s.includes("..") || s.includes("/") || s.includes("\\"))) {
    return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
  }

  const rutaAbsoluta = path.join(RAIZ_UPLOADS, ...segmentos);

  try {
    const info = await stat(rutaAbsoluta);
    if (!info.isFile()) throw new Error("no es un archivo");

    const bytes = await readFile(rutaAbsoluta);
    const extension = path.extname(rutaAbsoluta).toLowerCase();

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": TIPOS_MIME[extension] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
}
