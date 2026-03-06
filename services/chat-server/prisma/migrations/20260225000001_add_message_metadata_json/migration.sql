-- AlterTable
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "metadataJson" JSONB;
