"use client";

import { motion } from "framer-motion";

function IconoReloj(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function IconoLupa(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconoWhatsapp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.8c2.19 0 4.25.85 5.8 2.4a8.13 8.13 0 0 1 2.4 5.8c0 4.52-3.68 8.2-8.2 8.2a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.35c0-4.52 3.68-8.19 8.2-8.19m-4.52 4.7c-.15 0-.4.06-.61.3-.21.24-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.11.15 1.6 2.45 3.9 3.4.55.24.98.38 1.31.48.55.18 1.05.15 1.44.09.44-.07 1.36-.55 1.55-1.09.19-.53.19-.98.13-1.08-.06-.09-.21-.15-.44-.27-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.11-.52.11-.15.23-.6.75-.73.9-.13.15-.27.17-.5.06-.23-.11-.96-.35-1.83-1.13-.68-.6-1.13-1.35-1.27-1.57-.13-.23-.01-.35.1-.46.11-.11.23-.27.35-.4.11-.13.15-.23.23-.38.08-.15.04-.29-.02-.4-.06-.11-.52-1.26-.72-1.72-.19-.45-.38-.39-.52-.4z" />
    </svg>
  );
}

const ITEMS = [
  {
    Icono: IconoReloj,
    titulo: "Sin esperas ni llamados",
    descripcion: "Pedís el turno online en menos de un minuto, cuando quieras.",
  },
  {
    Icono: IconoLupa,
    titulo: "Seguimiento en vivo",
    descripcion: "Consultá por patente en qué etapa está tu reparación.",
  },
  {
    Icono: IconoWhatsapp,
    titulo: "Confirmación por WhatsApp",
    descripcion: "Te avisamos ahí mismo cuando confirmamos tu turno.",
  },
];

export function FeaturesPublico() {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {ITEMS.map((item, i) => (
        <motion.div
          key={item.titulo}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
          className="rounded-2xl border border-borde bg-superficie p-5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primario-suave text-primario">
            <item.Icono className="h-5 w-5" />
          </div>
          <p className="mt-3 text-[14.5px] font-semibold text-foreground">{item.titulo}</p>
          <p className="mt-1 text-[13px] text-mutado">{item.descripcion}</p>
        </motion.div>
      ))}
    </section>
  );
}
