/**
 * 一次性写好 Live Chat 需要的 .env（主站 + chat-server）
 * 用法：在项目根目录执行 node scripts/setup-live-chat-env.cjs
 * 会：生成同一个 CHAT_ADMIN_JWT_SECRET、写入主站 .env 和 services/chat-server/.env，并补全 CHAT_SERVER_INTERNAL_URL 等
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ROOT_ENV = path.join(ROOT, ".env");
const ROOT_EXAMPLE = path.join(ROOT, ".env.example");
const CHAT_DIR = path.join(ROOT, "services", "chat-server");
const CHAT_ENV = path.join(CHAT_DIR, ".env");
const CHAT_EXAMPLE = path.join(CHAT_DIR, ".env.example");

function randomSecret(length = 32) {
  const buf = require("crypto").randomBytes(length);
  return buf.toString("hex");
}

function readLines(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, "utf8").split(/\r?\n/);
}

function setOrAppend(lines, key, value) {
  const prefix = key + "=";
  let found = false;
  const next = lines.map((line) => {
    if (line.startsWith(prefix)) {
      found = true;
      return prefix + (typeof value === "string" ? value : JSON.stringify(value));
    }
    return line;
  });
  if (!found) next.push(prefix + value);
  return next;
}

function writeLines(filePath, lines) {
  fs.writeFileSync(filePath, lines.join("\n") + "\n", "utf8");
}

const jwtSecret = randomSecret(32);
const chatInternalUrl = "http://127.0.0.1:4000";
const chatAllowed = "https://admin1167.com,http://localhost:3000";
const adminAllowed = "https://admin1167.net,http://localhost:3000";

console.log("=== Live Chat .env 一键写入 ===\n");

// 主站 .env
if (!fs.existsSync(ROOT_ENV) && fs.existsSync(ROOT_EXAMPLE)) {
  fs.copyFileSync(ROOT_EXAMPLE, ROOT_ENV);
  console.log("已从 .env.example 复制创建 .env");
}
let rootLines = readLines(ROOT_ENV);
rootLines = setOrAppend(rootLines, "CHAT_SERVER_INTERNAL_URL", chatInternalUrl);
rootLines = setOrAppend(rootLines, "CHAT_ADMIN_JWT_SECRET", jwtSecret);
writeLines(ROOT_ENV, rootLines);
console.log("主站 .env：已写入 CHAT_SERVER_INTERNAL_URL、CHAT_ADMIN_JWT_SECRET");

// chat-server .env
if (!fs.existsSync(CHAT_ENV) && fs.existsSync(CHAT_EXAMPLE)) {
  fs.copyFileSync(CHAT_EXAMPLE, CHAT_ENV);
  console.log("已从 services/chat-server/.env.example 复制创建 .env");
}
let chatLines = readLines(CHAT_ENV);
chatLines = setOrAppend(chatLines, "CHAT_ADMIN_JWT_SECRET", jwtSecret);
chatLines = setOrAppend(chatLines, "CHAT_ALLOWED_ORIGINS", chatAllowed);
chatLines = setOrAppend(chatLines, "ADMIN_ALLOWED_ORIGINS", adminAllowed);
chatLines = setOrAppend(chatLines, "CHAT_SERVER_PORT", "4000");
chatLines = setOrAppend(chatLines, "CHAT_DATABASE_URL", "file:./dev.chat.db");
writeLines(CHAT_ENV, chatLines);
console.log("chat-server .env：已写入 CHAT_ADMIN_JWT_SECRET（与主站一致）、CHAT_ALLOWED_ORIGINS、ADMIN_ALLOWED_ORIGINS");

console.log("\n完成。主站与 chat-server 的 JWT 已一致，可直接启动。");
console.log("检查：powershell -ExecutionPolicy Bypass -File .\\scripts\\check-live-chat-env.ps1\n");
