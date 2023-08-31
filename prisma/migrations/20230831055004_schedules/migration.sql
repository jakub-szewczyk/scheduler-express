/*
  Warnings:

  - A unique constraint covering the columns `[subRowId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[day,scheduleId]` on the table `Row` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `day` to the `Row` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Day" AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_rowId_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "subRowId" TEXT,
ALTER COLUMN "rowId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Row" ADD COLUMN     "day" "Day" NOT NULL;

-- CreateTable
CREATE TABLE "SubRow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "starts" TIMESTAMP(3),
    "ends" TIMESTAMP(3),
    "room" TEXT,
    "subject" TEXT,
    "rowId" TEXT NOT NULL,

    CONSTRAINT "SubRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_subRowId_key" ON "Notification"("subRowId");

-- CreateIndex
CREATE UNIQUE INDEX "Row_day_scheduleId_key" ON "Row"("day", "scheduleId");

-- AddForeignKey
ALTER TABLE "SubRow" ADD CONSTRAINT "SubRow_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "Row"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "Row"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_subRowId_fkey" FOREIGN KEY ("subRowId") REFERENCES "SubRow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
