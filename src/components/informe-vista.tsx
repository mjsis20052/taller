import type { InformeOT, ItemInforme } from "@/lib/informe";
import { pesos } from "@/lib/formato";
import { resumenPedidos } from "@/lib/pedidos";

const ZONA = "America/Argentina/Buenos_Aires";
const fechaCorta = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", timeZone: ZONA });
const fechaHora = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: ZONA,
});

export const MENSAJES_ESTADO: Record<string, { titulo: string; detalle: string }> = {
  INGRESADO: { titulo: "Recibimos tu vehículo", detalle: "Ya está en el taller. Pronto empezamos a revisarlo." },
  EN_DIAGNOSTICO: { titulo: "Lo estamos revisando", detalle: "Estamos buscando qué necesita para dejarlo perfecto." },
  PRESUPUESTADO: { titulo: "Te enviamos el presupuesto", detalle: "Mirá el detalle abajo y avisanos por WhatsApp si lo aprobás." },
  APROBADO: { titulo: "Presupuesto aprobado", detalle: "Ya está aprobado: lo ponemos en la cola de reparación." },
  EN_EJECUCION: { titulo: "En reparación", detalle: "Estamos trabajando en tu vehículo." },
  TERMINADO: { titulo: "¡Listo para retirar!", detalle: "Terminamos el trabajo. Podés pasar a buscarlo cuando quieras." },
  FACTURADO: { titulo: "Listo y facturado", detalle: "Terminado y facturado. Te esperamos para la entrega." },
  ENTREGADO: { titulo: "Entregado", detalle: "Gracias por confiar en nosotros." },
  CANCELADA: { titulo: "Cancelada", detalle: "Esta orden de trabajo fue cancelada." },
};

const PASOS = ["Ingreso", "Revisión", "Precio", "Arreglo", "Listo", "Entrega"];
const PASO_ACTUAL: Record<string, number> = {
  INGRESADO: 0,
  EN_DIAGNOSTICO: 1,
  PRESUPUESTADO: 2,
  APROBADO: 2,
  EN_EJECUCION: 3,
  TERMINADO: 4,
  FACTURADO: 4,
  ENTREGADO: 5,
};

const ETIQUETA_NOVEDAD: Record<string, string> = {
  INGRESADO: "Ingresó al taller",
  EN_DIAGNOSTICO: "En revisión",
  PRESUPUESTADO: "Presupuesto enviado",
  APROBADO: "Presupuesto aprobado",
  EN_EJECUCION: "En reparación",
  TERMINADO: "Trabajo terminado",
  FACTURADO: "Facturado",
  ENTREGADO: "Entregado",
  CANCELADA: "Cancelada",
};

function ChipRepuesto({ estado }: { estado: string }) {
  if (estado === "NO") return null;
  const datos: Record<string, { texto: string; clase: string }> = {
    A_PEDIR: { texto: "Por pedir", clase: "bg-alerta-suave text-alerta" },
    PEDIDO: { texto: "Pedido, en camino", clase: "bg-primario-suave text-primario" },
    RECIBIDO: { texto: "Recepcionado ✓", clase: "bg-exito-suave text-exito" },
  };
  const d = datos[estado];
  return d ? <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ${d.clase}`}>{d.texto}</span> : null;
}

function FilaItem({ item }: { item: ItemInforme }) {
  return (
    <li className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0">
        {item.tipo === "MANO_OBRA" ? (
          <>
            {item.falla && (
              <p className="text-[13.5px] text-foreground">
                <span className="font-bold text-peligro">Encontramos: </span>
                {item.falla}
              </p>
            )}
            <p className="text-[14px] text-foreground">
              <span className="font-bold text-exito">Hicimos: </span>
              {item.descripcion}
            </p>
          </>
        ) : (
          <>
            <p className="text-[14px] font-medium text-foreground">{item.descripcion}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[12.5px] text-mutado">
              {item.cantidad} × {pesos(item.precioUnitario)}
              <ChipRepuesto estado={item.estadoPedido} />
            </p>
          </>
        )}
      </div>
      <span className="shrink-0 text-[14.5px] font-extrabold text-foreground">{pesos(item.subtotal)}</span>
    </li>
  );
}

export function TarjetaImportes({ total, pagado, saldo }: { total: number; pagado: number; saldo: number }) {
  return (
    <div className="rounded-3xl border border-borde bg-superficie p-5">
      <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Importes</h2>
      <dl className="mt-3 space-y-2 text-[14.5px]">
        <div className="flex justify-between">
          <dt className="text-mutado">Total</dt>
          <dd className="font-bold text-foreground">{pesos(total)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-mutado">Pagado</dt>
          <dd className="font-bold text-foreground">{pesos(pagado)}</dd>
        </div>
        <div
          className={`flex justify-between rounded-xl px-3 py-2.5 text-[15.5px] font-extrabold ${
            saldo > 0 ? "bg-alerta-suave text-alerta" : "bg-exito-suave text-exito"
          }`}
        >
          <dt>{saldo > 0 ? "Falta pagar" : saldo < 0 ? "Saldo a tu favor" : "Todo pago"}</dt>
          <dd>{saldo === 0 ? "✓" : pesos(Math.abs(saldo))}</dd>
        </div>
      </dl>
    </div>
  );
}

export function Progreso({ estado }: { estado: string }) {
  const actual = PASO_ACTUAL[estado];
  if (actual === undefined) return null;
  return (
    <ol className="grid grid-cols-6 gap-1" aria-label="Avance de la reparación">
      {PASOS.map((paso, i) => {
        const hecho = i <= actual;
        return (
          <li key={paso} className="flex flex-col items-center gap-1.5 text-center">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-extrabold ${
                hecho ? "bg-primario text-white" : "border border-borde bg-superficie text-mutado"
              } ${i === actual ? "ring-4 ring-primario/25" : ""}`}
            >
              {hecho && i < actual ? "✓" : i + 1}
            </span>
            <span className={`text-[10.5px] font-semibold leading-tight ${hecho ? "text-foreground" : "text-mutado"}`}>
              {paso}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// Informe completo de una OT, pensado para que lo lea el cliente.
export function InformeOTVista({ informe }: { informe: InformeOT }) {
  const mensaje = MENSAJES_ESTADO[informe.estado] ?? { titulo: informe.estado, detalle: "" };
  const pedidos = resumenPedidos([...informe.trabajos, ...informe.repuestos]);
  const porLlegar = informe.repuestos.filter((r) => r.estadoPedido === "A_PEDIR" || r.estadoPedido === "PEDIDO").length;
  const nombre = informe.cliente.split(" ")[0];

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#4338ca] via-[#6366f1] to-[#818cf8] p-6 text-white shadow-xl">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
        <p className="text-[12.5px] font-semibold uppercase tracking-widest text-white/80">
          Informe de reparación · {informe.numero}
        </p>
        <h1 className="mt-2 text-[27px] font-extrabold leading-tight tracking-tight">
          {informe.vehiculo.marca} {informe.vehiculo.modelo}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-white/20 px-2.5 py-1 text-[13.5px] font-bold tracking-wider">
            {informe.vehiculo.patente}
          </span>
          <span className="text-[13.5px] text-white/85">Hola {nombre} 👋</span>
        </div>
        <p className="mt-4 text-[12.5px] text-white/75">Ingresó el {fechaCorta.format(informe.fecha)}</p>
      </section>

      <section className="rounded-3xl border border-borde bg-superficie p-5">
        <h2 className="text-[19px] font-extrabold tracking-tight text-foreground">{mensaje.titulo}</h2>
        <p className="mt-1 text-[14px] text-mutado">{mensaje.detalle}</p>
        {informe.estado === "CANCELADA" && informe.motivoCancelacion && (
          <p className="mt-2 text-[13.5px] text-foreground">{informe.motivoCancelacion}</p>
        )}
        {informe.estado !== "CANCELADA" && (
          <div className="mt-5">
            <Progreso estado={informe.estado} />
          </div>
        )}
      </section>

      {pedidos === "ESPERANDO" && (
        <section className="rounded-3xl border border-alerta/30 bg-alerta-suave p-5">
          <h2 className="text-[15px] font-extrabold text-alerta">Esperando repuesto</h2>
          <p className="mt-0.5 text-[13.5px] text-mutado">
            Estamos esperando {porLlegar} repuesto{porLlegar === 1 ? "" : "s"}. Apenas llegue seguimos con tu vehículo.
          </p>
        </section>
      )}
      {pedidos === "RECIBIDOS" && informe.estado !== "ENTREGADO" && (
        <section className="rounded-3xl border border-exito/30 bg-exito-suave p-5">
          <h2 className="text-[15px] font-extrabold text-exito">Repuestos recepcionados ✓</h2>
          <p className="mt-0.5 text-[13.5px] text-mutado">Ya llegaron los repuestos: seguimos con el trabajo.</p>
        </section>
      )}

      {informe.trabajos.length > 0 && (
        <section className="rounded-3xl border border-borde bg-superficie p-5">
          <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Qué encontramos y qué hicimos</h2>
          <ul className="mt-1 divide-y divide-borde">
            {informe.trabajos.map((item) => (
              <FilaItem key={item.id} item={item} />
            ))}
          </ul>
        </section>
      )}

      {informe.repuestos.length > 0 && (
        <section className="rounded-3xl border border-borde bg-superficie p-5">
          <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Repuestos</h2>
          <ul className="mt-1 divide-y divide-borde">
            {informe.repuestos.map((item) => (
              <FilaItem key={item.id} item={item} />
            ))}
          </ul>
        </section>
      )}

      {informe.estado !== "CANCELADA" && <TarjetaImportes total={informe.total} pagado={informe.pagado} saldo={informe.saldo} />}

      <section className="rounded-3xl border border-borde bg-superficie p-5">
        <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Novedades</h2>
        <ol className="mt-4 space-y-0 border-l-2 border-borde pl-4">
          {informe.novedades.map((n) => (
            <li key={n.id} className="relative pb-5 last:pb-0">
              <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primario ring-4 ring-superficie" />
              <p className="text-[14px] font-bold text-foreground">{n.nota ?? ETIQUETA_NOVEDAD[n.estado] ?? n.estado}</p>
              {n.nota && <p className="text-[12.5px] font-medium text-primario">{ETIQUETA_NOVEDAD[n.estado] ?? ""}</p>}
              <p className="text-[12px] text-mutado">{fechaHora.format(n.fecha)}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
