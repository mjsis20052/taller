import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/encabezado-pagina";
import { EstadoVacio } from "@/components/estado-vacio";
import { listarDeudores } from "@/lib/cuenta-corriente";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { registrarCobro } from "@/app/(interno)/cobranzas/actions";

export const metadata: Metadata = { title: "Cobranzas" };

export default async function PaginaCobranzas() {
  const deudores = await listarDeudores();
  const totalAdeudado = deudores.reduce((acc, d) => acc + d.deuda, 0);

  return (
    <section>
      <EncabezadoPagina titulo="Cobranzas" descripcion="Cuenta corriente y deudores." />

      <div className="mb-4 rounded-2xl border border-borde bg-superficie p-4">
        <p className="text-[12px] text-mutado">Total adeudado</p>
        <p className="text-[22px] font-bold text-foreground">
          ${totalAdeudado.toLocaleString("es-AR")}
        </p>
      </div>

      {deudores.length === 0 ? (
        <EstadoVacio
          titulo="Sin deudores"
          descripcion="Cuando una OT entregada tenga saldo pendiente, el cliente aparece acá."
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {deudores.map((d) => {
            const texto = `Hola ${d.nombre.split(" ")[0]}! Te escribimos del taller por un saldo pendiente de $${d.deuda.toLocaleString("es-AR")}. Cualquier duda, escribinos.`;
            return (
              <div key={d.id} className="rounded-2xl border border-borde bg-superficie p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[15px] font-semibold text-foreground">{d.nombre}</p>
                  <span className="rounded-full bg-alerta-suave px-2.5 py-1 text-[12px] font-semibold text-alerta">
                    ${d.deuda.toLocaleString("es-AR")}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <a
                    href={enlaceWhatsApp(d.telefono, texto)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-lg bg-exito-suave py-2 text-center text-[12.5px] font-semibold text-exito"
                  >
                    Recordar por WhatsApp
                  </a>
                </div>
                <form action={registrarCobro.bind(null, d.id, null)} className="mt-2 flex gap-2">
                  <input
                    name="monto"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    placeholder="Monto a cobrar"
                    className="w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-[13.5px]"
                  />
                  <button type="submit" className="shrink-0 rounded-lg bg-primario px-4 text-[12.5px] font-semibold text-white">
                    Cobrar
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
