/*
  Warnings:

  - You are about to drop the column `name` on the `Board` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Issue` table. All the data in the column will be lost.
  - You are about to drop the column `editorState` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `rowId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the `Row` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[title,projectId]` on the table `Board` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,projectId]` on the table `Note` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[eventId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,authorId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,projectId]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `Board` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startsAt` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `title` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_rowId_fkey";

-- DropForeignKey
ALTER TABLE "Row" DROP CONSTRAINT "Row_scheduleId_fkey";

-- DropIndex
DROP INDEX "Board_name_projectId_key";

-- DropIndex
DROP INDEX "Note_name_projectId_key";

-- DropIndex
DROP INDEX "Notification_rowId_key";

-- DropIndex
DROP INDEX "Project_name_authorId_key";

-- DropIndex
DROP INDEX "Schedule_name_projectId_key";

-- AlterTable
ALTER TABLE "Board" DROP COLUMN "name",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "content",
ADD COLUMN     "attachments" BYTEA[],
ADD COLUMN     "description" TEXT,
ADD COLUMN     "priorities" TEXT[];

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "editorState",
DROP COLUMN "name",
ADD COLUMN     "content" JSONB NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "active",
DROP COLUMN "rowId",
DROP COLUMN "time",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startsAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "name",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Status" ADD COLUMN     "description" TEXT;

-- DropTable
DROP TABLE "Row";

-- DropEnum
DROP TYPE "Day";

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "scheduleId" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Board_title_projectId_key" ON "Board"("title", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Note_title_projectId_key" ON "Note"("title", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_eventId_key" ON "Notification"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_title_authorId_key" ON "Project"("title", "authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_title_projectId_key" ON "Schedule"("title", "projectId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
