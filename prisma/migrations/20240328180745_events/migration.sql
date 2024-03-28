/*
  Warnings:

  - You are about to drop the column `name` on the `Board` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Status` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title,projectId]` on the table `Board` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,scheduleId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,authorId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,projectId]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,boardId]` on the table `Status` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `Board` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Status` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Board_name_projectId_key";

-- DropIndex
DROP INDEX "Event_name_scheduleId_key";

-- DropIndex
DROP INDEX "Project_name_authorId_key";

-- DropIndex
DROP INDEX "Schedule_name_projectId_key";

-- DropIndex
DROP INDEX "Status_name_boardId_key";

-- AlterTable
ALTER TABLE "Board" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Status" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Board_title_projectId_key" ON "Board"("title", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_title_scheduleId_key" ON "Event"("title", "scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_title_authorId_key" ON "Project"("title", "authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_title_projectId_key" ON "Schedule"("title", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Status_title_boardId_key" ON "Status"("title", "boardId");
