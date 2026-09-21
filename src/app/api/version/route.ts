// Devuelve la versión publicada; la app abierta la compara con la suya para avisar si hay una nueva.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { id: process.env.NEXT_PUBLIC_BUILD_ID ?? "dev" },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
