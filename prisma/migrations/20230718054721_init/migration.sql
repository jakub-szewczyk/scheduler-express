/*
  Warnings:

  - A unique constraint covering the columns `[authorId,name]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Project_authorId_name_key" ON "Project"("authorId", "name");
