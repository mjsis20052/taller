export function IlustracionAuto(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="200" cy="225" rx="150" ry="14" fill="var(--borde)" opacity="0.6" />

      {/* carrocería */}
      <path
        d="M55 175c-8 0-14-6-14-14v-24c0-7 4-13 10-16l28-14 20-32c4-6 11-10 18-10h130c8 0 15 4 19 11l19 33 26 8c9 3 15 11 15 21v23c0 8-6 14-14 14H55Z"
        fill="var(--primario)"
      />
      <path
        d="M55 175c-8 0-14-6-14-14v-24c0-7 4-13 10-16l28-14 20-32c4-6 11-10 18-10h130c8 0 15 4 19 11l19 33 26 8c9 3 15 11 15 21v23c0 8-6 14-14 14H55Z"
        fill="url(#brillo)"
        opacity="0.35"
      />

      {/* ventanas */}
      <path
        d="M120 121l14-27c3-5 8-8 14-8h48v35h-76Z"
        fill="var(--superficie)"
        opacity="0.9"
      />
      <path d="M208 86h37c5 0 10 3 13 7l14 28h-64V86Z" fill="var(--superficie)" opacity="0.9" />

      {/* parachoques */}
      <rect x="41" y="150" width="318" height="12" rx="6" fill="var(--primario-fuerte)" />

      {/* ruedas */}
      <circle cx="122" cy="176" r="26" fill="var(--foreground)" />
      <circle cx="122" cy="176" r="11" fill="var(--superficie)" />
      <circle cx="290" cy="176" r="26" fill="var(--foreground)" />
      <circle cx="290" cy="176" r="11" fill="var(--superficie)" />

      {/* faro */}
      <circle cx="350" cy="140" r="8" fill="var(--alerta-suave)" />

      {/* insignia llave inglesa */}
      <circle cx="298" cy="60" r="30" fill="var(--exito)" />
      <g transform="translate(283 45) scale(1.25)">
        <path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      <defs>
        <linearGradient id="brillo" x1="41" y1="59" x2="359" y2="175" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.5" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
