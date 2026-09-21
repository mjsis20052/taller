import type { Metadata, Viewport } from "next";
import { RegistroServiceWorker } from "@/components/registro-service-worker";
import { AvisoActualizacion } from "@/components/aviso-actualizacion";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Taller",
    template: "%s · Taller",
  },
  description: "Gestión integral del taller mecánico",
  applicationName: "Taller",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Taller",
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
      { url: "/icons/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" },
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
        <RegistroServiceWorker />
        <AvisoActualizacion />
      </body>
    </html>
  );
}
