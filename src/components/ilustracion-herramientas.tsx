export function IlustracionHerramientas(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="100" cy="100" r="92" fill="var(--primario-suave)" />

      {/* caja de herramientas */}
      <rect x="52" y="108" width="96" height="56" rx="10" fill="var(--primario)" />
      <rect x="52" y="108" width="96" height="16" rx="8" fill="var(--primario-fuerte)" />
      <path d="M82 100c0-9 7-16 16-16h4c9 0 16 7 16 16v10H82v-10Z" stroke="var(--primario-fuerte)" strokeWidth="7" fill="none" />
      <rect x="90" y="128" width="20" height="10" rx="3" fill="var(--primario-suave)" />

      {/* tuerca */}
      <g transform="translate(128 52)">
        <circle cx="20" cy="20" r="22" fill="var(--exito)" />
        <circle cx="20" cy="20" r="9" fill="var(--primario-suave)" />
      </g>

      {/* destornillador */}
      <g transform="rotate(-35 48 60)">
        <rect x="44" y="30" width="8" height="46" rx="3" fill="var(--alerta)" />
        <rect x="42" y="20" width="12" height="16" rx="3" fill="var(--foreground)" />
      </g>
    </svg>
  );
}
