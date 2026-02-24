// 根据 CHAT_DATABASE_URL 自动选择 SQLite 或 Postgres，一条命令通用
const path = require("node:path");
const { execSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
require("dotenv").config({ path: path.join(root, ".env") });

const url = (process.env.CHAT_DATABASE_URL || "").trim().replace(/^"|"$/g, "");

let schema;
if (url.startsWith("file:")) {
  schema = "prisma/schema.sqlite.prisma";
} else if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
  schema = "prisma/schema.prisma";
} else {
  console.error("prisma-generate-auto: CHAT_DATABASE_URL 需为 file: 或 postgresql://");
  process.exit(1);
}

console.log("prisma-generate-auto: using " + schema);

const opts = { cwd: root, stdio: "inherit" };
const fs = require("node:fs");
const enginePath = path.join(root, "node_modules", ".prisma", "client", "query_engine-windows.dll.node");

function runGenerate() {
  execSync(`npx prisma generate --schema ${schema}`, opts);
}

function isEpermError(e) {
  const msg = (e && e.message) ? String(e.message) : String(e);
  const full = msg + (e && e.stack ? String(e.stack) : "");
  return /EPERM|operation not permitted|rename.*\.dll\.node|Command failed.*prisma generate/i.test(full);
}

let generateOk = false;
const maxTries = 3;
for (let i = 0; i < maxTries; i++) {
  try {
    runGenerate();
    generateOk = true;
    break;
  } catch (e) {
    if (!isEpermError(e) && i < maxTries - 1) {
      try {
        execSync("ping -n 3 127.0.0.1 >nul", { cwd: root, stdio: "ignore" });
      } catch {}
      continue;
    }
    if (isEpermError(e) && i < maxTries - 1) {
      console.warn("prisma-generate-auto: 文件被占用，2 秒后重试 (" + (i + 2) + "/" + maxTries + ")...");
      try {
        execSync("ping -n 3 127.0.0.1 >nul", { cwd: root, stdio: "ignore" });
      } catch {
        const now = Date.now();
        while (Date.now() - now < 2000) {}
      }
      continue;
    }
    if (isEpermError(e)) {
      const engineExists = (() => {
        try {
          return fs.existsSync(enginePath) && fs.statSync(enginePath).size > 0;
        } catch {
          return false;
        }
      })();
      console.warn("");
      if (engineExists) {
        console.warn("prisma-generate-auto: generate 因文件被占用跳过，使用已有 Client 继续启动。");
      } else {
        console.warn("prisma-generate-auto: 多次重试仍失败。请关闭占用该目录的软件（杀毒/IDE）或新开 PowerShell 再试。");
        console.warn("若之前已成功 generate 过，可直接运行: npx tsx watch src/index.ts");
      }
      console.warn("");
      process.exit(0);
    }
    throw e;
  }
}

if (generateOk && schema.includes("sqlite")) {
  try {
    execSync(`npx prisma db push --schema ${schema}`, opts);
    console.log("prisma-generate-auto: SQLite db push done.");
  } catch (e) {
    console.warn("prisma-generate-auto: db push 失败:", e && e.message ? e.message : e);
    process.exit(1);
  }
}
