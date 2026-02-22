import "dotenv/config";
import http from "node:http";
import fs from "node:fs";
import { createRequire } from "node:module";
import express from "express";
import helmet from "helmet";
import { Server as SocketIOServer } from "socket.io";
import { z } from "zod";
import { assertConfig, config } from "./config.js";
import { rateLimit, enforceCooldown } from "./rateLimit.js";
import { sanitizePlainText } from "./sanitize.js";
import { getIpFromHeaders } from "./ip.js";
import {
  AdminAssignSchema,
  AdminAuthSchema,
  AdminCloseSchema,
  AdminJoinSchema,
  AdminMessageSchema,
  VisitorHelloSchema,
  VisitorMessageSchema
} from "./validators.js";
import { verifyAdminJwt } from "./auth.js";
import { chatDb } from "./db.js";
import { auditEvent } from "./audit.js";
import { getWidgetScript } from "./widget/widgetScript.js";

type DbMessageRow = { createdAt: Date } & Record<string, unknown>;
type BotRule = {
  id: string;
  keyword: string;
  reply: string;
  enabled: boolean;
  priority: number;
  matchMode: "contains" | "equals";
  group: string;
  cooldownSec: number;
  autoTag: string | null;
  createTicket: boolean;
};
type BotSchedule = { id: string; days: number[]; start: string; end: string; enabled: boolean };
type BotConfig = {
  enabled: boolean;
  welcomeEnabled: boolean;
  offlineEnabled: boolean;
  pauseWhenAssigned: boolean;
  scheduleEnabled: boolean;
  timezoneOffsetMinutes: number;
  whitelistKeywords: string[];
  blacklistKeywords: string[];
  welcomeReply: string;
  offlineReply: string;
  schedules: BotSchedule[];
  rules: BotRule[];
};

const BOT_CONFIG_KEY = "chat_bot_config_v1";
const botConfigSchema = z.object({
  enabled: z.boolean().optional(),
  welcomeEnabled: z.boolean().optional(),
  offlineEnabled: z.boolean().optional(),
  pauseWhenAssigned: z.boolean().optional(),
  scheduleEnabled: z.boolean().optional(),
  timezoneOffsetMinutes: z.number().int().min(-720).max(840).optional(),
  whitelistKeywords: z.array(z.string().max(80)).max(100).optional(),
  blacklistKeywords: z.array(z.string().max(80)).max(100).optional(),
  welcomeReply: z.string().max(500).optional(),
  offlineReply: z.string().max(500).optional(),
  schedules: z
    .array(
      z.object({
        id: z.string().max(64).optional(),
        days: z.array(z.number().int().min(0).max(6)).max(7).optional(),
        start: z.string().max(5),
        end: z.string().max(5),
        enabled: z.boolean().optional()
      })
    )
    .max(50)
    .optional(),
  rules: z
    .array(
      z.object({
        id: z.string().max(64).optional(),
        keyword: z.string().max(80),
        reply: z.string().max(500),
        enabled: z.boolean().optional(),
        priority: z.number().int().min(0).max(999).optional(),
        matchMode: z.enum(["contains", "equals"]).optional(),
        group: z.string().max(40).optional(),
        cooldownSec: z.number().int().min(0).max(3600).optional(),
        autoTag: z.string().max(40).optional(),
        createTicket: z.boolean().optional()
      })
    )
    .max(100)
    .optional()
});

function parseTimeToMinute(raw: string): number | null {
  const m = /^([0-1]?\d|2[0-3]):([0-5]\d)$/.exec(raw.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function isNowInSchedule(cfg: BotConfig, nowMs: number): boolean {
  if (!cfg.scheduleEnabled) return true;
  if (cfg.schedules.length === 0) return true;
  const shifted = new Date(nowMs + cfg.timezoneOffsetMinutes * 60_000);
  const day = shifted.getUTCDay();
  const mins = shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
  return cfg.schedules.some((s) => {
    if (!s.enabled) return false;
    if (!s.days.includes(day)) return false;
    const start = parseTimeToMinute(s.start);
    const end = parseTimeToMinute(s.end);
    if (start === null || end === null) return false;
    if (start <= end) return mins >= start && mins <= end;
    return mins >= start || mins <= end;
  });
}

function matchRule(rule: BotRule, lowerText: string): boolean {
  if (rule.matchMode === "equals") return lowerText.trim() === rule.keyword;
  return lowerText.includes(rule.keyword);
}

function normalizeKeywordList(raw: unknown): string[] {
  const arr = Array.isArray(raw) ? raw : [];
  return Array.from(
    new Set(
      arr
        .map((x) => sanitizePlainText(typeof x === "string" ? x : "", 80).toLowerCase())
        .filter(Boolean)
    )
  ).slice(0, 100);
}

function normalizeBotConfig(raw: unknown): BotConfig {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const rawSchedules = Array.isArray(obj.schedules) ? obj.schedules : [];
  const schedules: BotSchedule[] = rawSchedules
    .map((row, idx) => {
      const r = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
      const daysRaw = Array.isArray(r.days) ? r.days : [];
      const days = Array.from(
        new Set(daysRaw.map((x) => Number(x)).filter((x) => Number.isInteger(x) && x >= 0 && x <= 6))
      ).slice(0, 7);
      const start = sanitizePlainText(typeof r.start === "string" ? r.start : "", 5);
      const end = sanitizePlainText(typeof r.end === "string" ? r.end : "", 5);
      if (!days.length || !parseTimeToMinute(start) && start !== "00:00" || !parseTimeToMinute(end) && end !== "00:00") return null;
      const idRaw = sanitizePlainText(typeof r.id === "string" ? r.id : "", 64);
      return { id: idRaw || `sch_${idx + 1}`, days, start, end, enabled: r.enabled !== false };
    })
    .filter((x): x is BotSchedule => Boolean(x))
    .slice(0, 50);
  const rawRules = Array.isArray(obj.rules) ? obj.rules : [];
  const rules: BotRule[] = rawRules
    .map((row, idx) => {
      const r = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
      const keyword = sanitizePlainText(typeof r.keyword === "string" ? r.keyword : "", 80).toLowerCase();
      const reply = sanitizePlainText(typeof r.reply === "string" ? r.reply : "", 500);
      if (!keyword || !reply) return null;
      const idRaw = sanitizePlainText(typeof r.id === "string" ? r.id : "", 64);
      return {
        id: idRaw || `rule_${idx + 1}`,
        keyword,
        reply,
        enabled: r.enabled !== false,
        priority: Number.isFinite(r.priority) ? Math.max(0, Math.min(999, Number(r.priority))) : 100,
        matchMode: r.matchMode === "equals" ? "equals" : "contains",
        group: sanitizePlainText(typeof r.group === "string" ? r.group : "", 40) || "general",
        cooldownSec: Number.isFinite(r.cooldownSec) ? Math.max(0, Math.min(3600, Number(r.cooldownSec))) : 20,
        autoTag: sanitizePlainText(typeof r.autoTag === "string" ? r.autoTag : "", 40) || null,
        createTicket: r.createTicket === true
      };
    })
    .filter((x): x is BotRule => Boolean(x))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 100);
  return {
    enabled: obj.enabled !== false,
    welcomeEnabled: obj.welcomeEnabled === true,
    offlineEnabled: obj.offlineEnabled !== false,
    pauseWhenAssigned: obj.pauseWhenAssigned !== false,
    scheduleEnabled: obj.scheduleEnabled === true,
    timezoneOffsetMinutes: Number.isFinite(obj.timezoneOffsetMinutes) ? Math.max(-720, Math.min(840, Number(obj.timezoneOffsetMinutes))) : 480,
    whitelistKeywords: normalizeKeywordList(obj.whitelistKeywords),
    blacklistKeywords: normalizeKeywordList(obj.blacklistKeywords),
    welcomeReply: sanitizePlainText(typeof obj.welcomeReply === "string" ? obj.welcomeReply : "您好，客服在线，请直接输入问题。", 500),
    offlineReply: sanitizePlainText(typeof obj.offlineReply === "string" ? obj.offlineReply : "客服暂时忙碌中，我们已收到你的消息，会尽快回复。", 500),
    schedules,
    rules
  };
}

let botCache: { expiresAt: number; value: BotConfig } | null = null;

async function loadBotConfig(): Promise<BotConfig> {
  const row = await chatDb.locale.findUnique({ where: { key: BOT_CONFIG_KEY } });
  if (!row) return normalizeBotConfig({});
  return normalizeBotConfig(row.valueJson);
}

async function loadBotConfigCached(): Promise<BotConfig> {
  const now = Date.now();
  if (botCache && botCache.expiresAt > now) return botCache.value;
  const value = await loadBotConfig();
  botCache = { value, expiresAt: now + 15_000 };
  return value;
}

function asyncHandler(fn: (req: express.Request, res: express.Response) => Promise<unknown>) {
  return (req: express.Request, res: express.Response) => {
    void fn(req, res).catch((e) => {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: "SERVER_ERROR", message: msg });
    });
  };
}

function getAdminTokenFromRequest(req: express.Request) {
  const h = req.headers.authorization;
  if (typeof h === "string" && h.toLowerCase().startsWith("bearer ")) return h.slice("bearer ".length).trim();
  const x = req.headers["x-admin-token"];
  if (typeof x === "string" && x.trim()) return x.trim();
  return "";
}

type AuthedAdmin = { adminId: string; role: string | null };

function requireAdmin(req: express.Request, res: express.Response): AuthedAdmin | null {
  const token = getAdminTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return null;
  }
  const claims = verifyAdminJwt(token);
  if (!claims) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return null;
  }
  return { adminId: claims.sub, role: typeof claims.role === "string" ? claims.role : null };
}

function mustHaveRole(admin: AuthedAdmin, roles: string[]) {
  if (!admin.role) return false;
  return roles.includes(admin.role);
}

type HeaderRecord = Record<string, string | string[] | undefined>;
type DbTicketRow = { createdAt: Date; updatedAt: Date } & Record<string, unknown>;
type DbTagRow = { tag: string };
type DbNoteRow = { createdAt: Date } & Record<string, unknown>;
type ConversationTagTx = {
  conversationTag: {
    deleteMany: (args: { where: { conversationId: string } }) => Promise<unknown>;
    createMany: (args: { data: Array<{ conversationId: string; tag: string }> }) => Promise<unknown>;
  };
};

async function main() {
  assertConfig();

  // Hard DB check at boot. If we can't talk to Postgres, don't start WS.
  try {
    await chatDb.$connect();
    await chatDb.$queryRaw`SELECT 1`;
  } catch (e) {
    console.error("DB_FAIL", e instanceof Error ? e.message : String(e));
    process.exit(1);
  }

  const app = express();
  app.disable("x-powered-by");

  app.use(express.json({ limit: "64kb" }));

  // Support both Nginx styles:
  // 1) proxy_pass with trailing slash ("/chat/" stripped)  -> upstream sees "/api/*" and "/widget/*"
  // 2) proxy_pass without trailing slash (full URI kept)   -> upstream sees "/chat/api/*" and "/chat/widget/*"
  // This rewrite lets both work without duplicating handlers.
  app.use("/api", (req, _res, next) => {
    req.url = `/chat/api${req.url}`;
    next();
  });
  app.use("/widget", (req, _res, next) => {
    req.url = `/chat/widget${req.url}`;
    next();
  });

  // Security headers (CSP will be tuned later with exact widget requirements).
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false
    })
  );

  // Basic REST rate limit (per IP).
  app.use((req, res, next) => {
    const ip = getIpFromHeaders(req.headers as Record<string, string | string[] | undefined>);
    const bucket = rateLimit(`rest:${ip}`, config.restRatePerMinute, 60 * 1000);
    if (!bucket.ok) return res.status(429).json({ error: "RATE_LIMITED" });
    next();
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "chat-server", port: config.port });
  });
  app.get("/chat/health", (_req, res) => {
    res.json({ ok: true, service: "chat-server", port: config.port });
  });

  // ===========================================================================
  // P1 REST API (admin token required; keep UI logic in Next.js /admin/chat)
  // NOTE: We keep REST under /chat/api/* because Nginx proxies /chat/ to this server.
  // ===========================================================================

  const cannedCreateSchema = z.object({
    title: z.string().min(1).max(80),
    bodyText: z.string().min(1).max(2000),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(9999).optional()
  });
  const cannedUpdateSchema = cannedCreateSchema.partial();

  app.get(
    "/chat/api/admin/canned-replies",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const rows = await chatDb.cannedReply.findMany({
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
        take: 200
      });
      void auditEvent({
        actorType: "admin",
        actorId: admin.adminId,
        action: "CANNED_REPLY_LIST",
        ip: getIpFromHeaders(req.headers as HeaderRecord)
      });
      res.json({ ok: true, replies: rows });
    })
  );

  app.post(
    "/chat/api/admin/canned-replies",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const parsed = cannedCreateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "INVALID_INPUT" });
      const title = sanitizePlainText(parsed.data.title, 80);
      const bodyText = sanitizePlainText(parsed.data.bodyText, 2000);
      if (!title || !bodyText) return res.status(400).json({ error: "INVALID_INPUT" });
      const row = await chatDb.cannedReply.create({
        data: {
          title,
          bodyText,
          isActive: parsed.data.isActive ?? true,
          sortOrder: parsed.data.sortOrder ?? 0
        }
      });
      void auditEvent({
        actorType: "admin",
        actorId: admin.adminId,
        action: "CANNED_REPLY_CREATE",
        ip: getIpFromHeaders(req.headers as HeaderRecord),
        detailJson: { id: row.id, title }
      });
      res.json({ ok: true, reply: row });
    })
  );

  app.put(
    "/chat/api/admin/canned-replies/:id",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const id = sanitizePlainText(req.params.id, 64);
      const parsed = cannedUpdateSchema.safeParse(req.body);
      if (!id || !parsed.success) return res.status(400).json({ error: "INVALID_INPUT" });
      const data: { title?: string; bodyText?: string; isActive?: boolean; sortOrder?: number } = {};
      if (parsed.data.title !== undefined) data.title = sanitizePlainText(parsed.data.title, 80);
      if (parsed.data.bodyText !== undefined) data.bodyText = sanitizePlainText(parsed.data.bodyText, 2000);
      if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;
      if (parsed.data.sortOrder !== undefined) data.sortOrder = parsed.data.sortOrder;
      const row = await chatDb.cannedReply.update({ where: { id }, data });
      void auditEvent({
        actorType: "admin",
        actorId: admin.adminId,
        action: "CANNED_REPLY_UPDATE",
        ip: getIpFromHeaders(req.headers as HeaderRecord),
        detailJson: { id }
      });
      res.json({ ok: true, reply: row });
    })
  );

  app.delete(
    "/chat/api/admin/canned-replies/:id",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const id = sanitizePlainText(req.params.id, 64);
      if (!id) return res.status(400).json({ error: "INVALID_INPUT" });
      await chatDb.cannedReply.delete({ where: { id } });
      void auditEvent({
        actorType: "admin",
        actorId: admin.adminId,
        action: "CANNED_REPLY_DELETE",
        ip: getIpFromHeaders(req.headers as HeaderRecord),
        detailJson: { id }
      });
      res.json({ ok: true });
    })
  );

  app.get(
    "/chat/api/admin/bot/config",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const cfg = await loadBotConfig();
      res.json({ ok: true, config: cfg });
    })
  );

  app.put(
    "/chat/api/admin/bot/config",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const parsed = botConfigSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "INVALID_INPUT" });
      const next = normalizeBotConfig(parsed.data);
      await chatDb.locale.upsert({
        where: { key: BOT_CONFIG_KEY },
        update: { valueJson: next },
        create: { key: BOT_CONFIG_KEY, valueJson: next }
      });
      botCache = { value: next, expiresAt: Date.now() + 15_000 };
      void auditEvent({
        actorType: "admin",
        actorId: admin.adminId,
        action: "BOT_CONFIG_SAVE",
        ip: getIpFromHeaders(req.headers as HeaderRecord),
        detailJson: { rules: next.rules.length, enabled: next.enabled }
      });
      res.json({ ok: true, config: next });
    })
  );

  app.get(
    "/chat/api/admin/bot/hits",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const take = Math.max(1, Math.min(200, Number(req.query.take ?? 50)));
      const rows = await chatDb.event.findMany({
        where: { action: "BOT_AUTO_REPLY" },
        orderBy: { createdAt: "desc" },
        take
      });
      res.json({
        ok: true,
        hits: rows.map((r: { id: string; createdAt: Date; conversationId: string | null; detailJson: unknown }) => ({
          id: r.id,
          createdAt: r.createdAt.toISOString(),
          conversationId: r.conversationId ?? null,
          detailJson: r.detailJson ?? null
        }))
      });
    })
  );

  const tagsSetSchema = z.object({ tags: z.array(z.string().min(1).max(40)).max(20) });

  app.get(
    "/chat/api/admin/tags",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const rows = await chatDb.conversationTag.findMany({ select: { tag: true }, distinct: ["tag"], take: 500 });
      void auditEvent({
        actorType: "admin",
        actorId: admin.adminId,
        action: "TAG_LIST",
        ip: getIpFromHeaders(req.headers as HeaderRecord)
      });
      res.json({ ok: true, tags: rows.map((r: { tag: string }) => r.tag).sort() });
    })
  );

  app.post(
    "/chat/api/admin/conversations/:id/tags",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const conversationId = sanitizePlainText(req.params.id, 64);
      const parsed = tagsSetSchema.safeParse(req.body);
      if (!conversationId || !parsed.success) return res.status(400).json({ error: "INVALID_INPUT" });
      const tags = Array.from(
        new Set(parsed.data.tags.map((t) => sanitizePlainText(t, 40)).filter(Boolean) as string[])
      ).slice(0, 20);
      await chatDb.$transaction(async (tx: ConversationTagTx) => {
        await tx.conversationTag.deleteMany({ where: { conversationId } });
        if (tags.length > 0) {
          await tx.conversationTag.createMany({
            data: tags.map((tag) => ({ conversationId, tag }))
          });
        }
      });
      void auditEvent({
        actorType: "admin",
        actorId: admin.adminId,
        action: "TAG_SET",
        ip: getIpFromHeaders(req.headers as HeaderRecord),
        conversationId,
        detailJson: { tags }
      });
      res.json({ ok: true, conversationId, tags });
    })
  );

  app.get(
    "/chat/api/admin/conversations/:id/tags",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const conversationId = sanitizePlainText(req.params.id, 64);
      if (!conversationId) return res.status(400).json({ error: "INVALID_INPUT" });
      const rows = await chatDb.conversationTag.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        take: 50
      });
      res.json({ ok: true, conversationId, tags: rows.map((r: DbTagRow) => r.tag) });
    })
  );

  app.delete(
    "/chat/api/admin/tags/:tag",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      // Safer default: only allow high-priv roles to delete tags globally.
      if (!mustHaveRole(admin, ["super", "admin"])) return res.status(403).json({ error: "FORBIDDEN" });
      const tag = sanitizePlainText(req.params.tag, 40);
      if (!tag) return res.status(400).json({ error: "INVALID_INPUT" });
      const del = await chatDb.conversationTag.deleteMany({ where: { tag } });
      void auditEvent({
        actorType: "admin",
        actorId: admin.adminId,
        action: "TAG_DELETE",
        ip: getIpFromHeaders(req.headers as HeaderRecord),
        detailJson: { tag, deleted: del.count }
      });
      res.json({ ok: true, deleted: del.count });
    })
  );

  const noteCreateSchema = z.object({ bodyText: z.string().min(1).max(2000) });

  app.get(
    "/chat/api/admin/conversations/:id/notes",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const conversationId = sanitizePlainText(req.params.id, 64);
      if (!conversationId) return res.status(400).json({ error: "INVALID_INPUT" });
      const rows = await chatDb.note.findMany({
        where: { conversationId },
        orderBy: { createdAt: "desc" },
        take: 200
      });
      void auditEvent({
        actorType: "admin",
        actorId: admin.adminId,
        action: "NOTE_LIST",
        ip: getIpFromHeaders(req.headers as HeaderRecord),
        conversationId
      });
      res.json({ ok: true, notes: rows.map((n: DbNoteRow) => ({ ...n, createdAt: n.createdAt.toISOString() })) });
    })
  );

  app.post(
    "/chat/api/admin/conversations/:id/notes",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const conversationId = sanitizePlainText(req.params.id, 64);
      const parsed = noteCreateSchema.safeParse(req.body);
      if (!conversationId || !parsed.success) return res.status(400).json({ error: "INVALID_INPUT" });
      const bodyText = sanitizePlainText(parsed.data.bodyText, 2000);
      if (!bodyText) return res.status(400).json({ error: "INVALID_INPUT" });
      const row = await chatDb.note.create({ data: { conversationId, adminId: admin.adminId, bodyText } });
      void auditEvent({
        actorType: "admin",
        actorId: admin.adminId,
        action: "NOTE_CREATE",
        ip: getIpFromHeaders(req.headers as HeaderRecord),
        conversationId
      });
      res.json({ ok: true, note: { ...row, createdAt: row.createdAt.toISOString() } });
    })
  );

  const ticketCreateSchema = z.object({
    session_id: z.string().min(1).max(128),
    contact: z.string().max(120).optional().nullable(),
    topic: z.string().max(120).optional().nullable(),
    body: z.string().min(1).max(2000)
  });

  app.post(
    "/chat/api/public/tickets",
    asyncHandler(async (req, res) => {
      const ip = getIpFromHeaders(req.headers as Record<string, string | string[] | undefined>);
      const ua = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : null;
      const parsed = ticketCreateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "INVALID_INPUT" });
      const sessionId = sanitizePlainText(parsed.data.session_id, 128);
      const contact = sanitizePlainText(parsed.data.contact ?? "", 120) || null;
      const topic = sanitizePlainText(parsed.data.topic ?? "", 120) || null;
      const bodyText = sanitizePlainText(parsed.data.body, 2000);
      if (!sessionId || !bodyText) return res.status(400).json({ error: "INVALID_INPUT" });
      const row = await chatDb.ticket.create({
        data: { visitorSessionId: sessionId, visitorIp: ip, visitorUa: ua, contact, bodyText, status: "open" }
      });
      void auditEvent({ actorType: "visitor", action: "TICKET_CREATE", ip, sessionId, detailJson: { ticketId: row.id, topic, contact } });
      res.json({ ok: true, ticketId: row.id });
    })
  );

  app.get(
    "/chat/api/admin/tickets",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const status = typeof req.query.status === "string" ? req.query.status : "open";
      const where = status === "closed" ? { status: "closed" } : { status: "open" };
      const rows = await chatDb.ticket.findMany({ where, orderBy: { updatedAt: "desc" }, take: 200 });
      void auditEvent({
        actorType: "admin",
        actorId: admin.adminId,
        action: "TICKET_LIST",
        ip: getIpFromHeaders(req.headers as HeaderRecord),
        detailJson: { status }
      });
      res.json({
        ok: true,
        tickets: rows.map((t: DbTicketRow) => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString()
        }))
      });
    })
  );

  app.post(
    "/chat/api/admin/tickets/:id/close",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const id = sanitizePlainText(req.params.id, 64);
      if (!id) return res.status(400).json({ error: "INVALID_INPUT" });
      const row = await chatDb.ticket.update({ where: { id }, data: { status: "closed" } });
      void auditEvent({
        actorType: "admin",
        actorId: admin.adminId,
        action: "TICKET_CLOSE",
        ip: getIpFromHeaders(req.headers as HeaderRecord),
        detailJson: { id }
      });
      res.json({ ok: true, ticket: { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() } });
    })
  );

  app.get(
    "/chat/api/admin/queue",
    asyncHandler(async (req, res) => {
      const secret = process.env.CHAT_INTERNAL_SECRET;
      if (secret && req.headers["x-chat-internal-secret"] !== secret) {
        return res.status(401).json({ error: "UNAUTHORIZED" });
      }
      const convs = await chatDb.conversation.findMany({
        where: { status: { in: ["open", "assigned"] } },
        orderBy: { updatedAt: "desc" },
        take: 100,
        select: { id: true, visitorSessionId: true, status: true, assignedAdminId: true, updatedAt: true }
      });
      const now = Date.now();
      const items = await Promise.all(
        convs.map(async (c) => {
          const [lastVisitor, firstAdmin, firstVisitor] = await Promise.all([
            chatDb.message.findFirst({
              where: { conversationId: c.id, senderType: "visitor" },
              orderBy: { createdAt: "desc" },
              select: { createdAt: true }
            }),
            chatDb.message.findFirst({
              where: { conversationId: c.id, senderType: "admin" },
              orderBy: { createdAt: "asc" },
              select: { createdAt: true }
            }),
            chatDb.message.findFirst({
              where: { conversationId: c.id, senderType: "visitor" },
              orderBy: { createdAt: "asc" },
              select: { createdAt: true }
            })
          ]);
          const lastVisitorAt = lastVisitor?.createdAt?.getTime() ?? null;
          const firstAdminAt = firstAdmin?.createdAt?.getTime() ?? null;
          const firstVisitorAt = firstVisitor?.createdAt?.getTime() ?? null;
          let waitingSeconds = 0;
          if (lastVisitorAt && (!firstAdminAt || firstAdminAt < lastVisitorAt)) {
            waitingSeconds = Math.floor((now - lastVisitorAt) / 1000);
          }
          const firstResponseTimeSec =
            firstAdminAt != null && firstVisitorAt != null ? (firstAdminAt - firstVisitorAt) / 1000 : null;
          return {
            id: c.id,
            visitorSessionId: c.visitorSessionId,
            status: c.status,
            assignedStaff: c.assignedAdminId,
            lastMessageTime: lastVisitor?.createdAt?.toISOString() ?? null,
            waitingSeconds,
            firstResponseTimeSec
          };
        })
      );
      items.sort((a, b) => b.waitingSeconds - a.waitingSeconds);
      res.json({ items });
    })
  );

  app.get(
    "/chat/api/admin/search",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const q = typeof req.query.q === "string" ? sanitizePlainText(req.query.q, 120) : "";
      const scope = typeof req.query.scope === "string" ? req.query.scope : "messages";
      if (!q) return res.json({ ok: true, scope, q: "", results: [] });

      if (scope === "conversations") {
        const rows = await chatDb.conversation.findMany({
          where: {
            OR: [
              { id: { contains: q, mode: "insensitive" } },
              { visitorSessionId: { contains: q, mode: "insensitive" } }
            ]
          },
          orderBy: { updatedAt: "desc" },
          take: 50
        });
        void auditEvent({
          actorType: "admin",
          actorId: admin.adminId,
          action: "SEARCH_QUERY",
          ip: getIpFromHeaders(req.headers as HeaderRecord),
          detailJson: { scope, q }
        });
        return res.json({ ok: true, scope, q, results: rows });
      }

      if (scope === "tickets") {
        const rows = await chatDb.ticket.findMany({
          where: {
            OR: [
              { id: { contains: q, mode: "insensitive" } },
              { visitorSessionId: { contains: q, mode: "insensitive" } },
              { contact: { contains: q, mode: "insensitive" } },
              { bodyText: { contains: q, mode: "insensitive" } }
            ]
          },
          orderBy: { updatedAt: "desc" },
          take: 50
        });
        void auditEvent({
          actorType: "admin",
          actorId: admin.adminId,
          action: "SEARCH_QUERY",
          ip: getIpFromHeaders(req.headers as HeaderRecord),
          detailJson: { scope, q }
        });
        return res.json({ ok: true, scope, q, results: rows });
      }

      // Default: messages
      const rows = await chatDb.message.findMany({
        where: { bodyText: { contains: q, mode: "insensitive" } },
        orderBy: { createdAt: "desc" },
        take: 80
      });
      void auditEvent({
        actorType: "admin",
        actorId: admin.adminId,
        action: "SEARCH_QUERY",
        ip: getIpFromHeaders(req.headers as HeaderRecord),
        detailJson: { scope: "messages", q }
      });
      return res.json({
        ok: true,
        scope: "messages",
        q,
        results: rows.map((m: DbMessageRow) => ({ ...m, createdAt: m.createdAt.toISOString() }))
      });
    })
  );

  app.get(
    "/chat/api/admin/stats/basic",
    asyncHandler(async (req, res) => {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const fromStr = typeof req.query.from === "string" ? req.query.from : "";
      const toStr = typeof req.query.to === "string" ? req.query.to : "";
      const from = fromStr ? new Date(`${fromStr}T00:00:00.000Z`) : new Date(Date.now() - 7 * 86400 * 1000);
      const to = toStr ? new Date(`${toStr}T23:59:59.999Z`) : new Date();

      // Use SQL for performance (avoid N+1 queries).
      const [counts] = await chatDb.$queryRaw<
        Array<{
          conversations_opened: bigint;
          conversations_closed: bigint;
          messages_visitor: bigint;
          messages_admin: bigint;
          avg_first_response_sec: number | null;
          avg_resolution_sec: number | null;
        }>
      >`
        WITH conv AS (
          SELECT c.id, c."createdAt" AS created_at, c."closedAt" AS closed_at
          FROM "Conversation" c
          WHERE c."createdAt" BETWEEN ${from} AND ${to}
        ),
        mv AS (
          SELECT m."conversationId" AS cid, MIN(m."createdAt") AS first_visitor_at
          FROM "Message" m
          WHERE m."senderType" = 'visitor'
          GROUP BY m."conversationId"
        ),
        ma AS (
          SELECT m."conversationId" AS cid, MIN(m."createdAt") AS first_admin_at
          FROM "Message" m
          WHERE m."senderType" = 'admin'
          GROUP BY m."conversationId"
        ),
        first_resp AS (
          SELECT conv.id,
                 EXTRACT(EPOCH FROM (ma.first_admin_at - mv.first_visitor_at)) AS sec
          FROM conv
          JOIN mv ON mv.cid = conv.id
          JOIN ma ON ma.cid = conv.id
          WHERE ma.first_admin_at >= mv.first_visitor_at
        )
        SELECT
          (SELECT COUNT(*) FROM conv) AS conversations_opened,
          (SELECT COUNT(*) FROM "Conversation" c WHERE c."closedAt" BETWEEN ${from} AND ${to}) AS conversations_closed,
          (SELECT COUNT(*) FROM "Message" m WHERE m."senderType" = 'visitor' AND m."createdAt" BETWEEN ${from} AND ${to}) AS messages_visitor,
          (SELECT COUNT(*) FROM "Message" m WHERE m."senderType" = 'admin' AND m."createdAt" BETWEEN ${from} AND ${to}) AS messages_admin,
          (SELECT AVG(sec) FROM first_resp) AS avg_first_response_sec,
          (SELECT AVG(EXTRACT(EPOCH FROM (conv.closed_at - conv.created_at))) FROM conv WHERE conv.closed_at IS NOT NULL) AS avg_resolution_sec
      `;

      void auditEvent({
        actorType: "admin",
        actorId: admin.adminId,
        action: "STATS_BASIC",
        ip: getIpFromHeaders(req.headers as HeaderRecord),
        detailJson: { from: fromStr, to: toStr }
      });
      res.json({
        ok: true,
        from: from.toISOString(),
        to: to.toISOString(),
        stats: {
          conversations_opened: Number(counts?.conversations_opened ?? 0),
          conversations_closed: Number(counts?.conversations_closed ?? 0),
          messages_visitor: Number(counts?.messages_visitor ?? 0),
          messages_admin: Number(counts?.messages_admin ?? 0),
          avg_first_response_sec: typeof counts?.avg_first_response_sec === "number" ? counts.avg_first_response_sec : null,
          avg_resolution_sec: typeof counts?.avg_resolution_sec === "number" ? counts.avg_resolution_sec : null
        }
      });
    })
  );

  // Minimal widget loader (P0 widget body will be implemented in todo p0-widget-embed).
  app.get("/chat/widget/widget.js", (_req, res) => {
    res.setHeader("content-type", "application/javascript; charset=utf-8");
    res.send(getWidgetScript());
  });

  // Backwards-compat alias: some deploys/test scripts request widgetScript.js directly.
  // We serve the same loader script to avoid 404 surprises.
  app.get("/chat/widget/widgetScript.js", (_req, res) => {
    res.setHeader("content-type", "application/javascript; charset=utf-8");
    res.send(getWidgetScript());
  });

  // Serve socket.io client bundle locally (no CDN).
  app.get("/chat/widget/socket.io.min.js", (_req, res) => {
    // NOTE: require.resolve() may fail even if the file exists (package "exports" restrictions).
    // Prefer a direct on-disk lookup under node_modules, with a resolve() fallback.
    const candidates = [
      `${process.cwd()}/node_modules/socket.io/client-dist/socket.io.min.js`,
      `${process.cwd()}/node_modules/socket.io-client/dist/socket.io.min.js`
    ];

    let p: string | null = null;
    for (const c of candidates) {
      try {
        if (fs.existsSync(c)) {
          p = c;
          break;
        }
      } catch {
        // ignore
      }
    }

    if (!p) {
      try {
        const require = createRequire(import.meta.url);
        p = require.resolve("socket.io/client-dist/socket.io.min.js");
      } catch {
        // ignore
      }
    }

    if (!p) return res.status(500).send("/* socket.io client not found */");

    try {
      res.setHeader("content-type", "application/javascript; charset=utf-8");
      res.send(fs.readFileSync(p, "utf8"));
    } catch (e) {
      console.error("SOCKETIO_CLIENT_READ_FAIL", e instanceof Error ? e.message : String(e));
      res.status(500).send("/* socket.io client not found */");
    }
  });

  const httpServer = http.createServer(app);

function corsAllowOrigin(origin: string | undefined, allowlist: string[]) {
  if (!origin) return false;
  if (allowlist.length === 0) return false;
  return allowlist.includes(origin);
}

  // WS server for visitors
  const ioVisitor = new SocketIOServer(httpServer, {
    path: "/ws-visitor",
    cors: {
      origin: (origin, cb) => cb(null, corsAllowOrigin(origin ?? undefined, config.chatAllowedOrigins)),
      credentials: false
    },
    serveClient: false
  });

  // WS server for admins
  const ioAdmin = new SocketIOServer(httpServer, {
    path: "/ws-admin",
    cors: {
      origin: (origin, cb) => cb(null, corsAllowOrigin(origin ?? undefined, config.adminAllowedOrigins)),
      credentials: true
    },
    serveClient: false
  });

function safeParse<T extends z.ZodTypeAny>(schema: T, payload: unknown) {
  const parsed = schema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}

  ioVisitor.on("connection", (socket) => {
  const ip = getIpFromHeaders(socket.handshake.headers as Record<string, string | string[] | undefined>);
  const ua = typeof socket.handshake.headers["user-agent"] === "string" ? socket.handshake.headers["user-agent"] : null;

  void (async () => {
    // IP block check (P0).
    const block = await chatDb.ipBlock.findUnique({ where: { ip } }).catch(() => null);
    if (block) {
      const expired = block.expiresAt ? block.expiresAt.getTime() <= Date.now() : false;
      if (!expired) {
        await auditEvent({ actorType: "system", action: "VISITOR_BLOCKED", ip, detailJson: { reason: block.reason } });
        socket.emit("error", { error: "IP_BLOCKED" });
        socket.disconnect(true);
      }
    }
  })();

  socket.onAny((eventName) => {
    // P0 event allowlist. Unknown event is ignored (and will be audited once DB exists).
    const allowed = new Set(["visitor_hello", "visitor_message", "visitor_typing"]);
    if (!allowed.has(String(eventName))) {
      void auditEvent({ actorType: "visitor", action: "INVALID_EVENT", ip, detailJson: { eventName } });
      socket.emit("error", { error: "INVALID_EVENT" });
    }
  });

  socket.on("visitor_hello", (payload) => {
    const p = safeParse(VisitorHelloSchema, payload);
    if (!p) return socket.emit("error", { error: "INVALID_INPUT" });
    const sessionId = sanitizePlainText(p.sessionId, 128);
    if (!sessionId) return socket.emit("error", { error: "INVALID_INPUT" });
    const entryUrl = sanitizePlainText(p.entryUrl ?? "", 2048) || null;
    const referrer = sanitizePlainText(p.referrer ?? "", 2048) || null;

    void (async () => {
      const existing = await chatDb.conversation.findFirst({
        where: { visitorSessionId: sessionId, status: { in: ["open", "assigned"] } },
        orderBy: { updatedAt: "desc" }
      });
      const c =
        existing ??
        (await chatDb.conversation.create({
          data: {
            status: "open",
            visitorSessionId: sessionId,
            visitorIp: ip,
            visitorUa: ua,
            entryUrl,
            referrer
          }
        }));

      socket.join(`visitor:${c.id}`);
      socket.emit("conversation_open", { conversationId: c.id, status: c.status });
      const history = await chatDb.message.findMany({
        where: { conversationId: c.id },
        orderBy: { createdAt: "asc" },
        take: 100
      });
      socket.emit(
        "message_history",
        (history as DbMessageRow[]).map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))
      );
      const botCfg = await loadBotConfigCached();
      const nowMs = Date.now();
      const botActive = botCfg.enabled && isNowInSchedule(botCfg, nowMs);
      if (botActive && botCfg.welcomeEnabled && botCfg.welcomeReply && history.length === 0) {
        const botRow = await chatDb.message.create({
          data: {
            conversationId: c.id,
            senderType: "system",
            bodyText: botCfg.welcomeReply,
            ip,
            sessionId: c.visitorSessionId
          }
        });
        const botMsg = { ...botRow, createdAt: botRow.createdAt.toISOString() };
        ioVisitor.to(`visitor:${c.id}`).emit("message_new", botMsg);
        ioAdmin.to(`admin:${c.id}`).emit("message_new", botMsg);
      }
      ioAdmin.emit("conversation_update", { conversationId: c.id, status: c.status, assignedTo: c.assignedAdminId ?? null });
      await auditEvent({ actorType: "visitor", action: "CONVERSATION_OPEN", ip, sessionId, conversationId: c.id });
    })();
  });

  socket.on("visitor_message", (payload) => {
    const p = safeParse(VisitorMessageSchema, payload);
    if (!p) return socket.emit("error", { error: "INVALID_INPUT" });

    const cooldown = enforceCooldown(`ws:${ip}:visitor`, config.wsSessionCooldownMs);
    if (!cooldown.ok) return socket.emit("error", { error: "COOLDOWN" });
    const bucket = rateLimit(`ws:${ip}:visitor`, config.wsRatePerMinute, 60 * 1000);
    if (!bucket.ok) return socket.emit("error", { error: "RATE_LIMITED" });

    const bodyText = sanitizePlainText(p.bodyText, 1000);
    if (!bodyText) return;

    const convId = p.conversationId ? sanitizePlainText(p.conversationId, 64) : "";
    if (!convId) return socket.emit("error", { error: "CONVERSATION_NOT_FOUND" });

    void (async () => {
      const c = await chatDb.conversation.findUnique({ where: { id: convId } });
      if (!c || c.status === "closed") return socket.emit("error", { error: "CONVERSATION_NOT_FOUND" });
      const row = await chatDb.message.create({
        data: {
          conversationId: c.id,
          senderType: "visitor",
          bodyText,
          ip,
          sessionId: c.visitorSessionId
        }
      });
      const msg = { ...row, createdAt: row.createdAt.toISOString() };
      ioVisitor.to(`visitor:${c.id}`).emit("message_new", msg);
      ioAdmin.to(`admin:${c.id}`).emit("message_new", msg);
      const botCfg = await loadBotConfigCached();
      const nowMs = Date.now();
      const botActive = botCfg.enabled && isNowInSchedule(botCfg, nowMs);
      const pausedByAssign = botCfg.pauseWhenAssigned && Boolean(c.assignedAdminId);
      if (botActive && !pausedByAssign) {
        const lower = bodyText.toLowerCase();
        const blacklisted = botCfg.blacklistKeywords.some((k) => lower.includes(k));
        const whitelisted = botCfg.whitelistKeywords.length === 0 || botCfg.whitelistKeywords.some((k) => lower.includes(k));
        const matchedRule = !blacklisted && whitelisted
          ? botCfg.rules.find((r) => r.enabled && r.keyword && matchRule(r, lower))
          : undefined;
        const autoReply = matchedRule?.reply || (!c.assignedAdminId && botCfg.offlineEnabled ? botCfg.offlineReply : "");
        if (autoReply) {
          let cooldownBlocked = false;
          if (matchedRule && matchedRule.cooldownSec > 0) {
            const recentEvents = await chatDb.event.findMany({
              where: { action: "BOT_AUTO_REPLY", conversationId: c.id },
              orderBy: { createdAt: "desc" },
              take: 40
            });
            const lastHit = recentEvents.find((ev: { createdAt: Date; detailJson: unknown }) => {
              const d = ev.detailJson && typeof ev.detailJson === "object" ? (ev.detailJson as Record<string, unknown>) : null;
              return d?.ruleId === matchedRule.id;
            });
            if (lastHit) {
              cooldownBlocked = nowMs - lastHit.createdAt.getTime() < matchedRule.cooldownSec * 1000;
            }
          }
          const lastBot = await chatDb.message.findFirst({
            where: { conversationId: c.id, senderType: "system" },
            orderBy: { createdAt: "desc" }
          });
          const tooSoon = lastBot && lastBot.bodyText === autoReply && Date.now() - lastBot.createdAt.getTime() < 20_000;
          if (!tooSoon && !cooldownBlocked) {
            const botRow = await chatDb.message.create({
              data: {
                conversationId: c.id,
                senderType: "system",
                bodyText: autoReply,
                ip,
                sessionId: c.visitorSessionId
              }
            });
            const botMsg = { ...botRow, createdAt: botRow.createdAt.toISOString() };
            ioVisitor.to(`visitor:${c.id}`).emit("message_new", botMsg);
            ioAdmin.to(`admin:${c.id}`).emit("message_new", botMsg);
            if (matchedRule?.autoTag) {
              const tag = matchedRule.autoTag;
              const exists = await chatDb.conversationTag.findFirst({ where: { conversationId: c.id, tag } });
              if (!exists) {
                await chatDb.conversationTag.create({ data: { conversationId: c.id, tag } });
              }
            }
            if (matchedRule?.createTicket) {
              await chatDb.ticket.create({
                data: {
                  conversationId: c.id,
                  visitorSessionId: c.visitorSessionId,
                  visitorIp: ip,
                  visitorUa: ua,
                  bodyText: `BOT_RULE_HIT: ${matchedRule.keyword}`,
                  status: "open"
                }
              });
            }
            await auditEvent({
              actorType: "system",
              action: "BOT_AUTO_REPLY",
              ip,
              sessionId: c.visitorSessionId,
              conversationId: c.id,
              detailJson: {
                by: matchedRule ? "rule" : "offline",
                keyword: matchedRule?.keyword ?? null,
                priority: matchedRule?.priority ?? null,
                matchMode: matchedRule?.matchMode ?? null,
                group: matchedRule?.group ?? null,
                ruleId: matchedRule?.id ?? null,
                autoTag: matchedRule?.autoTag ?? null,
                createTicket: matchedRule?.createTicket ?? false,
                blockedByBlacklist: blacklisted,
                blockedByWhitelist: !whitelisted
              }
            });
          }
        }
      }
      await auditEvent({ actorType: "visitor", action: "MESSAGE_SEND", ip, sessionId: c.visitorSessionId, conversationId: c.id });
    })();
    });
  });

  ioAdmin.on("connection", (socket) => {
  const ip = getIpFromHeaders(socket.handshake.headers as Record<string, string | string[] | undefined>);
  let adminId: string | null = null;
  let role: string | null = null;

  socket.onAny((eventName) => {
    const allowed = new Set(["admin_auth", "admin_join", "admin_message", "admin_close", "admin_assign"]);
    if (!allowed.has(String(eventName))) {
      void auditEvent({ actorType: "admin", actorId: adminId, action: "INVALID_EVENT", ip, detailJson: { eventName } });
      socket.emit("error", { error: "INVALID_EVENT" });
    }
  });

  socket.on("admin_auth", (payload) => {
    const p = safeParse(AdminAuthSchema, payload);
    if (!p) return socket.emit("error", { error: "INVALID_INPUT" });
    const claims = verifyAdminJwt(p.token);
    if (!claims) return socket.emit("error", { error: "UNAUTHORIZED" });
    adminId = claims.sub;
    role = typeof claims.role === "string" ? claims.role : null;
    void auditEvent({ actorType: "admin", actorId: adminId, action: "ADMIN_AUTH_OK", ip, detailJson: { role } });
    socket.emit("admin_authed", { ok: true, adminId, role });
  });

  socket.on("admin_join", (payload) => {
    if (!adminId) return socket.emit("error", { error: "UNAUTHORIZED" });
    const p = safeParse(AdminJoinSchema, payload);
    if (!p) return socket.emit("error", { error: "INVALID_INPUT" });
    const convId = sanitizePlainText(p.conversationId, 64);
    void (async () => {
      const c = await chatDb.conversation.findUnique({ where: { id: convId } });
      if (!c) return socket.emit("error", { error: "CONVERSATION_NOT_FOUND" });
      socket.join(`admin:${convId}`);
      socket.emit("conversation_open", { conversationId: convId, status: c.status });
      const history = await chatDb.message.findMany({
        where: { conversationId: convId },
        orderBy: { createdAt: "asc" },
        take: 50
      });
      socket.emit(
        "message_history",
        (history as DbMessageRow[]).map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))
      );
      await auditEvent({ actorType: "admin", actorId: adminId, action: "ADMIN_JOIN", ip, conversationId: convId });
    })();
  });

  socket.on("admin_assign", (payload) => {
    if (!adminId) return socket.emit("error", { error: "UNAUTHORIZED" });
    const p = safeParse(AdminAssignSchema, payload);
    if (!p) return socket.emit("error", { error: "INVALID_INPUT" });
    const convId = sanitizePlainText(p.conversationId, 64);
    void (async () => {
      const c = await chatDb.conversation.findUnique({ where: { id: convId } });
      if (!c || c.status === "closed") return socket.emit("error", { error: "CONVERSATION_NOT_FOUND" });
      const next = await chatDb.conversation.update({
        where: { id: convId },
        data: { status: "assigned", assignedAdminId: adminId }
      });
      ioAdmin.emit("conversation_update", {
        conversationId: convId,
        status: next.status,
        assignedTo: next.assignedAdminId ?? null
      });
      socket.emit("conversation_update", {
        conversationId: convId,
        status: next.status,
        assignedTo: next.assignedAdminId ?? null
      });
      await auditEvent({ actorType: "admin", actorId: adminId, action: "ADMIN_ASSIGN", ip, conversationId: convId });
    })();
  });

  socket.on("admin_message", (payload) => {
    if (!adminId) return socket.emit("error", { error: "UNAUTHORIZED" });
    const p = safeParse(AdminMessageSchema, payload);
    if (!p) return socket.emit("error", { error: "INVALID_INPUT" });

    const cooldown = enforceCooldown(`ws:${ip}:admin:${adminId}`, config.wsSessionCooldownMs);
    if (!cooldown.ok) return socket.emit("error", { error: "COOLDOWN" });
    const bucket = rateLimit(`ws:${ip}:admin:${adminId}`, config.wsRatePerMinute, 60 * 1000);
    if (!bucket.ok) return socket.emit("error", { error: "RATE_LIMITED" });

    const bodyText = sanitizePlainText(p.bodyText, 2000);
    if (!bodyText) return;
    const convId = sanitizePlainText(p.conversationId, 64);
    void (async () => {
      const c = await chatDb.conversation.findUnique({ where: { id: convId } });
      if (!c || c.status === "closed") return socket.emit("error", { error: "CONVERSATION_NOT_FOUND" });
      const row = await chatDb.message.create({
        data: {
          conversationId: convId,
          senderType: "admin",
          adminId,
          bodyText,
          ip
        }
      });
      const msg = { ...row, createdAt: row.createdAt.toISOString() };
      ioAdmin.to(`admin:${convId}`).emit("message_new", msg);
      ioVisitor.to(`visitor:${convId}`).emit("message_new", msg);
      await auditEvent({ actorType: "admin", actorId: adminId, action: "MESSAGE_SEND", ip, conversationId: convId });
    })();
  });

  socket.on("admin_close", (payload) => {
    if (!adminId) return socket.emit("error", { error: "UNAUTHORIZED" });
    const p = safeParse(AdminCloseSchema, payload);
    if (!p) return socket.emit("error", { error: "INVALID_INPUT" });
    const convId = sanitizePlainText(p.conversationId, 64);
    void (async () => {
      const c = await chatDb.conversation.findUnique({ where: { id: convId } });
      if (!c) return socket.emit("error", { error: "CONVERSATION_NOT_FOUND" });
      const next = await chatDb.conversation.update({
        where: { id: convId },
        data: { status: "closed", closedAt: new Date() }
      });
      ioAdmin.emit("conversation_update", { conversationId: convId, status: next.status });
      ioVisitor.to(`visitor:${convId}`).emit("conversation_update", { conversationId: convId, status: next.status });
      await auditEvent({ actorType: "admin", actorId: adminId, action: "ADMIN_CLOSE", ip, conversationId: convId });
    })();
  });
  });

  httpServer.listen(config.port, () => {
    console.log(`SERVER_OK port=${config.port}`);
    console.log("DB_OK");
    console.log("WS_OK visitor=/ws-visitor admin=/ws-admin");
    console.log("P0_OK: chat_widget + admin_panel + message_persist");
    console.log("P1_OK: tickets + canned_replies + tags_notes_search + stats_basic");
  });

  const shutdown = async () => {
    try {
      await chatDb.$disconnect();
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGTERM", () => void shutdown());
  process.on("SIGINT", () => void shutdown());
}

void main();

