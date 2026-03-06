// Auto-select Prisma schema based on DATABASE_URL.
// This repo supports both SQLite (local dev) and Postgres (prod).
require("dotenv/config");

const { execSync } = require("node:child_process");

function pickSchema(databaseUrl) {
  const url = (databaseUrl || "").trim().replace(/^"|"$/g, "");
  if (url.startsWith("file:")) return "prisma/schema.sqlite.prisma";
  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) return "prisma/schema.postgres.prisma";
  return null;
}

const schema = pickSchema(process.env.DATABASE_URL);
if (!schema) {
  console.error("prisma-generate-auto: Unsupported DATABASE_URL. Expected file: or postgresql://");
  process.exit(1);
}

console.log(`prisma-generate-auto: using ${schema}`);

async function main() {
  try {
    execSync(`npx prisma generate --schema ${schema}`, { stdio: "inherit" });
  } catch (e) {
    const msg = (e && e.message) ? String(e.message) : String(e);
    const stderr = (e && e.stderr) ? (Buffer.isBuffer(e.stderr) ? e.stderr.toString() : String(e.stderr)) : "";
    const full = msg + stderr + (e && e.stdout ? (Buffer.isBuffer(e.stdout) ? e.stdout.toString() : String(e.stdout)) : "") + String(e);
    // EPERM 有时只在子进程 stderr 里，或表现为 rename + .dll.node 失败
    const isEperm = full.includes("EPERM") || full.includes("operation not permitted") || msg.includes("EPERM") || msg.includes("operation not permitted");
    const isWindowsFileLock = (msg.includes("rename") || full.includes("rename")) && (msg.includes(".dll.node") || full.includes(".dll.node") || full.includes("query_engine"));
    // 若 prisma generate 失败（常见为 Windows 下文件被占用），放行继续启动 dev，避免卡住
    const isPrismaGenerateFail = msg.includes("Command failed") && msg.includes("prisma generate");
    if (isEperm || isWindowsFileLock || isPrismaGenerateFail) {
      console.warn("");
      console.warn("prisma-generate-auto: generate 失败（多为文件被占用）. 若之前已成功 generate 过，dev 会照常启动.");
      console.warn("要重新生成: 关掉 Cursor，新开 PowerShell，执行 .\\scripts\\prisma-generate-fix.ps1");
      console.warn("");
      process.exitCode = 0;
      return;
    }
    throw e;
  }
}

main().catch((e) => {
  // Preserve original failure behavior for npm scripts.
  process.exitCode = 1;
  throw e;
});

