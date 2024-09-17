/*
  Warnings:

  - You are about to drop the column `notificationId` on the `PushSubscription` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PushSubscription" DROP CONSTRAINT "PushSubscription_notificationId_fkey";

-- AlterTable
ALTER TABLE "PushSubscription" DROP COLUMN "notificationId",
ADD COLUMN     "authorId" TEXT NOT NULL;
