/*
  Warnings:

  - Made the column `day` on table `Row` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Row" ALTER COLUMN "day" SET NOT NULL;
