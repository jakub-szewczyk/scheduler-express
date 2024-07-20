-- CreateEnum
CREATE TYPE "Color" AS ENUM ('BLUE', 'ORANGE', 'PURPLE', 'TEAL');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "color" "Color" NOT NULL DEFAULT 'BLUE';
