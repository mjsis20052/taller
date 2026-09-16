import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { NavegacionInferior } from "@/components/navegacion-inferior";
import { RegistroServiceWorker } from "@/components/registro-service-worker";
import { BotonVolver } from "@/components/boton-volver";
import { TransicionPagina } from "@/components/transicion-pagina";
import { CampanaNotificaciones } from "@/components/campana-notificaciones";
import { obtenerAlertas } from "@/lib/alertas";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1d4ed8",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const alertas = await obtenerAlertas();

  return (
    <html
      lang="es-AR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <header className="sticky top-0 z-40 border-b border-borde bg-superficie/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-lg items-center gap-2 px-4 py-3">
            <BotonVolver />
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primario text-base">
              🔧
            </span>
            <span className="text-[15px] font-bold tracking-tight text-foreground">
              Taller
            </span>
            <div className="ml-auto flex items-center gap-1">
              <CampanaNotificaciones alertas={alertas} />
              <Link
                href="/buscar"
                aria-label="Buscar por patente, nombre o teléfono"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-mutado active:bg-black/5"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-5 pb-28">
          <TransicionPagina>{children}</TransicionPagina>
        </main>
        <NavegacionInferior />
        <RegistroServiceWorker />
      </body>
    </html>
  );
}
