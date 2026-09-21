import type { Metadata, Viewport } from "next";
import { RegistroServiceWorker } from "@/components/registro-service-worker";
import { AvisoActualizacion } from "@/components/aviso-actualizacion";
import "./globals.css";

// Pantallas de arranque de iOS (color único #6366f1): una por tamaño de iPhone/iPad, en px de CSS.
const PANTALLAS_ARRANQUE = [
  { ancho: 320, alto: 568, ratio: 2 },
  { ancho: 375, alto: 667, ratio: 2 },
  { ancho: 414, alto: 896, ratio: 2 },
  { ancho: 360, alto: 780, ratio: 3 },
  { ancho: 375, alto: 812, ratio: 3 },
  { ancho: 390, alto: 844, ratio: 3 },
  { ancho: 393, alto: 852, ratio: 3 },
  { ancho: 414, alto: 736, ratio: 3 },
  { ancho: 414, alto: 896, ratio: 3 },
  { ancho: 428, alto: 926, ratio: 3 },
  { ancho: 430, alto: 932, ratio: 3 },
  { ancho: 768, alto: 1024, ratio: 2 },
  { ancho: 834, alto: 1112, ratio: 2 },
  { ancho: 834, alto: 1194, ratio: 2 },
  { ancho: 1024, alto: 1366, ratio: 2 },
];

export const metadata: Metadata = {
  title: {
    default: "Car-Mec",
    template: "%s · Car-Mec",
  },
  description: "Car-Mec: gestión del taller mecánico, turnos y seguimiento de tu vehículo",
  applicationName: "Car-Mec",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Car-Mec",
    startupImage: PANTALLAS_ARRANQUE.map(({ ancho, alto, ratio }) => ({
      url: `/splash/apple-splash-${ancho * ratio}x${alto * ratio}.png`,
      media: `(device-width: ${ancho}px) and (device-height: ${alto}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`,
    })),
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    // Next ya emite mobile-web-app-capable; este es el tag viejo que
    // todavía necesitan versiones de iOS anteriores a la 11.3.
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png?v=3", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png?v=3", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background">
        {children}
        <div className="splash-inicio" aria-hidden>
          <svg viewBox="0 0 24 24" width="76" height="76">
            <path
              d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
              fill="#fff"
              stroke="#fff"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          </svg>
          <span>Car-Mec</span>
        </div>
        <RegistroServiceWorker />
        <AvisoActualizacion />
      </body>
    </html>
  );
}
