const SERVICIOS = [
  "Service completo",
  "Cambio de aceite",
  "Frenos",
  "Alineación y balanceo",
  "Diagnóstico",
  "Batería y electricidad",
  "Suspensión",
  "Neumáticos",
];

export function CintaServicios() {
  const items = [...SERVICIOS, ...SERVICIOS];
  return (
    <div
      aria-hidden
      className="-mx-5 overflow-hidden border-y border-borde bg-superficie py-3.5"
    >
      <div className="cinta-marquee flex w-max gap-8">
        {items.map((servicio, i) => (
          <span key={i} className="flex items-center gap-8 text-[14px] font-semibold text-foreground">
            {servicio}
            <span className="h-1.5 w-1.5 rounded-full bg-primario" />
          </span>
        ))}
      </div>
    </div>
  );
}
