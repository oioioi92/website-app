# 部署与「网上还是老版本」排查清单

## 一、当前版本与仓库状态（本地）

| 项目 | 值 |
|------|-----|
| 项目名 | website-phase2 |
| 版本号 | 1.0.0 |
| 远程仓库 | https://github.com/oioioi92/website-app.git |
| 分支 | main |
| 最新提交 | 2f52474 — docs: specs + Porto config + admin-porto.css; ignore website-app/ |
| 上一提交 | eab2442 — fix: admin dashboard hydration, date inputs |

**结论**：本地 main 已推送到 GitHub，线上理论上应能部署到同一套代码。

---

## 二、「网上」指谁？

- **admin1167.net**：你之前说「admin1167.net/admin/login 还是旧的版本」，这里「网上」= admin1167.net 的页面。
- **192.168.0.11:3000**：内网/本机跑的是新版本（Phase2 后台）。

要更新的是 **admin1167.net** 显示的内容。

---

## 三、为什么网上还是老版本？常见原因

### 1. admin1167.net 连的不是这个仓库/分支

- 若 admin1167.net 是 **Vercel**：
  - 打开 [Vercel Dashboard](https://vercel.com/dashboard) → 找到绑了 **admin1167.net** 的那个项目。
  - 看 **Settings → Git**：是否连的是 **oioioi92/website-app**？**Production Branch** 是否是 **main**？
  - 若不是，改成连 oioioi92/website-app、main，再重新部署。
- 若 admin1167.net 是 **其他主机**（自己的服务器/别家托管）：
  - 那台机器不会自动跟 GitHub 同步，需要在那台机器上 **拉代码、build、重启**（或用 CI/CD）才会更新。

### 2. 部署没跑 / 构建失败

- **Vercel**：  
  - **Deployments** 里看最近一次部署是否成功、是否对应最新提交（如 2f52474）。
  - 若没有新部署：在项目里点 **Redeploy**，或用之前的 **Deploy Hook** 再触发一次（POST）。
  - 若部署失败：点进该次部署看 **Build Logs**，按报错修（如 env、Node 版本等）。
- **其他主机**：确认有做 `git pull` + `npm run build` + 重启服务。

### 3. 域名指错项目/环境

- **Vercel**：  
  - **Settings → Domains**：确认 **admin1167.net**（以及 www 若在用）指向的是**当前这个 Vercel 项目**，不是另一个旧项目。
- **其他主机**：确认 DNS 或反向代理指向的是你更新过的那台机器/那套部署。

### 4. 缓存（浏览器 / CDN）

- **浏览器**：无痕模式开 admin1167.net，或 **Ctrl+Shift+R** 硬刷新。
- **Vercel**：新部署成功后通常会用新 URL；若仍像旧版，可在 Vercel 项目 **Settings** 里看是否开了 **Edge Network** 缓存，必要时调短或先关掉测试。
- **其他 CDN/代理**：若有，需清缓存或等过期。

---

## 四、建议操作顺序（让网上=新版本）

1. **确认 GitHub 已是最新**  
   - 浏览器打开：`https://github.com/oioioi92/website-app`  
   - 看默认分支是否 main、最新 commit 是否 2f52474（或更新）。  
   - 若不是，回本地 `git push origin main` 再检查。

2. **确认 admin1167.net 的托管方式**  
   - 若是 **Vercel**：  
     - 找到绑了 admin1167.net 的项目 → 确认 Git=oioioi92/website-app、分支=main。  
     - 在 **Deployments** 里对最新提交做一次 **Redeploy**（或用 Deploy Hook 触发）。  
     - 部署成功后，用**无痕**打开 `https://admin1167.net/admin/login` 看是否为新版。  
   - 若是 **其他服务器**：  
     - 在该机器上从 oioioi92/website-app main 拉代码、build、重启服务；  
     - 再无痕访问 admin1167.net 验证。

3. **仍像老版本时**  
   - 再对一遍：域名是否绑对项目、是否有别的 Vercel 项目/别的服务器在提供 admin1167.net。  
   - 用无痕 + 硬刷新排除本地缓存。

---

## 五、一句话总结

**「网上还是老版本」= admin1167.net 当前用的不是 GitHub 上 main 的最新构建。**  
按上面顺序：确认仓库 → 确认 admin1167.net 连的是这个仓库并重新部署 → 清缓存/无痕验证。做完后网上就会显示和新后台（192.168.0.11:3000 那套）一致的版本。
