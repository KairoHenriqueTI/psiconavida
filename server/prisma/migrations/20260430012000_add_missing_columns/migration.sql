-- Align the deployed database with the current Prisma schema.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hashedPassword" TEXT;

ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "image" TEXT;
