import { notFound } from "next/navigation";
import { InformeOTVista } from "@/components/informe-vista";
import { cargarInformeOT } from "@/lib/informe";

export const dynamic = "force-dynamic";

export default async function PaginaInforme({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const informe = await cargarInformeOT(token);
  if (!informe) notFound();
  return <InformeOTVista informe={informe} />;
}
