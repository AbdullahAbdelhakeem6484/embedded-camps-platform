/*
  Warnings:

  - The `grade` column on the `Feedback` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Camp" ADD COLUMN     "thumbnail" TEXT;

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "grade",
ADD COLUMN     "grade" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "loginAttempts" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Camp_status_idx" ON "Camp"("status");

-- CreateIndex
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");

-- CreateIndex
CREATE INDEX "Enrollment_campId_idx" ON "Enrollment"("campId");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");

-- CreateIndex
CREATE INDEX "Feedback_instructorId_idx" ON "Feedback"("instructorId");

-- CreateIndex
CREATE INDEX "LabSubmission_labId_idx" ON "LabSubmission"("labId");

-- CreateIndex
CREATE INDEX "LabSubmission_userId_idx" ON "LabSubmission"("userId");

-- CreateIndex
CREATE INDEX "MasterSession_category_idx" ON "MasterSession"("category");

-- CreateIndex
CREATE INDEX "QuizAttempt_quizId_idx" ON "QuizAttempt"("quizId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");
