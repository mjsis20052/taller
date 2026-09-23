"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { agregarRepuestoOT } from "@/app/(interno)/ots/actions";
import { listarRepuestosActivos } from "@/app/(interno)/stock/actions";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[14.5px] text-foreground outline-none focus:border-primario";
const estiloLabel = "mb-1 block text-[12.5px] font-medium text-mutado";

type Repuesto = { id: string; descripcion: string; precioVenta: number; stock: number };

export function BotonAgregarRepuesto({ otId }: { otId: string }) {
  const [abierto, setAbierto] = useState(false);
  const [modo, setModo] = useState<"stock" | "nuevo">("stock");
  const [repuestos, setRepuestos] = useState<Repuesto[] | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [elegido, setElegido] = useState<Repuesto | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [aPedir, setAPedir] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function alAbrir(valor: boolean) {
    setAbierto(valor);
    if (valor && repuestos === null) {
      listarRepuestosActivos().then(setRepuestos);
    }
  }

  function reiniciar() {
    setModo("stock");
    setBusqueda("");
    setElegido(null);
    setDescripcion("");
    setPrecio("");
    setAPedir(false);
  }

  const texto = busqueda.trim().toLowerCase();
  const filtrados = (repuestos ?? []).filter((r) => !texto || r.descripcion.toLowerCase().includes(texto));
  const listoParaCargar = modo === "stock" ? elegido !== null : descripcion.trim() !== "";

  return (
    <Drawer.Root open={abierto} onOpenChange={alAbrir}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="w-full rounded-xl border border-dashed border-primario/50 bg-primario-suave py-3 text-[14px] font-semibold text-primario"
        >
          + Agregar repuesto
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92vh] max-w-lg flex-col rounded-t-3xl border border-borde bg-superficie outline-none">
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-borde" />
          <div className="overflow-y-auto p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
            <Drawer.Title className="text-[19px] font-bold tracking-tight text-foreground">
              Agregar repuesto
            </Drawer.Title>
            <Drawer.Description className="mt-1 text-[13.5px] text-mutado">
              Elegilo de tu lista de repuestos o cargá uno nuevo con su precio.
            </Drawer.Description>

            <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-borde bg-background p-1">
              {(["stock", "nuevo"] as const).map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  onClick={() => {
                    setModo(opcion);
                    setElegido(null);
                    setDescripcion("");
                    setPrecio("");
                  }}
                  className={`rounded-lg py-2 text-[13.5px] font-semibold ${
                    modo === opcion ? "bg-superficie text-primario shadow-sm" : "text-mutado"
                  }`}
                >
                  {opcion === "stock" ? "De mi lista" : "Uno nuevo"}
                </button>
              ))}
            </div>

            <form
              action={async (formData: FormData) => {
                setEnviando(true);
                await agregarRepuestoOT(otId, formData);
                setEnviando(false);
                reiniciar();
                setAbierto(false);
              }}
              className="mt-4 space-y-3"
            >
              {modo === "stock" && (
                <div>
                  <input
                    type="search"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar repuesto…"
                    className={estiloInput}
                  />
                  <div className="mt-2 max-h-52 space-y-1.5 overflow-y-auto">
                    {repuestos === null && <p className="py-3 text-center text-[13px] text-mutado">Cargando…</p>}
                    {repuestos !== null && filtrados.length === 0 && (
                      <p className="py-3 text-center text-[13px] text-mutado">
                        No hay repuestos con ese nombre. Usá la pestaña &quot;Uno nuevo&quot;.
                      </p>
                    )}
                    {filtrados.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setElegido(r);
                          setDescripcion(r.descripcion);
                          setPrecio(String(r.precioVenta));
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left ${
                          elegido?.id === r.id ? "border-primario bg-primario-suave" : "border-borde bg-superficie"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[14px] font-medium text-foreground">{r.descripcion}</span>
                          <span className="text-[12px] text-mutado">{r.stock} en stock</span>
                        </span>
                        <span className="shrink-0 text-[13.5px] font-semibold text-foreground">
                          ${r.precioVenta.toLocaleString("es-AR")}
                        </span>
                      </button>
                    ))}
                  </div>
                  {elegido && <input type="hidden" name="repuestoId" value={elegido.id} />}
                </div>
              )}

              {modo === "nuevo" && (
                <div>
                  <label className={estiloLabel} htmlFor="rep-descripcion">
                    Repuesto
                  </label>
                  <input
                    id="rep-descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Ej: Pastillas de freno delanteras"
                    className={estiloInput}
                  />
                </div>
              )}
              <input type="hidden" name="descripcion" value={descripcion} />

              {listoParaCargar && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={estiloLabel} htmlFor="rep-cantidad">
                        Cantidad
                      </label>
                      <input
                        id="rep-cantidad"
                        name="cantidad"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        step={1}
                        defaultValue={1}
                        required
                        className={estiloInput}
                      />
                    </div>
                    <div>
                      <label className={estiloLabel} htmlFor="rep-precio">
                        Precio c/u ($)
                      </label>
                      <input
                        id="rep-precio"
                        name="precioUnitario"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        required
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        className={estiloInput}
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[14px] text-foreground">
                    <input
                      type="checkbox"
                      name="aPedir"
                      checked={aPedir}
                      onChange={(e) => setAPedir(e.target.checked)}
                      className="h-4 w-4"
                    />
                    Hay que pedirlo al proveedor
                  </label>

                  {aPedir && (
                    <div>
                      <label className={estiloLabel} htmlFor="rep-nota">
                        Nota: cómo hay que pedirlo
                      </label>
                      <textarea
                        id="rep-nota"
                        name="notaPedido"
                        rows={2}
                        placeholder="Ej: pedir a Repuestos Sur, código 4521, llega en 48 hs"
                        className={estiloInput}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full rounded-xl bg-primario py-3.5 text-[15px] font-semibold text-white disabled:opacity-60"
                  >
                    {enviando ? "Agregando…" : "Agregar a la OT"}
                  </button>
                </>
              )}
            </form>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
