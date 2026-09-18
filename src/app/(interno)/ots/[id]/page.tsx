import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { PanelAccionesOT } from "@/components/panel-acciones-ot";
import { GaleriaFotosOT } from "@/components/galeria-fotos-ot";
import { FormularioTrabajoOT } from "@/components/formulario-trabajo-ot";
import { BotonAgregarRepuesto } from "@/components/boton-agregar-repuesto";
import { FormularioPagoOT } from "@/components/formulario-pago-ot";
import { alternarRepuestoAPedir, eliminarItemOT } from "@/app/(interno)/ots/actions";
import { eliminarPagoOT } from "@/app/(interno)/cobranzas/actions";

const ETIQUETAS_ESTADO: Record<string, string> = {
  TURNO_AGENDADO: "Turno agendado",
  INGRESADO: "Ingresado",
  EN_DIAGNOSTICO: "En diagnóstico",
  PRESUPUESTADO: "Presupuestado",
  APROBADO: "Aprobado",
  EN_EJECUCION: "En ejecución",
  TERMINADO: "Terminado",
  FACTURADO: "Facturado",
  ENTREGADO: "Entregado",
  CANCELADA: "Cancelada",
};

const NIVELES_COMBUSTIBLE: Record<string, string> = {
  VACIO: "Vacío",
  UN_CUARTO: "1/4",
  MEDIO: "1/2",
  TRES_CUARTOS: "3/4",
  LLENO: "Lleno",
};

const EDITABLE = new Set(["EN_DIAGNOSTICO", "PRESUPUESTADO", "APROBADO", "EN_EJECUCION"]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ot = await prisma.ordenTrabajo.findUnique({ where: { id }, select: { numero: true } });
  return { title: ot?.numero ?? "OT" };
}

export default async function PaginaDetalleOT({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ot = await prisma.ordenTrabajo.findUnique({
    where: { id },
    include: {
      cliente: { select: { id: true, nombre: true, telefono: true } },
      vehiculo: { select: { id: true, patente: true, marca: true, modelo: true } },
      items: { orderBy: { createdAt: "asc" } },
      cobros: { orderBy: { fecha: "asc" } },
      fotos: { orderBy: { fechaTomada: "desc" } },
      timeline: { orderBy: { fecha: "asc" } },
      presupuestos: { orderBy: { createdAt: "desc" }, take: 1 },
      solicitudFacturacion: true,
    },
  });

  if (!ot) notFound();

  const presupuestoActual = ot.presupuestos[0];
  const presupuestoPendiente =
    ot.estado === "PRESUPUESTADO" && presupuestoActual
      ? { id: presupuestoActual.id, total: Number(presupuestoActual.total) }
      : null;

  const puedeEditarItems = EDITABLE.has(ot.estado);
  const trabajos = ot.items.filter((i) => i.tipo === "MANO_OBRA");
  const repuestos = ot.items.filter((i) => i.tipo === "REPUESTO");
  const pagado = ot.cobros.reduce((acc, c) => acc + Number(c.monto), 0);
  const saldoOT = Number(ot.total) - pagado;
  const mensajeWhatsapp = mensajeSegunEstado(ot.estado, ot.numero, ot.cliente.nombre);

  return (
    <section>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-foreground">{ot.numero}</h1>
          <Link href={`/vehiculos/${ot.vehiculo.id}`} className="mt-1 block text-[14px] font-medium text-primario">
            {ot.vehiculo.patente} · {ot.vehiculo.marca} {ot.vehiculo.modelo}
          </Link>
          <Link href={`/clientes/${ot.cliente.id}`} className="text-[13.5px] text-mutado">
            {ot.cliente.nombre}
          </Link>
        </div>
        <span className="shrink-0 rounded-full bg-primario-suave px-2.5 py-1 text-[11px] font-semibold text-primario">
          {ETIQUETAS_ESTADO[ot.estado]}
        </span>
      </header>

      <div className="mb-5 space-y-2 rounded-2xl border border-borde bg-superficie p-4 text-[14.5px]">
        {ot.motivo && <FilaDato etiqueta="Motivo" valor={ot.motivo} />}
        {ot.kmIngreso !== null && <FilaDato etiqueta="Km al ingresar" valor={`${ot.kmIngreso} km`} />}
        {ot.nivelCombustible && (
          <FilaDato etiqueta="Combustible" valor={NIVELES_COMBUSTIBLE[ot.nivelCombustible]} />
        )}
        {ot.motivoCancelacion && (
          <FilaDato etiqueta="Motivo de cancelación" valor={ot.motivoCancelacion} />
        )}
      </div>

      {mensajeWhatsapp && (
        <a
          href={enlaceWhatsApp(ot.cliente.telefono, mensajeWhatsapp)}
          target="_blank"
          rel="noreferrer"
          className="mb-5 flex items-center justify-center gap-2 rounded-xl bg-exito-suave py-3 text-[14px] font-semibold text-exito"
        >
          {ot.estado === "FACTURADO" ? "Avisar: factura lista" : "Avisar: listo para retirar"}
        </a>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-[17px] font-semibold text-foreground">Acciones</h2>
        <PanelAccionesOT
          otId={ot.id}
          estado={ot.estado}
          cantidadItems={ot.items.length}
          presupuestoPendiente={presupuestoPendiente}
          solicitudFacturacion={ot.solicitudFacturacion}
        />
      </section>

      <section className="mb-8">
        <h2 className="mb-1 text-[17px] font-semibold text-foreground">Diagnóstico y trabajos</h2>
        <p className="mb-3 text-[12.5px] text-mutado">Cada falla encontrada con su solución y su precio.</p>
        {trabajos.length > 0 && (
          <div className="mb-3 space-y-2">
            {trabajos.map((item) => (
              <div key={item.id} className="rounded-2xl border border-borde bg-superficie p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    {item.falla && (
                      <p className="text-[13.5px] text-foreground">
                        <span className="font-semibold text-peligro">Falla: </span>
                        {item.falla}
                      </p>
                    )}
                    <p className="text-[13.5px] text-foreground">
                      <span className="font-semibold text-exito">Solución: </span>
                      {item.descripcion}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[14.5px] font-bold text-foreground">
                      ${Number(item.precioUnitario).toLocaleString("es-AR")}
                    </span>
                    {puedeEditarItems && <BotonQuitarItem itemId={item.id} otId={ot.id} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {puedeEditarItems && <FormularioTrabajoOT otId={ot.id} />}
        {!puedeEditarItems && trabajos.length === 0 && (
          <p className="text-[13px] text-mutado">Sin trabajos cargados.</p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-[17px] font-semibold text-foreground">Repuestos</h2>
        {repuestos.length > 0 && (
          <div className="mb-3 space-y-2">
            {repuestos.map((item) => (
              <div key={item.id} className="rounded-2xl border border-borde bg-superficie p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-foreground">{item.descripcion}</p>
                    <p className="text-[12px] text-mutado">
                      {Number(item.cantidad)} × ${Number(item.precioUnitario).toLocaleString("es-AR")}
                      {item.repuestoId ? " · del stock" : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[14.5px] font-bold text-foreground">
                      ${(Number(item.cantidad) * Number(item.precioUnitario)).toLocaleString("es-AR")}
                    </span>
                    {puedeEditarItems && <BotonQuitarItem itemId={item.id} otId={ot.id} />}
                  </div>
                </div>

                {(item.aPedir || item.notaPedido) && (
                  <div
                    className={`mt-2.5 rounded-xl px-3 py-2 ${
                      item.aPedir ? "bg-alerta-suave" : "bg-exito-suave"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[12px] font-bold uppercase ${item.aPedir ? "text-alerta" : "text-exito"}`}>
                        {item.aPedir ? "Hay que pedirlo" : "Ya pedido"}
                      </p>
                      {puedeEditarItems && (
                        <form action={alternarRepuestoAPedir.bind(null, item.id, ot.id)}>
                          <button type="submit" className="text-[12px] font-semibold text-primario">
                            {item.aPedir ? "Marcar como pedido" : "Volver a pedir"}
                          </button>
                        </form>
                      )}
                    </div>
                    {item.notaPedido && <p className="mt-0.5 text-[13px] text-foreground">{item.notaPedido}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {puedeEditarItems && <BotonAgregarRepuesto otId={ot.id} />}
        {!puedeEditarItems && repuestos.length === 0 && (
          <p className="text-[13px] text-mutado">Sin repuestos cargados.</p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-[17px] font-semibold text-foreground">Importes y pagos</h2>
        <div className="space-y-1.5 rounded-2xl border border-borde bg-superficie p-4 text-[14px]">
          <FilaDato etiqueta="Trabajos" valor={formatearPesos(ot.totalManoObra)} />
          <FilaDato etiqueta="Repuestos" valor={formatearPesos(ot.totalRepuestos)} />
          <div className="flex justify-between border-t border-borde pt-2 text-[15.5px] font-bold text-foreground">
            <span>Total</span>
            <span>{formatearPesos(ot.total)}</span>
          </div>
          <FilaDato etiqueta="Pagado" valor={formatearPesos(pagado)} />
          <div
            className={`flex justify-between rounded-lg px-2.5 py-2 text-[15px] font-bold ${
              saldoOT > 0 ? "bg-alerta-suave text-alerta" : "bg-exito-suave text-exito"
            }`}
          >
            <span>{saldoOT > 0 ? "Falta pagar" : saldoOT < 0 ? "Saldo a favor" : "Saldado"}</span>
            <span>{saldoOT === 0 ? "$0" : formatearPesos(Math.abs(saldoOT))}</span>
          </div>
        </div>

        {ot.cobros.length > 0 && (
          <div className="mt-3 space-y-2">
            {ot.cobros.map((cobro) => (
              <div
                key={cobro.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-borde bg-superficie px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium text-foreground">
                    <span
                      className={`mr-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        cobro.concepto === "SENA" ? "bg-primario-suave text-primario" : "bg-exito-suave text-exito"
                      }`}
                    >
                      {cobro.concepto === "SENA" ? "Seña" : "Pago"}
                    </span>
                    {cobro.metodo ?? "Sin especificar"}
                  </p>
                  <p className="text-[12px] text-mutado">
                    {new Intl.DateTimeFormat("es-AR", {
                      dateStyle: "medium",
                      timeZone: "America/Argentina/Buenos_Aires",
                    }).format(cobro.fecha)}
                    {cobro.notas ? ` · ${cobro.notas}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[14.5px] font-bold text-foreground">{formatearPesos(cobro.monto)}</span>
                  <form action={eliminarPagoOT.bind(null, cobro.id, ot.id)}>
                    <button type="submit" className="text-[15px] text-peligro" aria-label="Eliminar pago">
                      ×
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        {ot.estado !== "CANCELADA" && (
          <div className="mt-3">
            <FormularioPagoOT otId={ot.id} saldo={Math.max(saldoOT, 0)} />
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-[17px] font-semibold text-foreground">Fotos</h2>
        <GaleriaFotosOT
          otId={ot.id}
          fotos={ot.fotos.map((f) => ({ id: f.id, url: `/uploads/${f.path}` }))}
        />
      </section>

      <section>
        <h2 className="mb-3 text-[17px] font-semibold text-foreground">Timeline</h2>
        <ol className="space-y-0 border-l-2 border-borde pl-4">
          {ot.timeline.map((evento) => (
            <li key={evento.id} className="relative pb-5 last:pb-0">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primario" />
              <p className="text-[13.5px] font-semibold text-foreground">
                {ETIQUETAS_ESTADO[evento.estado]}
              </p>
              {evento.nota && <p className="text-[13px] text-mutado">{evento.nota}</p>}
              <p className="text-[11.5px] text-mutado">
                {new Intl.DateTimeFormat("es-AR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "America/Argentina/Buenos_Aires",
                }).format(evento.fecha)}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}

function formatearPesos(valor: number | { toString(): string }): string {
  return `$${Number(valor).toLocaleString("es-AR")}`;
}

function BotonQuitarItem({ itemId, otId }: { itemId: string; otId: string }) {
  return (
    <form action={eliminarItemOT.bind(null, itemId, otId)}>
      <button type="submit" className="text-[15px] text-peligro" aria-label="Quitar">
        ×
      </button>
    </form>
  );
}

function FilaDato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-mutado">{etiqueta}</span>
      <span className="text-right font-medium text-foreground">{valor}</span>
    </div>
  );
}

function mensajeSegunEstado(estado: string, numero: string, nombreCliente: string): string | null {
  const nombre = nombreCliente.split(" ")[0];
  if (estado === "TERMINADO") {
    return `Hola ${nombre}! Te escribimos del taller: tu ${numero} está lista, podés pasar a retirarla cuando quieras.`;
  }
  if (estado === "FACTURADO") {
    return `Hola ${nombre}! Tu factura de la ${numero} ya está lista. Te esperamos para la entrega.`;
  }
  return null;
}
