/*
  Warnings:

  - You are about to drop the column `authorId` on the `PushSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `pushSubscription` on the `PushSubscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[notificationId]` on the table `PushSubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `entity` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notificationId` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PushSubscription" DROP COLUMN "authorId",
DROP COLUMN "pushSubscription",
ADD COLUMN     "entity" JSONB NOT NULL,
ADD COLUMN     "notificationId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_notificationId_key" ON "PushSubscription"("notificationId");

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
