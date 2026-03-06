// 供 concurrently 调用：在 services/chat-server 下执行 npm run dev，与主站同终端同启同停
const path = require("node:path");
const { spawn } = require("node:child_process");

const root = path.join(__dirname, "..");
const chatRoot = path.join(root, "services", "chat-server");

const isWin = process.platform === "win32";
const child = spawn(isWin ? "npm.cmd" : "npm", ["run", "dev"], {
  cwd: chatRoot,
  stdio: "inherit",
  shell: true
});

child.on("exit", (code, signal) => {
  process.exit(code != null ? code : signal ? 1 : 0);
});
child.on("error", (err) => {
  console.error("start-chat-server-dev:", err.message);
  process.exit(1);
});
