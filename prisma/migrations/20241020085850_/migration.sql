/*
  Warnings:

  - A unique constraint covering the columns `[title,boardId]` on the table `Issue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `boardId` to the `Issue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "boardId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Issue_title_boardId_key" ON "Issue"("title", "boardId");

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
