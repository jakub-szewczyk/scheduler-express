/*
  Warnings:

  - You are about to drop the column `subRowId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the `SubRow` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `rowId` on table `Notification` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_rowId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_subRowId_fkey";

-- DropForeignKey
ALTER TABLE "SubRow" DROP CONSTRAINT "SubRow_rowId_fkey";

-- DropIndex
DROP INDEX "Notification_subRowId_key";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "subRowId",
ALTER COLUMN "rowId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Row" ADD COLUMN     "rowId" TEXT,
ALTER COLUMN "day" DROP NOT NULL;

-- DropTable
DROP TABLE "SubRow";

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "Row"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
