import Link from "next/link";
import { EstadoVacio } from "@/components/estado-vacio";

type Vehiculo = {
  id: string;
  patente: string;
  marca: string;
  modelo: string;
};

export function SeccionVehiculosCliente({
  clienteId,
  vehiculos,
}: {
  clienteId: string;
  vehiculos: Vehiculo[];
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-foreground">Vehículos</h2>
        <Link
          href={`/vehiculos/nuevo?clienteId=${clienteId}`}
          className="text-[13.5px] font-semibold text-primario"
        >
          + Agregar
        </Link>
      </div>
      {vehiculos.length === 0 ? (
        <EstadoVacio
          titulo="Sin vehículos"
          descripcion="Cargá un vehículo nuevo o asigná uno que ya esté en el sistema."
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M5 17h14l1.5-5.5a2 2 0 0 0-1.9-2.5H6.4a2 2 0 0 0-1.9 1.4L3 17" />
              <circle cx="7.5" cy="17.5" r="1.5" />
              <circle cx="16.5" cy="17.5" r="1.5" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {vehiculos.map((vehiculo) => (
            <Link
              key={vehiculo.id}
              href={`/vehiculos/${vehiculo.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-borde bg-superficie px-4 py-3.5 active:bg-black/[0.03]"
            >
              <div>
                <p className="text-[15px] font-semibold text-foreground">{vehiculo.patente}</p>
                <p className="text-[13px] text-mutado">
                  {vehiculo.marca} {vehiculo.modelo}
                </p>
              </div>
              <span className="text-mutado">›</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
