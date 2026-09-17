"use client";

import { useActionState, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  obtenerHorariosDisponiblesPublico,
  solicitarTurnoPublico,
} from "@/app/(publico)/portal/actions";

const estiloInput =
  "w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-[15px] text-foreground outline-none focus:border-primario";
const estiloLabel = "block text-[13px] font-medium text-mutado mb-1.5";
const estiloError = "mt-1 text-[12.5px] text-peligro";

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function FormularioTurnoPublico() {
  const [estado, ejecutarAccion, enviando] = useActionState(solicitarTurnoPublico, {});
  const [fecha, setFecha] = useState(hoyISO());
  const [horarios, setHorarios] = useState<string[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(true);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      setCargandoHorarios(true);
      const lista = await obtenerHorariosDisponiblesPublico(fecha);
      if (cancelado) return;
      setHorarios(lista);
      setCargandoHorarios(false);
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, [fecha]);

  if (estado.ok) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="rounded-3xl border border-exito/25 bg-exito-suave p-8 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-exito text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-4 text-[19px] font-bold text-foreground">¡Listo, pedido enviado!</h2>
        <p className="mx-auto mt-2 max-w-[36ch] text-[14px] text-mutado">
          Ya lo tenemos anotado. Te vamos a confirmar por WhatsApp a la brevedad.
        </p>
      </motion.div>
    );
  }

  return (
    <form action={ejecutarAccion} className="space-y-5">
      <div>
        <label className={estiloLabel} htmlFor="nombre">
          Tu nombre
        </label>
        <input id="nombre" name="nombre" required autoFocus className={estiloInput} placeholder="Juan Pérez" />
        {estado.nombre && <p className={estiloError}>{estado.nombre}</p>}
      </div>

      <div>
        <label className={estiloLabel} htmlFor="telefono">
          Teléfono (WhatsApp)
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          required
          className={estiloInput}
          placeholder="Ej: 2214567890"
        />
        {estado.telefono && <p className={estiloError}>{estado.telefono}</p>}
      </div>

      <div>
        <label className={estiloLabel} htmlFor="patente">
          Patente del vehículo
        </label>
        <input
          id="patente"
          name="patente"
          required
          maxLength={8}
          className={`${estiloInput} uppercase`}
          placeholder="AB123CD"
        />
        {estado.patente && <p className={estiloError}>{estado.patente}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={estiloLabel} htmlFor="marca">
            Marca
          </label>
          <input id="marca" name="marca" className={estiloInput} placeholder="Ford" />
          {estado.marca && estado.marca.trim() && <p className={estiloError}>{estado.marca}</p>}
        </div>
        <div>
          <label className={estiloLabel} htmlFor="modelo">
            Modelo
          </label>
          <input id="modelo" name="modelo" className={estiloInput} placeholder="Fiesta" />
        </div>
      </div>
      <p className="-mt-3 text-[12px] text-mutado">
        Marca y modelo solo hacen falta si es la primera vez que venís.
      </p>

      <div>
        <label className={estiloLabel} htmlFor="motivo">
          ¿Qué necesita el vehículo?
        </label>
        <textarea
          id="motivo"
          name="motivo"
          required
          rows={3}
          className={estiloInput}
          placeholder="Ej: cambio de aceite, ruido raro al frenar…"
        />
        {estado.motivo && <p className={estiloError}>{estado.motivo}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={estiloLabel} htmlFor="fecha">
            Fecha preferida
          </label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            required
            min={hoyISO()}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className={estiloInput}
          />
          {estado.fecha && <p className={estiloError}>{estado.fecha}</p>}
        </div>
        <div>
          <label className={estiloLabel} htmlFor="hora">
            Horario disponible
          </label>
          <select id="hora" name="hora" required disabled={cargandoHorarios} className={estiloInput}>
            {cargandoHorarios ? (
              <option value="">Buscando horarios…</option>
            ) : horarios.length === 0 ? (
              <option value="">Sin horarios ese día</option>
            ) : (
              <>
                <option value="">Elegí un horario…</option>
                {horarios.map((h) => (
                  <option key={h} value={h}>
                    {h} hs
                  </option>
                ))}
              </>
            )}
          </select>
          {estado.hora && <p className={estiloError}>{estado.hora}</p>}
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={enviando || cargandoHorarios || horarios.length === 0}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-xl bg-primario py-4 text-[15px] font-semibold text-white disabled:opacity-60"
      >
        {enviando ? "Enviando…" : "Confirmar pedido de turno"}
      </motion.button>
      <p className="text-center text-[12.5px] text-mutado">
        Este es un pedido, no un turno confirmado — te avisamos por WhatsApp para cerrarlo.
      </p>
    </form>
  );
}
