/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Treatment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Treatment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Treatment" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Treatment_slug_key" ON "public"."Treatment"("slug");
