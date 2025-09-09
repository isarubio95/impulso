/*
  Warnings:

  - You are about to drop the column `composition` on the `Treatment` table. All the data in the column will be lost.
  - You are about to drop the column `imageAlt` on the `Treatment` table. All the data in the column will be lost.
  - You are about to drop the column `longDesc` on the `Treatment` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Treatment` table. All the data in the column will be lost.
  - Added the required column `name` to the `Treatment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Treatment" DROP COLUMN "composition",
DROP COLUMN "imageAlt",
DROP COLUMN "longDesc",
DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "price" DECIMAL(65,30),
ADD COLUMN     "promoted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "desc" DROP NOT NULL;
