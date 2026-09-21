import { prisma } from "@/lib/prisma";

// A dónde le pide el taller que le paguen al cliente: por ahora un alias; después un link de
// Mercado Pago (si hay link, el informe muestra el botón para pagar directo).
export type DatosCobro = { alias: string; titular: string; link: string };

const CLAVES = { alias: "cobro_alias", titular: "cobro_titular", link: "cobro_link" } as const;

export async function obtenerDatosCobro(): Promise<DatosCobro> {
  const filas = await prisma.config.findMany({ where: { clave: { in: Object.values(CLAVES) } } });
  const valor = (clave: string) => filas.find((f) => f.clave === clave)?.valor ?? "";
  return { alias: valor(CLAVES.alias), titular: valor(CLAVES.titular), link: valor(CLAVES.link) };
}

export async function guardarDatosCobro(datos: DatosCobro): Promise<void> {
  await Promise.all(
    (Object.keys(CLAVES) as (keyof DatosCobro)[]).map((k) =>
      prisma.config.upsert({
        where: { clave: CLAVES[k] },
        create: { clave: CLAVES[k], valor: datos[k] },
        update: { valor: datos[k] },
      }),
    ),
  );
}
