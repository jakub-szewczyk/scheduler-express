/*
  Warnings:

  - A unique constraint covering the columns `[rank,boardId]` on the table `Status` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Status_rank_boardId_key" ON "Status"("rank", "boardId");
