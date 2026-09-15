-- CreateEnum
CREATE TYPE "TipoMovimientoStock" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "CategoriaGasto" AS ENUM ('REPUESTOS', 'HERRAMIENTAS', 'ALQUILER', 'SERVICIOS', 'OTROS');

-- CreateEnum
CREATE TYPE "EstadoSolicitudFacturacion" AS ENUM ('PENDIENTE', 'ENVIADA', 'FACTURADA', 'ERROR');

-- CreateTable
CREATE TABLE "Repuesto" (
    "id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "codigo" TEXT,
    "proveedor" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "costo" DECIMAL(12,2) NOT NULL,
    "precioVenta" DECIMAL(12,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoStock" (
    "id" TEXT NOT NULL,
    "repuestoId" TEXT NOT NULL,
    "tipo" "TipoMovimientoStock" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "otId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proveedor" TEXT NOT NULL,
    "categoria" "CategoriaGasto" NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cobro" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "otId" TEXT,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodo" TEXT,
    "notas" TEXT,

    CONSTRAINT "Cobro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudFacturacion" (
    "id" TEXT NOT NULL,
    "otId" TEXT NOT NULL,
    "idExterno" TEXT NOT NULL,
    "clienteSnapshot" JSONB NOT NULL,
    "items" JSONB NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "fechaVenta" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoSolicitudFacturacion" NOT NULL DEFAULT 'PENDIENTE',
    "numeroComprobante" TEXT,
    "cae" TEXT,
    "caeVencimiento" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "errorDetalle" TEXT,
    "enviadoAt" TIMESTAMP(3),
    "facturadaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolicitudFacturacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Repuesto_descripcion_idx" ON "Repuesto"("descripcion");

-- CreateIndex
CREATE INDEX "MovimientoStock_repuestoId_idx" ON "MovimientoStock"("repuestoId");

-- CreateIndex
CREATE INDEX "MovimientoStock_otId_idx" ON "MovimientoStock"("otId");

-- CreateIndex
CREATE INDEX "Gasto_fecha_idx" ON "Gasto"("fecha");

-- CreateIndex
CREATE INDEX "Gasto_categoria_idx" ON "Gasto"("categoria");

-- CreateIndex
CREATE INDEX "Cobro_clienteId_idx" ON "Cobro"("clienteId");

-- CreateIndex
CREATE INDEX "Cobro_otId_idx" ON "Cobro"("otId");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitudFacturacion_otId_key" ON "SolicitudFacturacion"("otId");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitudFacturacion_idExterno_key" ON "SolicitudFacturacion"("idExterno");

-- CreateIndex
CREATE INDEX "Foto_gastoId_idx" ON "Foto"("gastoId");

-- CreateIndex
CREATE INDEX "OTItem_repuestoId_idx" ON "OTItem"("repuestoId");

-- AddForeignKey
ALTER TABLE "OTItem" ADD CONSTRAINT "OTItem_repuestoId_fkey" FOREIGN KEY ("repuestoId") REFERENCES "Repuesto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_gastoId_fkey" FOREIGN KEY ("gastoId") REFERENCES "Gasto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoStock" ADD CONSTRAINT "MovimientoStock_repuestoId_fkey" FOREIGN KEY ("repuestoId") REFERENCES "Repuesto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoStock" ADD CONSTRAINT "MovimientoStock_otId_fkey" FOREIGN KEY ("otId") REFERENCES "OrdenTrabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobro" ADD CONSTRAINT "Cobro_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobro" ADD CONSTRAINT "Cobro_otId_fkey" FOREIGN KEY ("otId") REFERENCES "OrdenTrabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudFacturacion" ADD CONSTRAINT "SolicitudFacturacion_otId_fkey" FOREIGN KEY ("otId") REFERENCES "OrdenTrabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

