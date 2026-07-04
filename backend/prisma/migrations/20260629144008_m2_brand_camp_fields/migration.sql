/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Camp` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CampLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "BrandStatus" AS ENUM ('LIVE', 'COMING_SOON', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Camp" ADD COLUMN     "brandId" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'English',
ADD COLUMN     "level" "CampLevel" NOT NULL DEFAULT 'BEGINNER',
ADD COLUMN     "prerequisites" JSONB,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "whatYouLearn" JSONB;

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "status" "BrandStatus" NOT NULL DEFAULT 'COMING_SOON',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Brand_status_idx" ON "Brand"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Camp_slug_key" ON "Camp"("slug");

-- CreateIndex
CREATE INDEX "Camp_brandId_idx" ON "Camp"("brandId");

-- CreateIndex
CREATE INDEX "Camp_slug_idx" ON "Camp"("slug");

-- AddForeignKey
ALTER TABLE "Camp" ADD CONSTRAINT "Camp_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
