import Link from "next/link";

const ETIQUETAS_CONDICION_FISCAL: Record<string, string> = {
  CONSUMIDOR_FINAL: "Consumidor final",
  RESPONSABLE_INSCRIPTO: "Resp. inscripto",
  MONOTRIBUTISTA: "Monotributista",
  EXENTO: "Exento",
};

export function TarjetaCliente({
  cliente,
}: {
  cliente: {
    id: string;
    nombre: string;
    telefono: string;
    condicionFiscal: string;
    activo: boolean;
  };
}) {
  return (
    <Link
      href={`/clientes/${cliente.id}`}
      className="flex items-center justify-between gap-3 rounded-2xl border border-borde bg-superficie px-4 py-3.5 active:bg-black/[0.03]"
    >
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-foreground">
          {cliente.nombre}
        </p>
        <p className="mt-0.5 text-[13px] text-mutado">
          {cliente.telefono} · {ETIQUETAS_CONDICION_FISCAL[cliente.condicionFiscal]}
        </p>
      </div>
      {!cliente.activo && (
        <span className="shrink-0 rounded-full bg-alerta-suave px-2.5 py-1 text-[11px] font-semibold text-alerta">
          Inactivo
        </span>
      )}
    </Link>
  );
}
