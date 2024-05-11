/*
  Warnings:

  - A unique constraint covering the columns `[rank,statusId]` on the table `Issue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Issue_rank_statusId_key" ON "Issue"("rank", "statusId");
