import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EstadoVacio } from "@/components/estado-vacio";
import { GaleriaFotosVehiculo } from "@/components/galeria-fotos-vehiculo";
import {
  cambiarActivoVehiculo,
  registrarKilometraje,
} from "@/app/(interno)/vehiculos/actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const vehiculo = await prisma.vehiculo.findUnique({
    where: { id },
    select: { patente: true },
  });
  return { title: vehiculo?.patente ?? "Vehículo" };
}

export default async function PaginaDetalleVehiculo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehiculo = await prisma.vehiculo.findUnique({
    where: { id },
    include: {
      cliente: { select: { id: true, nombre: true } },
      kilometrajes: { orderBy: { fecha: "desc" }, take: 15 },
      fotos: { orderBy: { fechaTomada: "desc" } },
      ordenesTrabajo: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!vehiculo) notFound();

  const ultimoKm = vehiculo.kilometrajes[0]?.km;

  return (
    <section>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-foreground">
            {vehiculo.patente}
          </h1>
          <p className="mt-1 text-[14px] text-mutado">
            {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio ? `· ${vehiculo.anio}` : ""}
          </p>
          <Link
            href={`/clientes/${vehiculo.cliente.id}`}
            className="mt-1 inline-block text-[13.5px] font-medium text-primario"
          >
            {vehiculo.cliente.nombre} ›
          </Link>
        </div>
        {!vehiculo.activo && (
          <span className="shrink-0 rounded-full bg-alerta-suave px-2.5 py-1 text-[11px] font-semibold text-alerta">
            Inactivo
          </span>
        )}
      </header>

      <div className="space-y-2 rounded-2xl border border-borde bg-superficie p-4 text-[14.5px]">
        {vehiculo.color && <FilaDato etiqueta="Color" valor={vehiculo.color} />}
        {vehiculo.vin && <FilaDato etiqueta="VIN" valor={vehiculo.vin} />}
        <FilaDato etiqueta="Último kilometraje" valor={ultimoKm ? `${ultimoKm} km` : "Sin registros"} />
      </div>

      <div className="mt-3 flex gap-2">
        <Link
          href={`/vehiculos/${vehiculo.id}/editar`}
          className="flex-1 rounded-xl border border-borde bg-superficie py-3 text-center text-[14px] font-semibold text-foreground"
        >
          Editar
        </Link>
        <form
          action={cambiarActivoVehiculo.bind(null, vehiculo.id, !vehiculo.activo)}
          className="flex-1"
        >
          <button
            type="submit"
            className="w-full rounded-xl border border-borde bg-superficie py-3 text-[14px] font-semibold text-peligro"
          >
            {vehiculo.activo ? "Dar de baja" : "Reactivar"}
          </button>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-[17px] font-semibold text-foreground">Kilometraje</h2>
        <form
          action={registrarKilometraje.bind(null, vehiculo.id)}
          className="mb-3 flex gap-2"
        >
          <input
            name="km"
            type="number"
            min={0}
            required
            placeholder="Nuevo kilometraje"
            className="w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] outline-none focus:border-primario"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-primario px-5 text-[14px] font-semibold text-white"
          >
            Registrar
          </button>
        </form>
        {vehiculo.kilometrajes.length > 0 && (
          <div className="space-y-2">
            {vehiculo.kilometrajes.map((registro) => (
              <div
                key={registro.id}
                className="flex items-center justify-between rounded-xl border border-borde bg-superficie px-4 py-2.5 text-[13.5px]"
              >
                <span className="font-semibold text-foreground">{registro.km} km</span>
                <span className="text-mutado">
                  {new Intl.DateTimeFormat("es-AR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "America/Argentina/Buenos_Aires",
                  }).format(registro.fecha)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-[17px] font-semibold text-foreground">Fotos</h2>
        <GaleriaFotosVehiculo
          vehiculoId={vehiculo.id}
          fotos={vehiculo.fotos.map((f) => ({ id: f.id, url: `/uploads/${f.path}` }))}
        />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-[17px] font-semibold text-foreground">
          Órdenes de trabajo
        </h2>
        {vehiculo.ordenesTrabajo.length === 0 ? (
          <EstadoVacio
            titulo="Sin OTs"
            descripcion="Todavía no se cargó ninguna orden de trabajo para este vehículo."
            icono={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {vehiculo.ordenesTrabajo.map((ot) => (
              <Link
                key={ot.id}
                href={`/ots/${ot.id}`}
                className="block rounded-2xl border border-borde bg-superficie px-4 py-3.5"
              >
                <p className="text-[15px] font-semibold text-foreground">{ot.numero}</p>
                <p className="text-[13px] text-mutado">{ot.estado}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </section>
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
