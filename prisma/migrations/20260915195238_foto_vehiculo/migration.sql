-- AlterEnum
ALTER TYPE "EntidadFoto" ADD VALUE 'VEHICULO';

-- AlterTable
ALTER TABLE "Foto" ADD COLUMN     "vehiculoId" TEXT;

-- CreateIndex
CREATE INDEX "Foto_vehiculoId_idx" ON "Foto"("vehiculoId");

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

