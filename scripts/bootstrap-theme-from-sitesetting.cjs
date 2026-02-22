// Phase 1 bootstrap:
// Copy SiteSetting(key="theme_json") into Theme(key="default", version=1).
// Safe to run multiple times (no-op if Theme row exists).

require("dotenv/config");

const { PrismaClient } = require("@prisma/client");

async function main() {
  const db = new PrismaClient();
  try {
    const themeKey = "default";

    const existing = await db.theme.findUnique({ where: { key: themeKey } }).catch(() => null);
    if (existing) {
      console.log(JSON.stringify({ ok: true, action: "noop", reason: "theme_exists", key: themeKey, version: existing.version }, null, 2));
      return;
    }

    const setting = await db.siteSetting.findUnique({ where: { key: "theme_json" }, select: { valueJson: true } });
    if (!setting) {
      console.log(JSON.stringify({ ok: false, error: "site_setting_theme_json_missing" }, null, 2));
      process.exitCode = 2;
      return;
    }

    // updatedByAdminId: we don't have a safe default here in script mode.
    // Use the first admin user as bootstrapper (or set THEME_BOOTSTRAP_ADMIN_ID).
    const adminIdFromEnv = (process.env.THEME_BOOTSTRAP_ADMIN_ID || "").trim();
    let adminId = adminIdFromEnv;
    if (!adminId) {
      const admin = await db.adminUser.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
      adminId = admin?.id || "";
    }
    if (!adminId) {
      console.log(JSON.stringify({ ok: false, error: "no_admin_user_found", hint: "set THEME_BOOTSTRAP_ADMIN_ID" }, null, 2));
      process.exitCode = 3;
      return;
    }

    const row = await db.theme.create({
      data: {
        key: themeKey,
        version: 1,
        themeJson: setting.valueJson,
        updatedByAdminId: adminId
      },
      select: { id: true, key: true, version: true }
    });

    console.log(JSON.stringify({ ok: true, action: "created", theme: row }, null, 2));
  } finally {
    await db.$disconnect().catch(() => {});
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

