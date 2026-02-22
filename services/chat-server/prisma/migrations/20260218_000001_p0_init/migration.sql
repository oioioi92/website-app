-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "visitorSessionId" TEXT NOT NULL,
    "visitorIp" TEXT NOT NULL,
    "visitorUa" TEXT,
    "entryUrl" TEXT,
    "referrer" TEXT,
    "assignedAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationTag" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "adminId" TEXT,
    "bodyText" TEXT NOT NULL,
    "ip" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT,
    "visitorSessionId" TEXT,
    "visitorIp" TEXT,
    "visitorUa" TEXT,
    "contact" TEXT,
    "bodyText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CannedReply" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CannedReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IpBlock" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IpBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskScore" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "ip" TEXT,
    "sessionId" TEXT,
    "conversationId" TEXT,
    "detailJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KbArticle" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'zh',
    "title" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KbArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locale" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Locale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "configJson" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "messageId" TEXT,
    "url" TEXT NOT NULL,
    "sha256" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_status_updatedAt_idx" ON "Conversation"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Conversation_visitorSessionId_status_idx" ON "Conversation"("visitorSessionId", "status");

-- CreateIndex
CREATE INDEX "Conversation_assignedAdminId_status_idx" ON "Conversation"("assignedAdminId", "status");

-- CreateIndex
CREATE INDEX "ConversationTag_conversationId_idx" ON "ConversationTag"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationTag_tag_idx" ON "ConversationTag"("tag");

-- CreateIndex
CREATE INDEX "Note_conversationId_idx" ON "Note"("conversationId");

-- CreateIndex
CREATE INDEX "Note_adminId_createdAt_idx" ON "Note"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_senderType_createdAt_idx" ON "Message"("senderType", "createdAt");

-- CreateIndex
CREATE INDEX "Ticket_status_updatedAt_idx" ON "Ticket"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "IpBlock_expiresAt_idx" ON "IpBlock"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "IpBlock_ip_key" ON "IpBlock"("ip");

-- CreateIndex
CREATE INDEX "RiskScore_conversationId_createdAt_idx" ON "RiskScore"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Event_action_createdAt_idx" ON "Event"("action", "createdAt");

-- CreateIndex
CREATE INDEX "Event_conversationId_createdAt_idx" ON "Event"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "KbArticle_locale_isActive_idx" ON "KbArticle"("locale", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Locale_key_key" ON "Locale"("key");

-- CreateIndex
CREATE INDEX "Integration_type_isActive_idx" ON "Integration"("type", "isActive");

-- CreateIndex
CREATE INDEX "Attachment_conversationId_createdAt_idx" ON "Attachment"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "ConversationTag" ADD CONSTRAINT "ConversationTag_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskScore" ADD CONSTRAINT "RiskScore_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

