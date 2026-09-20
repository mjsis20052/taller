import { CampanaNotificaciones } from "@/components/campana-notificaciones";
import { obtenerAlertas } from "@/lib/alertas";

export async function CampanaConAlertas() {
  return <CampanaNotificaciones alertas={await obtenerAlertas()} />;
}
