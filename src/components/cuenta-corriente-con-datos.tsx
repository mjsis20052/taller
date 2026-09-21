import { IconoCuentaCorriente } from "@/components/icono-cuenta-corriente";
import { listarDeudoresConDetalle } from "@/lib/cuenta-corriente";

export async function CuentaCorrienteConDatos() {
  return <IconoCuentaCorriente deudores={await listarDeudoresConDetalle()} />;
}
