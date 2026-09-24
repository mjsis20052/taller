import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type RespuestaIdempotente = { status: number; body: unknown };

// Guarda la respuesta de una escritura de voz bajo su (endpoint,
// idempotencyKey): un reintento de red o una doble confirmación del
// asistente con la misma key devuelve la MISMA respuesta sin repetir el
// efecto (crear el ítem, cambiar el estado, etc). Mismo concepto que
// OrdenTrabajo.origenBorradorVozId en /api/voz/ordenes, generalizado acá a
// cualquier endpoint de escritura (ver VozIdempotencia en schema.prisma).
//
// Solo se guarda el resultado de `ejecutar`, nunca errores de validación del
// pedido en sí (JSON inválido, campos faltantes): esos se chequean ANTES de
// llamar a esta función, así una key repetida después de corregir el pedido
// no queda pisada por un resultado de error viejo. Sí quedan guardados los
// resultados de negocio definitivos que arma `ejecutar` (404 OT inexistente,
// 403 transición prohibida, 409 conflicto de concurrencia, 200/201 éxito):
// repetir la misma key tiene que dar siempre la misma respuesta.
export async function conIdempotencia(
  endpoint: string,
  idempotencyKey: string,
  ejecutar: () => Promise<RespuestaIdempotente>,
): Promise<RespuestaIdempotente> {
  const previa = await prisma.vozIdempotencia.findUnique({
    where: { endpoint_idempotencyKey: { endpoint, idempotencyKey } },
  });
  if (previa) {
    return previa.respuesta as RespuestaIdempotente;
  }

  const resultado = await ejecutar();

  try {
    await prisma.vozIdempotencia.create({
      data: { endpoint, idempotencyKey, respuesta: resultado as unknown as Prisma.InputJsonValue },
    });
  } catch (error) {
    // Carrera: dos pedidos con la misma key llegaron casi juntos y el índice
    // único de la tabla frenó al segundo. Se devuelve lo que ya guardó el que ganó.
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002") {
      const ganadora = await prisma.vozIdempotencia.findUnique({
        where: { endpoint_idempotencyKey: { endpoint, idempotencyKey } },
      });
      if (ganadora) return ganadora.respuesta as RespuestaIdempotente;
    }
    throw error;
  }

  return resultado;
}
