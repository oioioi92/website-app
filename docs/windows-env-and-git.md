# Windows PowerShell：环境变量与 Git 正确用法

## 〇、若出现 “fatal: 'Website/.git' not recognized as a git repository”

先**关掉当前 PowerShell**，重新开一个**全新的** PowerShell 窗口（不要从 Cursor/VS Code 里的终端跑），然后：

```powershell
cd C:\Users\user\Desktop\Website
```

再执行（先清掉可能干扰的环境变量）：

```powershell
$env:GIT_DIR = $null
$env:GIT_WORK_TREE = $null
git status
```

若仍报错，再试一次**用完整路径**并指定工作目录：

```powershell
git -C "C:\Users\user\Desktop\Website" status
```

若还是不行，说明当前目录的 Git 可能被破坏，可以**重新克隆一份**再把你改过的 `.env` 拷过去：

```powershell
cd C:\Users\user\Desktop
# 备份你改好的 .env
Copy-Item Website\.env Desktop\env-backup.txt -ErrorAction SilentlyContinue
# 重命名旧文件夹（备用）
Rename-Item Website Website-old
# 重新克隆
git clone https://github.com/oioioi92/website-app.git Website
cd Website
# 恢复 .env
Copy-Item ..\env-backup.txt .env -ErrorAction SilentlyContinue
# 若没有备份，就从 example 复制再编辑
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

之后提交推送都在新克隆的 `Website` 里做。

---

## 一、Live Chat 环境变量（写在 .env 里，不是命令行）

在 PowerShell 里 **不要** 输入：
```powershell
CHAT_SERVER_INTERNAL_URL="http://127.0.0.1:4000"   # 会报错！
```

这些是给 **.env 文件** 用的。步骤：

1. 在项目根目录 `C:\Users\user\Desktop\Website` 下，若没有 `.env`，先复制一份：
   ```powershell
   Copy-Item .env.example .env
   ```
2. 用记事本或 VS Code 打开 `.env`，找到或添加这三行（值按你本机/服务器改）：
   ```
   CHAT_SERVER_INTERNAL_URL="http://127.0.0.1:4000"
   CHAT_ADMIN_JWT_SECRET="你的长随机字符串"
   NEXT_PUBLIC_CHAT_SERVER_URL="http://localhost:4000"
   ```
3. 保存。Next.js 启动时会自动读 `.env`。

---

## 二、Git 提交与推送（PowerShell 里要分开执行）

文档里的 `→` 是“然后”的意思，**不是** 在 PowerShell 里一次粘贴整行。

请**分三条命令**执行：

```powershell
git add .
```
```powershell
git commit -m "fix: 跑马灯与 Live Chat 配置"
```
```powershell
git push origin main
```

若要一行里顺序执行，用分号 `;`：

```powershell
git add . ; git commit -m "fix: 跑马灯与 Live Chat 配置" ; git push origin main
```

注意：`-m` 和提交信息之间有一个空格，且提交信息用英文双引号 `"..."` 包住。
