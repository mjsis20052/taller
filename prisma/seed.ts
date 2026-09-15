import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const SERVICIOS_FRECUENTES = [
  { nombre: "Service 10.000 km", duracionMin: 120, precioSugerido: 45000 },
  { nombre: "Cambio de aceite y filtro", duracionMin: 45, precioSugerido: 18000 },
  { nombre: "Alineación y balanceo", duracionMin: 60, precioSugerido: 25000 },
  { nombre: "Cambio de pastillas de freno (eje)", duracionMin: 90, precioSugerido: 32000 },
  { nombre: "Diagnóstico general", duracionMin: 30, precioSugerido: 12000 },
];

async function main() {
  for (const servicio of SERVICIOS_FRECUENTES) {
    await prisma.servicioFrecuente.upsert({
      where: { nombre: servicio.nombre },
      update: {},
      create: servicio,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
