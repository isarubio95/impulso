/*
  Warnings:

  - You are about to drop the column `name` on the `Treatment` table. All the data in the column will be lost.
  - Added the required column `imageAlt` to the `Treatment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longDesc` to the `Treatment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Treatment` table without a default value. This is not possible if the table is not empty.
  - Made the column `desc` on table `Treatment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `imageUrl` on table `Treatment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Treatment" DROP COLUMN "name",
ADD COLUMN     "composition" JSONB,
ADD COLUMN     "imageAlt" TEXT NOT NULL,
ADD COLUMN     "longDesc" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "desc" SET NOT NULL,
ALTER COLUMN "imageUrl" SET NOT NULL;
