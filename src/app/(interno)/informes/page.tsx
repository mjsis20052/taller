import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";
import { BotonCompartirInforme } from "@/components/boton-compartir-informe";
import { EstadoOT } from "@/generated/prisma/enums";
import { pesos } from "@/lib/formato";
import { resumenPedidos } from "@/lib/pedidos";

export const metadata: Metadata = { title: "Informes" };

const ETIQUETAS_ESTADO: Record<string, string> = {
  INGRESADO: "Ingresado",
  EN_DIAGNOSTICO: "En diagnóstico",
  PRESUPUESTADO: "Presupuestado",
  APROBADO: "Aprobado",
  EN_EJECUCION: "En ejecución",
  TERMINADO: "Terminado",
  FACTURADO: "Facturado",
  ENTREGADO: "Entregado",
};

export default async function PaginaInformes() {
  const clientes = await prisma.cliente.findMany({
    where: { ordenesTrabajo: { some: { estado: { notIn: [EstadoOT.TURNO_AGENDADO, EstadoOT.CANCELADA] } } } },
    select: {
      id: true,
      nombre: true,
      telefono: true,
      tokenInforme: true,
      ordenesTrabajo: {
        where: { estado: { notIn: [EstadoOT.TURNO_AGENDADO, EstadoOT.CANCELADA] } },
        select: {
          id: true,
          numero: true,
          estado: true,
          total: true,
          tokenInforme: true,
          createdAt: true,
          vehiculo: { select: { patente: true, marca: true, modelo: true } },
          items: { select: { tipo: true, estadoPedido: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const ordenados = clientes.sort(
    (a, b) => b.ordenesTrabajo[0].createdAt.getTime() - a.ordenesTrabajo[0].createdAt.getTime(),
  );

  return (
    <section>
      <EncabezadoPagina
        titulo="Informes"
        descripcion="Compartí con cada cliente lo que se hizo: una orden puntual o todo su historial."
      />

      {ordenados.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hay informes"
          descripcion="Cuando recepciones un vehículo, la orden aparece acá para compartirla con el cliente."
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M6 3h9l4 4v14H6z" />
              <path d="M14 3v5h5M9 13h7M9 17h5" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-3">
          {ordenados.map((cliente) => (
            <details key={cliente.id} className="rounded-2xl border border-borde bg-superficie p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15.5px] font-bold text-foreground">{cliente.nombre}</p>
                  <p className="text-[12px] text-mutado">
                    {cliente.ordenesTrabajo.length} orden{cliente.ordenesTrabajo.length === 1 ? "" : "es"}
                  </p>
                </div>
                <span className="shrink-0 text-[12px] font-semibold text-primario">Ver ›</span>
              </summary>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-primario-suave/50 p-3">
                  <p className="mb-2 text-[13px] font-bold text-foreground">Todos los trabajos realizados</p>
                  <BotonCompartirInforme
                    ruta={`/informe/cliente/${cliente.tokenInforme}`}
                    telefono={cliente.telefono}
                    texto={`Hola ${cliente.nombre.split(" ")[0]}! Te comparto el historial de todos los trabajos que hicimos en tu vehículo:`}
                  />
                </div>

                <p className="text-[12px] font-bold uppercase tracking-wide text-mutado">O una orden en particular</p>
                <div className="space-y-2">
                  {cliente.ordenesTrabajo.map((ot) => {
                    const espera = resumenPedidos(ot.items) === "ESPERANDO";
                    return (
                      <div
                        key={ot.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-borde bg-background px-3.5 py-3"
                      >
                        <Link href={`/ots/${ot.id}`} className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold text-foreground">
                            {ot.numero} · {ot.vehiculo.marca} {ot.vehiculo.modelo}
                          </p>
                          <p className="truncate text-[12px] text-mutado">
                            {ot.vehiculo.patente} · {ETIQUETAS_ESTADO[ot.estado] ?? ot.estado} · {pesos(ot.total)}
                            {espera ? " · esperando repuesto" : ""}
                          </p>
                        </Link>
                        <BotonCompartirInforme
                          variante="icono"
                          ruta={`/informe/${ot.tokenInforme}`}
                          telefono={cliente.telefono}
                          texto={`Hola ${cliente.nombre.split(" ")[0]}! Te comparto el informe de tu ${ot.vehiculo.marca} ${ot.vehiculo.modelo} (${ot.numero}). Ahí ves cómo avanza:`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
