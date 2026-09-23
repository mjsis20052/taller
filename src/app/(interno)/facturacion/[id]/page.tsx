import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  cargarComprobante,
  enviarSolicitud,
  marcarErrorFacturacion,
} from "@/app/(interno)/facturacion/actions";

export const metadata: Metadata = { title: "Solicitud de facturación" };

export default async function PaginaDetalleSolicitud({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const solicitud = await prisma.solicitudFacturacion.findUnique({
    where: { id },
    include: { ot: { select: { id: true, numero: true, cliente: { select: { nombre: true } } } } },
  });

  if (!solicitud) notFound();

  const items = solicitud.items as unknown as {
    tipo: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
  }[];
  const clienteSnapshot = solicitud.clienteSnapshot as unknown as {
    nombre: string;
    cuit: string | null;
    dni: string | null;
    condicionFiscal: string;
    domicilio: string | null;
  };

  return (
    <section>
      <header className="mb-5">
        <h1 className="text-[24px] font-bold tracking-tight text-foreground">
          Facturar {solicitud.ot.numero}
        </h1>
        <p className="mt-1 text-[14px] text-mutado">{solicitud.ot.cliente.nombre}</p>
      </header>

      <div className="mb-4 space-y-2 rounded-2xl border border-borde bg-superficie p-4 text-[14px]">
        <p className="font-semibold text-foreground">Datos del cliente (al momento de generar)</p>
        <FilaDato etiqueta="CUIT/DNI" valor={clienteSnapshot.cuit ?? clienteSnapshot.dni ?? "—"} />
        <FilaDato etiqueta="Condición fiscal" valor={clienteSnapshot.condicionFiscal} />
        {clienteSnapshot.domicilio && <FilaDato etiqueta="Domicilio" valor={clienteSnapshot.domicilio} />}
      </div>

      <div className="mb-4 space-y-2 rounded-2xl border border-borde bg-superficie p-4">
        <p className="text-[14px] font-semibold text-foreground">Ítems (importes netos, sin impuestos)</p>
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-[13.5px]">
            <span className="text-mutado">
              {item.descripcion} × {item.cantidad}
            </span>
            <span className="font-medium text-foreground">
              ${(item.cantidad * item.precioUnitario).toLocaleString("es-AR")}
            </span>
          </div>
        ))}
        <div className="flex justify-between border-t border-borde pt-1.5 text-[15px] font-bold text-foreground">
          <span>Total</span>
          <span>${Number(solicitud.total).toLocaleString("es-AR")}</span>
        </div>
      </div>

      {solicitud.estado === "PENDIENTE" && (
        <form action={enviarSolicitud.bind(null, solicitud.id, solicitud.otId)}>
          <button type="submit" className="w-full rounded-xl bg-primario py-3.5 text-[15px] font-semibold text-white">
            Enviar a la cola del estudio
          </button>
        </form>
      )}

      {(solicitud.estado === "ENVIADA" || solicitud.estado === "ERROR") && (
        <div className="space-y-4">
          {solicitud.estado === "ERROR" && solicitud.errorDetalle && (
            <p className="rounded-xl bg-peligro-suave px-4 py-3 text-[13.5px] text-peligro">
              Error anterior: {solicitud.errorDetalle}
            </p>
          )}
          <form
            action={cargarComprobante.bind(null, solicitud.id, solicitud.otId)}
            className="space-y-3 rounded-2xl border border-borde bg-superficie p-4"
          >
            <p className="text-[14px] font-semibold text-foreground">
              Carga manual (cuando el estudio confirme la factura)
            </p>
            <Campo name="numeroComprobante" placeholder="N° de comprobante" required />
            <Campo name="cae" placeholder="CAE" required />
            <div>
              <label className="mb-1 block text-[12.5px] text-mutado" htmlFor="caeVencimiento">
                Vencimiento del CAE
              </label>
              <input
                id="caeVencimiento"
                name="caeVencimiento"
                type="date"
                className="w-full rounded-lg border border-borde bg-superficie px-3 py-2.5 text-[14px]"
              />
            </div>
            <Campo name="pdfUrl" placeholder="Link al PDF (opcional)" />
            <button type="submit" className="w-full rounded-xl bg-primario py-3 text-[14px] font-semibold text-white">
              Marcar facturada
            </button>
          </form>

          <form
            action={marcarErrorFacturacion.bind(null, solicitud.id, solicitud.otId)}
            className="space-y-2 rounded-2xl border border-peligro/30 bg-peligro-suave p-4"
          >
            <label className="block text-[12.5px] font-medium text-peligro">
              Marcar con error (ej: CUIT rechazado por AFIP)
            </label>
            <textarea
              name="errorDetalle"
              rows={2}
              className="w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-[13.5px]"
            />
            <button type="submit" className="w-full rounded-xl bg-peligro py-2.5 text-[13px] font-semibold text-white">
              Guardar error
            </button>
          </form>
        </div>
      )}

      {solicitud.estado === "FACTURADA" && (
        <div className="space-y-2 rounded-2xl border border-exito/30 bg-exito-suave p-4 text-[14px] text-exito">
          <p className="font-semibold">Facturada</p>
          <FilaDato etiqueta="Comprobante" valor={solicitud.numeroComprobante ?? "—"} />
          <FilaDato etiqueta="CAE" valor={solicitud.cae ?? "—"} />
        </div>
      )}
    </section>
  );
}

function Campo({
  name,
  placeholder,
  required,
}: {
  name: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <input
      name={name}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-lg border border-borde bg-superficie px-3 py-2.5 text-[14px]"
    />
  );
}

function FilaDato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3 text-[13.5px]">
      <span className="text-mutado">{etiqueta}</span>
      <span className="text-right font-medium">{valor}</span>
    </div>
  );
}
