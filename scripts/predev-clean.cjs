// 每次 npm run dev 前自动执行：释放 3000 端口、删除 .next/dev/lock，避免「端口被占用」「Unable to acquire lock」
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const root = path.join(__dirname, "..");
const lockDir = path.join(root, ".next", "dev", "lock");

try {
  if (fs.existsSync(lockDir)) {
    fs.rmSync(lockDir, { recursive: true });
    console.log("predev-clean: removed .next/dev/lock");
  }
} catch (e) {
  // 忽略删除失败
}

if (process.platform === "win32") {
  try {
    const ps = path.join(root, "scripts", "kill-port-3000.ps1");
    execSync(`powershell -ExecutionPolicy Bypass -File "${ps}"`, {
      cwd: root,
      stdio: "pipe"
    });
  } catch (e) {
    // 脚本可能因端口本就空闲而无输出，忽略
  }
}
