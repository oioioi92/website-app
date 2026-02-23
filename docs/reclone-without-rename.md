# 不重命名、直接克隆到新文件夹（避免“被占用”）

因为 **Website** 可能被 Cursor 或其它程序占用，无法重命名。改为克隆到 **Website-new**，再用新文件夹即可。

---

## 在 PowerShell 里执行（整段复制）

```powershell
cd C:\Users\user\Desktop
# 克隆到新名字，不碰原来的 Website
git clone https://github.com/oioioi92/website-app.git Website-new
# 把之前备份的 .env 拷进新仓库
if (Test-Path env-backup.txt) { Copy-Item env-backup.txt Website-new\.env } else { Copy-Item Website\.env Website-new\.env -ErrorAction SilentlyContinue }
# 验证
cd Website-new
git status
```

---

## 之后怎么做

1. **关掉 Cursor**（或至少关掉当前打开的 Website 工作区）。
2. 在 Cursor 里 **File → Open Folder**，选择 **`C:\Users\user\Desktop\Website-new`**，以后就在这个文件夹里开发和用 Git。
3. 旧文件夹 **Website** 可以等确认没问题后，在资源管理器里删掉（或改名为 Website-old 备份）。

这样不需要重命名被占用的 Website，Git 也会正常。
