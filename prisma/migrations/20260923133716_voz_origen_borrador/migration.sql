-- AlterTable
ALTER TABLE "OrdenTrabajo" ADD COLUMN     "origenBorradorVozId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OrdenTrabajo_origenBorradorVozId_key" ON "OrdenTrabajo"("origenBorradorVozId");

