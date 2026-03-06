-- AlterTable: Conversation 等待计时 + Open/Close + soft delete
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "openedAt" TIMESTAMP(3);
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "openedByAgentId" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "pendingCustomerMsgAt" TIMESTAMP(3);
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "firstReplyAt" TIMESTAMP(3);
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "lastAgentMsgAt" TIMESTAMP(3);
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "lastWaitMs" INTEGER;

CREATE INDEX IF NOT EXISTS "Conversation_deletedAt_idx" ON "Conversation"("deletedAt");

-- CreateTable: conversation_wait_logs (SLA 等待记录)
CREATE TABLE IF NOT EXISTS "conversation_wait_logs" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "customer_msg_at" TIMESTAMP(3) NOT NULL,
    "agent_reply_at" TIMESTAMP(3) NOT NULL,
    "wait_ms" INTEGER NOT NULL,
    "agent_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_wait_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "conversation_wait_logs_conversationId_idx" ON "conversation_wait_logs"("conversationId");

ALTER TABLE "conversation_wait_logs" ADD CONSTRAINT "conversation_wait_logs_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
