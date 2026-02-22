# 部署前运行一次（本地构建）

在项目根目录执行下面这一条命令即可完成依赖安装 + Prisma 生成 + 构建：

```bash
npm install && npm run build
```

- 请先确保已配置 `.env` 里的 `DATABASE_URL`（与 admin1167.net 生产环境一致，或至少指向 postgres/file 以通过 prebuild）。
- 构建成功后，用你平时部署 admin1167.net 的方式部署（例如 git push 触发 CI、或把 `.next` 与相关文件上传到服务器），部署完成后后台与 Report Center 会跑新代码。

若你使用 **PowerShell**，同样：

```powershell
npm install; npm run build
```
