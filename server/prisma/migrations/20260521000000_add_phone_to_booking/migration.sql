-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "phone" TEXT NOT NULL DEFAULT '';

-- Remove default after backfill (column is now required without default)
ALTER TABLE "Booking" ALTER COLUMN "phone" DROP DEFAULT;
