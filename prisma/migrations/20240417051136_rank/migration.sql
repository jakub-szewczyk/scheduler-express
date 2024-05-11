/*
  Warnings:

  - You are about to drop the column `index` on the `Issue` table. All the data in the column will be lost.
  - You are about to drop the column `index` on the `Status` table. All the data in the column will be lost.
  - Added the required column `rank` to the `Issue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rank` to the `Status` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "index",
ADD COLUMN     "rank" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Status" DROP COLUMN "index",
ADD COLUMN     "rank" TEXT NOT NULL;
