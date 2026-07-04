/*
  Warnings:

  - You are about to drop the column `pinned` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `watchTime` on the `MaterialProgress` table. All the data in the column will be lost.
  - You are about to drop the column `paymentRef` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `explanation` on the `Question` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_campId_fkey";

-- DropIndex
DROP INDEX "Announcement_createdAt_idx";

-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "pinned",
DROP COLUMN "updatedAt",
ADD COLUMN     "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "MaterialProgress" DROP COLUMN "watchTime";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "paymentRef",
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "currency" SET DEFAULT 'EGP';

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "explanation",
ALTER COLUMN "correctOption" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "QuizAttempt" ALTER COLUMN "passed" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Announcement_publishedAt_idx" ON "Announcement"("publishedAt");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "Certificate_campId_idx" ON "Certificate"("campId");

-- CreateIndex
CREATE INDEX "Enrollment_enrolledAt_idx" ON "Enrollment"("enrolledAt");

-- CreateIndex
CREATE INDEX "MaterialProgress_userId_idx" ON "MaterialProgress"("userId");

-- CreateIndex
CREATE INDEX "MaterialProgress_materialId_idx" ON "MaterialProgress"("materialId");

-- CreateIndex
CREATE INDEX "Question_quizId_idx" ON "Question"("quizId");

-- CreateIndex
CREATE INDEX "Quiz_masterSessionId_idx" ON "Quiz"("masterSessionId");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_campId_fkey" FOREIGN KEY ("campId") REFERENCES "Camp"("id") ON DELETE SET NULL ON UPDATE CASCADE;
