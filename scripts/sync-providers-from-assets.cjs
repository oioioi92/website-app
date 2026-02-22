/**
 * Sync providers into DB from local public assets.
 *
 * Goal: you drop PNGs into `public/assets/providers/*.png`,
 * then this script ensures `GameProvider` rows exist so:
 * - Public home shows providers (not 0 providers)
 * - Admin Providers list is populated and shows images
 *
 * Usage:
 *   node scripts/sync-providers-from-assets.cjs
 *   node scripts/sync-providers-from-assets.cjs --dry-run
 *   node scripts/sync-providers-from-assets.cjs --only=slot
 */
require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const NON_GAME_KEYS = ["history", "home-button", "promotion", "livechat", "setting"];

function parseArgs(argv) {
  const out = { dryRun: false, only: "all" };
  for (const a of argv.slice(2)) {
    if (a === "--dry-run") out.dryRun = true;
    if (a.startsWith("--only=")) out.only = String(a.split("=").slice(1).join("=") || "all").toLowerCase();
  }
  return out;
}

function normalizeKey(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function isNonGameFileBase(base) {
  const key = normalizeKey(base);
  return NON_GAME_KEYS.some((x) => key.includes(normalizeKey(x)));
}

function titleFromBase(base) {
  // Keep it simple: show readable but stable.
  // e.g. "pragmatic-play-live" -> "PRAGMATIC PLAY LIVE"
  return base
    .replace(/[-_]+/g, " ")
    .trim()
    .toUpperCase();
}

function inferOnlyCategory(base) {
  // Very light filter for "--only=slot" mode.
  // If you want exact categories, maintain a dedicated list instead.
  const s = base.toUpperCase();
  if (/SPORT|SBO|M8BET|M9BET|BTI|CMD|SABA|IB C|SBOBET/.test(s)) return "sportbook";
  if (/LIVE|CASINO|EVOLUTION|WM|EZUGI|PLAYACE|SEXY|BACCARAT|SA[-_ ]?GAMING|MT[-_ ]?LIVE/.test(s)) return "casino";
  if (/FISH|FISHING|JDB|YOULIAN|YL|PLAYSTAR|SPADE|JILI|JOKER|CQ9|YELLOW[-_ ]?BAT|YGR|FA[-_ ]?CHAI|MT/.test(s))
    return "fishing";
  return "slot";
}

async function main() {
  const args = parseArgs(process.argv);

  const assetsDir = path.join(process.cwd(), "public", "assets", "providers");
  if (!fs.existsSync(assetsDir)) {
    console.error("providers assets dir not found:", assetsDir);
    process.exit(1);
  }

  const files = fs
    .readdirSync(assetsDir)
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .map((f) => ({ file: f, base: f.replace(/\.png$/i, "") }))
    .filter((x) => x.base && !isNonGameFileBase(x.base))
    .filter((x) => {
      if (args.only === "all") return true;
      return inferOnlyCategory(x.base) === args.only;
    })
    .sort((a, b) => a.base.localeCompare(b.base));

  const db = new PrismaClient();
  const created = [];
  const updated = [];
  const kept = [];
  const deactivatedDemo = [];

  try {
    const existingAll = await db.gameProvider.findMany({
      select: { id: true, name: true, code: true, logoUrl: true, isActive: true, sortOrder: true }
    });
    const byCode = new Map();
    const byName = new Map();
    for (const p of existingAll) {
      const kCode = normalizeKey(p.code);
      const kName = normalizeKey(p.name);
      if (kCode && !byCode.has(kCode)) byCode.set(kCode, p);
      if (kName && !byName.has(kName)) byName.set(kName, p);
    }

    // Use a deterministic sortOrder by filename.
    for (let i = 0; i < files.length; i++) {
      const { file, base } = files[i];
      const code = base.toUpperCase();
      const name = titleFromBase(base);
      const logoUrl = `/assets/providers/${file}`;
      const sortOrder = i;

      // Find existing by code first, then by name.
      const existing = byCode.get(normalizeKey(code)) || byName.get(normalizeKey(name)) || null;

      if (!existing) {
        if (!args.dryRun) {
          await db.gameProvider.create({
            data: { name, code, logoUrl, isActive: true, sortOrder }
          });
        }
        created.push(base);
        continue;
      }

      // Keep user custom logoUrl if it's not empty and not a demo URL.
      const nextLogo =
        typeof existing.logoUrl === "string" && existing.logoUrl.trim().length > 0 && !existing.logoUrl.includes("picsum.photos")
          ? existing.logoUrl
          : logoUrl;

      const needsUpdate =
        normalizeKey(existing.code) !== normalizeKey(code) ||
        normalizeKey(existing.name) !== normalizeKey(name) ||
        normalizeKey(existing.logoUrl) !== normalizeKey(nextLogo) ||
        existing.isActive !== true ||
        existing.sortOrder !== sortOrder;

      if (needsUpdate) {
        if (!args.dryRun) {
          await db.gameProvider.update({
            where: { id: existing.id },
            data: { name, code, logoUrl: nextLogo, isActive: true, sortOrder }
          });
        }
        updated.push(base);
      } else {
        kept.push(base);
      }
    }

    // Deactivate demo-seeded providers (picsum / "Game N") so they won't pollute the curated grid.
    // This is safe even in prod because it targets obvious placeholders only.
    const demoCandidates = existingAll.filter((p) => {
      const n = String(p.name || "").trim();
      const u = String(p.logoUrl || "").trim();
      // Covers "Game 2" and "Game2" and "GAME_2" style.
      if (/^game[\s_-]*\d+$/i.test(n)) return true;
      if (/^provider[\s_-]*\d+$/i.test(n)) return true;
      if (u.toLowerCase().includes("picsum.photos/")) return true;
      return false;
    });
    for (const p of demoCandidates) {
      if (p.isActive === false) continue;
      if (!args.dryRun) {
        await db.gameProvider.update({ where: { id: p.id }, data: { isActive: false } });
      }
      deactivatedDemo.push(p.name);
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          only: args.only,
          dryRun: args.dryRun,
          assetsCount: files.length,
          created: created.length,
          updated: updated.length,
          kept: kept.length,
          deactivatedDemo: deactivatedDemo.length
        },
        null,
        2
      )
    );
  } catch (e) {
    console.error("SYNC_PROVIDERS_ERROR", e && e.message ? e.message : String(e));
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}

main();

