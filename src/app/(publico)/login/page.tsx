import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FormularioLogin } from "@/components/formulario-login";
import { Engranaje } from "@/components/engranaje";
import { COOKIE_SESION, rutaSegura, tokenValido } from "@/lib/sesion";

export const metadata: Metadata = { title: "Ingresar" };
export const dynamic = "force-dynamic";

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const siguiente = rutaSegura(next);

  if (await tokenValido((await cookies()).get(COOKIE_SESION)?.value)) redirect(siguiente);

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-10">
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primario-suave opacity-80 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-primario-suave opacity-60 blur-3xl" />
      <Engranaje className="pointer-events-none absolute -left-12 bottom-10 h-40 w-40 text-primario/10" segundos={40} />
      <Engranaje className="pointer-events-none absolute -right-8 top-16 h-28 w-28 text-primario/15" segundos={28} sentido={-1} />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primario text-3xl shadow-lg">🔧</span>
          <h1 className="mt-4 text-[28px] font-extrabold tracking-tight text-foreground">Taller</h1>
          <p className="mt-1 text-[14.5px] text-mutado">Ingresá para ver tu panel</p>
        </div>

        <div className="rounded-3xl border border-borde bg-superficie p-6 shadow-[var(--sombra-flotante)]">
          <FormularioLogin siguiente={siguiente} />
        </div>

        <p className="mt-6 text-center text-[13.5px] text-mutado">
          ¿Sos cliente?{" "}
          <Link href="/portal" className="font-semibold text-primario">
            Pedí tu turno o consultá tu vehículo
          </Link>
        </p>
      </div>
    </main>
  );
}
