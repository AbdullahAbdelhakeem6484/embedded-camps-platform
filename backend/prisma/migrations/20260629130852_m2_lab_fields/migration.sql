-- AlterTable
ALTER TABLE "Lab" ADD COLUMN     "instructionsUrl" TEXT,
ADD COLUMN     "solutionContent" TEXT,
ADD COLUMN     "solutionUrl" TEXT;

-- CreateIndex
CREATE INDEX "Lab_masterSessionId_idx" ON "Lab"("masterSessionId");
