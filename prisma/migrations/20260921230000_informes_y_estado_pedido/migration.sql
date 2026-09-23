-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "tokenInforme" TEXT NOT NULL DEFAULT replace((gen_random_uuid())::text, '-'::text, ''::text);

-- AlterTable
ALTER TABLE "OTItem" ADD COLUMN     "estadoPedido" TEXT NOT NULL DEFAULT 'NO';

-- AlterTable
ALTER TABLE "OrdenTrabajo" ADD COLUMN     "tokenInforme" TEXT NOT NULL DEFAULT replace((gen_random_uuid())::text, '-'::text, ''::text);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_tokenInforme_key" ON "Cliente"("tokenInforme");

-- CreateIndex
CREATE UNIQUE INDEX "OrdenTrabajo_tokenInforme_key" ON "OrdenTrabajo"("tokenInforme");


-- Repuestos que ya estaban marcados: "hay que pedirlo" -> A_PEDIR, y los que ya tenían nota de pedido -> PEDIDO.
UPDATE "OTItem" SET "estadoPedido" = 'A_PEDIR' WHERE "aPedir" = true;
UPDATE "OTItem" SET "estadoPedido" = 'PEDIDO' WHERE "aPedir" = false AND "notaPedido" IS NOT NULL;
