import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().max(120),
  password: z.string().min(8).max(128)
});

const blockBase = z.object({
  id: z.string().min(1),
  type: z.enum(["h1", "p", "list", "button", "image"])
});

const httpUrl = z
  .url()
  .max(2048)
  .refine((value) => {
    try {
      const protocol = new URL(value).protocol.toLowerCase();
      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  }, "ONLY_HTTP_HTTPS_URL_ALLOWED");

export const blockSchema = z.discriminatedUnion("type", [
  blockBase.extend({ type: z.literal("h1"), text: z.string().min(1).max(200) }),
  blockBase.extend({ type: z.literal("p"), text: z.string().min(1).max(5000) }),
  blockBase.extend({
    type: z.literal("list"),
    items: z.array(z.string().min(1).max(500)).min(1).max(50)
  }),
  blockBase.extend({
    type: z.literal("button"),
    label: z.string().min(1).max(60),
    url: httpUrl
  }),
  blockBase.extend({ type: z.literal("image"), url: httpUrl })
]);

export const promotionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(120),
  subtitle: z.string().max(280).optional().nullable(),
  coverUrl: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    httpUrl.nullable()
  ),
  percent: z.coerce.number().min(0).max(999.99).default(0),
  startAt: z.coerce.date().optional().nullable(),
  endAt: z.coerce.date().optional().nullable(),
  isClaimable: z.boolean().default(true),
  ruleJson: z.record(z.string(), z.unknown()).default({}),
  isActive: z.boolean().default(true),
  sortOrder: z.int().min(0).max(9999).default(0),
  detailJson: z.object({
    blocks: z.array(blockSchema).max(100)
  })
});

export const uploadSignSchema = z.object({
  filename: z.string().min(1).max(255),
  // SVG is intentionally disabled (can embed scripts).
  mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]),
  size: z.number().max(2 * 1024 * 1024),
  /**
   * Optional deterministic object key for overwrite mode.
   * - Must be a relative POSIX-like path (no leading slash)
   * - No ".." segments
   * - Safe characters only
   */
  objectKey: z
    .string()
    .min(1)
    .max(512)
    .regex(/^[A-Za-z0-9][A-Za-z0-9._/-]*$/, "INVALID_OBJECT_KEY")
    .refine((k) => !k.startsWith("/") && !k.includes(".."), "INVALID_OBJECT_KEY")
    .optional()
});
