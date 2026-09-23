import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const RAIZ_UPLOADS = path.join(process.cwd(), "uploads");

const TIPOS_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
};

// Foto de una OT para el informe del cliente. Solo se sirve si el token es el de la OT a la
// que pertenece la foto: el resto de /uploads sigue cerrado detrás del login.
export async function GET(_request: Request, { params }: { params: Promise<{ token: string; fotoId: string }> }) {
  const { token, fotoId } = await params;
  if (!/^[a-f0-9]{32}$/.test(token)) return new NextResponse("No encontrada", { status: 404 });

  const foto = await prisma.foto.findFirst({ where: { id: fotoId, ot: { tokenInforme: token } } });
  if (!foto) return new NextResponse("No encontrada", { status: 404 });

  const ruta = path.join(RAIZ_UPLOADS, ...foto.path.split("/"));
  if (!ruta.startsWith(RAIZ_UPLOADS)) return new NextResponse("No encontrada", { status: 404 });

  try {
    const bytes = await readFile(ruta);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": TIPOS_MIME[path.extname(ruta).toLowerCase()] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch {
    return new NextResponse("No encontrada", { status: 404 });
  }
}
