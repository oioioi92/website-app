import { z } from "zod";

export const VisitorHelloSchema = z.object({
  sessionId: z.string().min(6).max(128),
  entryUrl: z.string().max(2048).optional().nullable(),
  referrer: z.string().max(2048).optional().nullable(),
  visitorName: z.string().max(200).optional().nullable(),
  visitorEmail: z.string().max(320).optional().nullable(),
  visitorPhone: z.string().max(64).optional().nullable()
});

export const VisitorMessageSchema = z.object({
  conversationId: z.string().min(1).max(64).optional().nullable(),
  bodyText: z.string().min(1).max(1000)
});

export const AdminAuthSchema = z.object({
  token: z.string().min(20).max(4096)
});

export const AdminJoinSchema = z.object({
  conversationId: z.string().min(1).max(64)
});

export const AdminMessageSchema = z.object({
  conversationId: z.string().min(1).max(64),
  bodyText: z.string().min(1).max(2000),
  quickReplies: z.array(z.string().min(1).max(80)).max(10).optional()
});

export const AdminCloseSchema = z.object({
  conversationId: z.string().min(1).max(64)
});

export const AdminAssignSchema = z.object({
  conversationId: z.string().min(1).max(64)
});

