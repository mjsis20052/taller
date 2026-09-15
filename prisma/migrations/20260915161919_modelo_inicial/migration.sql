-- CreateEnum
CREATE TYPE "TipoPersona" AS ENUM ('FISICA', 'JURIDICA');

-- CreateEnum
CREATE TYPE "CondicionFiscal" AS ENUM ('CONSUMIDOR_FINAL', 'RESPONSABLE_INSCRIPTO', 'MONOTRIBUTISTA', 'EXENTO');

-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('AGENDADO', 'CANCELADO', 'CONVERTIDO_OT');

-- CreateEnum
CREATE TYPE "EstadoOT" AS ENUM ('TURNO_AGENDADO', 'INGRESADO', 'EN_DIAGNOSTICO', 'PRESUPUESTADO', 'APROBADO', 'EN_EJECUCION', 'TERMINADO', 'FACTURADO', 'ENTREGADO', 'CANCELADA');

-- CreateEnum
CREATE TYPE "NivelCombustible" AS ENUM ('VACIO', 'UN_CUARTO', 'MEDIO', 'TRES_CUARTOS', 'LLENO');

-- CreateEnum
CREATE TYPE "TipoOTItem" AS ENUM ('REPUESTO', 'MANO_OBRA');

-- CreateEnum
CREATE TYPE "EntidadFoto" AS ENUM ('OT', 'GASTO');

-- CreateEnum
CREATE TYPE "EstadoPresupuesto" AS ENUM ('ENVIADO', 'APROBADO', 'RECHAZADO', 'SIN_RESPUESTA');

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoPersona" "TipoPersona" NOT NULL,
    "dni" TEXT,
    "cuit" TEXT,
    "condicionFiscal" "CondicionFiscal" NOT NULL DEFAULT 'CONSUMIDOR_FINAL',
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "domicilio" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "patente" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER,
    "color" TEXT,
    "vin" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KilometrajeRegistro" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "km" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "otId" TEXT,

    CONSTRAINT "KilometrajeRegistro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicioFrecuente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "duracionMin" INTEGER NOT NULL,
    "precioSugerido" DECIMAL(12,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicioFrecuente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turno" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL,
    "duracionMin" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" "EstadoTurno" NOT NULL DEFAULT 'AGENDADO',
    "otId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenTrabajo" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "estado" "EstadoOT" NOT NULL DEFAULT 'TURNO_AGENDADO',
    "motivo" TEXT,
    "kmIngreso" INTEGER,
    "nivelCombustible" "NivelCombustible",
    "motivoCancelacion" TEXT,
    "totalRepuestos" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalManoObra" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "cerradaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdenTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvento" (
    "id" TEXT NOT NULL,
    "otId" TEXT NOT NULL,
    "estado" "EstadoOT" NOT NULL,
    "nota" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineEvento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTItem" (
    "id" TEXT NOT NULL,
    "otId" TEXT NOT NULL,
    "tipo" "TipoOTItem" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" DECIMAL(12,2) NOT NULL,
    "precioUnitario" DECIMAL(12,2) NOT NULL,
    "repuestoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" TEXT NOT NULL,
    "entidad" "EntidadFoto" NOT NULL,
    "otId" TEXT,
    "gastoId" TEXT,
    "path" TEXT NOT NULL,
    "fechaTomada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presupuesto" (
    "id" TEXT NOT NULL,
    "otId" TEXT NOT NULL,
    "itemsSnapshot" JSONB NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "validezDias" INTEGER NOT NULL,
    "estado" "EstadoPresupuesto" NOT NULL DEFAULT 'ENVIADO',
    "enviadoAt" TIMESTAMP(3),
    "respondidoAt" TIMESTAMP(3),
    "metodoRespuesta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Presupuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("clave")
);

-- CreateIndex
CREATE INDEX "Cliente_nombre_idx" ON "Cliente"("nombre");

-- CreateIndex
CREATE INDEX "Cliente_telefono_idx" ON "Cliente"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_patente_key" ON "Vehiculo"("patente");

-- CreateIndex
CREATE INDEX "Vehiculo_clienteId_idx" ON "Vehiculo"("clienteId");

-- CreateIndex
CREATE INDEX "KilometrajeRegistro_vehiculoId_idx" ON "KilometrajeRegistro"("vehiculoId");

-- CreateIndex
CREATE INDEX "KilometrajeRegistro_otId_idx" ON "KilometrajeRegistro"("otId");

-- CreateIndex
CREATE UNIQUE INDEX "Turno_otId_key" ON "Turno"("otId");

-- CreateIndex
CREATE INDEX "Turno_clienteId_idx" ON "Turno"("clienteId");

-- CreateIndex
CREATE INDEX "Turno_vehiculoId_idx" ON "Turno"("vehiculoId");

-- CreateIndex
CREATE INDEX "Turno_fechaHora_idx" ON "Turno"("fechaHora");

-- CreateIndex
CREATE UNIQUE INDEX "OrdenTrabajo_numero_key" ON "OrdenTrabajo"("numero");

-- CreateIndex
CREATE INDEX "OrdenTrabajo_clienteId_idx" ON "OrdenTrabajo"("clienteId");

-- CreateIndex
CREATE INDEX "OrdenTrabajo_vehiculoId_idx" ON "OrdenTrabajo"("vehiculoId");

-- CreateIndex
CREATE INDEX "OrdenTrabajo_estado_idx" ON "OrdenTrabajo"("estado");

-- CreateIndex
CREATE INDEX "TimelineEvento_otId_idx" ON "TimelineEvento"("otId");

-- CreateIndex
CREATE INDEX "OTItem_otId_idx" ON "OTItem"("otId");

-- CreateIndex
CREATE INDEX "Foto_otId_idx" ON "Foto"("otId");

-- CreateIndex
CREATE INDEX "Presupuesto_otId_idx" ON "Presupuesto"("otId");

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KilometrajeRegistro" ADD CONSTRAINT "KilometrajeRegistro_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KilometrajeRegistro" ADD CONSTRAINT "KilometrajeRegistro_otId_fkey" FOREIGN KEY ("otId") REFERENCES "OrdenTrabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_otId_fkey" FOREIGN KEY ("otId") REFERENCES "OrdenTrabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvento" ADD CONSTRAINT "TimelineEvento_otId_fkey" FOREIGN KEY ("otId") REFERENCES "OrdenTrabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTItem" ADD CONSTRAINT "OTItem_otId_fkey" FOREIGN KEY ("otId") REFERENCES "OrdenTrabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_otId_fkey" FOREIGN KEY ("otId") REFERENCES "OrdenTrabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presupuesto" ADD CONSTRAINT "Presupuesto_otId_fkey" FOREIGN KEY ("otId") REFERENCES "OrdenTrabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
