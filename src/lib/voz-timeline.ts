// Formato del texto de nota para los eventos de timeline que crean los
// endpoints de voz (api/voz/**). El panel ya muestra TimelineEvento.nota tal
// cual (ver src/app/(interno)/ots/[id]/page.tsx) sin ningún cambio: prefijar
// acá alcanza para que se vea "[voz — <usuario>] ..." sin tocar esa página,
// que queda fuera del alcance de este agente. El campo estructurado
// TimelineEvento.usuario (ver schema.prisma) guarda lo mismo para auditoría
// y consultas, además del texto.
export function notaVoz(usuario: string, texto: string): string {
  return `[voz — ${usuario}] ${texto}`;
}

// Origen fijo que se guarda en TimelineEvento.origen para todo evento creado
// por un endpoint de voz (a diferencia de null, que es el panel).
export const ORIGEN_VOZ = "VOZ";
