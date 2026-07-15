-- AlterTable
ALTER TABLE "SavedProduct" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "SavedProduct_userId_canonicalProductId_key" ON "SavedProduct"("userId", "canonicalProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_userId_canonicalProductId_type_key" ON "Alert"("userId", "canonicalProductId", "type");
