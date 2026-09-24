-- AlterTable
ALTER TABLE "TimelineEvento" ADD COLUMN     "origen" TEXT,
ADD COLUMN     "usuario" TEXT;

-- CreateTable
CREATE TABLE "VozIdempotencia" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "respuesta" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VozIdempotencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VozIdempotencia_endpoint_idempotencyKey_key" ON "VozIdempotencia"("endpoint", "idempotencyKey");
