"use client";

import { useEffect, useRef, useState } from "react";
import { agregarItemOT } from "@/app/ots/actions";
import { listarRepuestosActivos } from "@/app/stock/actions";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3 py-2.5 text-[14px] text-foreground outline-none focus:border-primario";

type Repuesto = { id: string; descripcion: string; precioVenta: number; stock: number };

export function FormularioItemOT({ otId }: { otId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [tipo, setTipo] = useState<"MANO_OBRA" | "REPUESTO">("MANO_OBRA");
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [repuestoId, setRepuestoId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");

  useEffect(() => {
    if (tipo === "REPUESTO" && repuestos.length === 0) {
      listarRepuestosActivos().then(setRepuestos);
    }
  }, [tipo, repuestos.length]);

  const repuestoSeleccionado = repuestos.find((r) => r.id === repuestoId);

  return (
    <form
      ref={formRef}
      action={async (formData: FormData) => {
        await agregarItemOT(otId, formData);
        formRef.current?.reset();
        setRepuestoId("");
        setDescripcion("");
        setPrecioUnitario("");
      }}
      className="space-y-2 rounded-xl border border-dashed border-borde bg-superficie p-3"
    >
      <div className="grid grid-cols-2 gap-2">
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value as "MANO_OBRA" | "REPUESTO");
            setRepuestoId("");
          }}
          className={estiloInput}
        >
          <option value="MANO_OBRA">Mano de obra</option>
          <option value="REPUESTO">Repuesto</option>
        </select>
        <input
          name="cantidad"
          type="number"
          min={1}
          step={1}
          defaultValue={1}
          required
          placeholder="Cant."
          className={estiloInput}
        />
      </div>

      {tipo === "REPUESTO" && repuestos.length > 0 && (
        <select
          value={repuestoId}
          onChange={(e) => {
            const r = repuestos.find((x) => x.id === e.target.value);
            setRepuestoId(e.target.value);
            if (r) {
              setDescripcion(r.descripcion);
              setPrecioUnitario(String(r.precioVenta));
            }
          }}
          className={estiloInput}
        >
          <option value="">Repuesto libre (sin descontar stock)…</option>
          {repuestos.map((r) => (
            <option key={r.id} value={r.id}>
              {r.descripcion} ({r.stock} en stock)
            </option>
          ))}
        </select>
      )}

      {repuestoSeleccionado && (
        <input type="hidden" name="repuestoId" value={repuestoSeleccionado.id} />
      )}

      <input
        name="descripcion"
        required
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Descripción"
        className={estiloInput}
      />
      <input
        name="precioUnitario"
        type="number"
        min={0}
        step="0.01"
        required
        value={precioUnitario}
        onChange={(e) => setPrecioUnitario(e.target.value)}
        placeholder="Precio unitario ($)"
        className={estiloInput}
      />
      <button
        type="submit"
        className="w-full rounded-xl bg-primario py-2.5 text-[13.5px] font-semibold text-white"
      >
        Agregar ítem
      </button>
    </form>
  );
}
