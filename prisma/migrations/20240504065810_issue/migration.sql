/*
  Warnings:

  - You are about to drop the column `priorities` on the `Issue` table. All the data in the column will be lost.
  - Added the required column `priority` to the `Issue` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('TRIVIAL', 'MINOR', 'LOW', 'MEDIUM', 'HIGH', 'MAJOR', 'CRITICAL');

-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "priorities",
ADD COLUMN     "priority" "Priority" NOT NULL;
