-- AlterTable
ALTER TABLE "Cobro" ADD COLUMN     "concepto" TEXT NOT NULL DEFAULT 'PAGO';

-- AlterTable
ALTER TABLE "OTItem" ADD COLUMN     "aPedir" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "falla" TEXT,
ADD COLUMN     "notaPedido" TEXT;
