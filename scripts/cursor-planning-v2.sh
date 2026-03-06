#!/usr/bin/env bash
# Cursor Planning Bash v2 - 28 Steps（Website-new P0 上线闭环）
#
# 用法：
#   chmod +x scripts/cursor-planning-v2.sh
#   ./scripts/cursor-planning-v2.sh init
#   ./scripts/cursor-planning-v2.sh status
#   DOMAIN=admin1167.com ./scripts/cursor-planning-v2.sh next
#
# 可选开关（默认 0 = 只提示不执行）：
#   EXEC=1       # 允许执行：install/build/pm2 start/curl 等（不含 sudo）
#   EXEC_DB=1    # 允许执行：prisma migrate deploy（会改数据库）
#   SUDO=1       # 允许执行：nginx -t / reload / ufw 等需要 sudo 的动作
#   NO_PROMPT=1  # 不提示确认，自动返回
#
# 可选覆盖：
#   DOMAIN=admin1167.com      # 公网测试域名
#   PRISMA_SCHEMA=...         # 指定 prisma schema 文件
#   CHAT_PORT=4000            # 指定 chat-server 端口
#   CHAT_ENTRY=chat-server.js # 指定 chat-server 启动入口（在 services/chat-server 目录）
#   SOCKET_PATH=/socket.io    # 指定 socket.io path
#
# Run-log（上线验收报告）：
#   每步执行时会把输出追加到 docs/run-log.md；标记 done 时追加一行完成记录。
#   关闭：RUN_LOG=0

set -u

# ---------- 路径 ----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CHECKLIST_FILE="${REPO_ROOT}/docs/CURSOR_P0_CHECKLIST_V2.md"
RUN_LOG_FILE="${REPO_ROOT}/docs/run-log.md"
RUN_LOG="${RUN_LOG:-1}"

# ---------- 开关 ----------
EXEC="${EXEC:-0}"
EXEC_DB="${EXEC_DB:-0}"
SUDO="${SUDO:-0}"
NO_PROMPT="${NO_PROMPT:-0}"

DOMAIN="${DOMAIN:-}"
PRISMA_SCHEMA="${PRISMA_SCHEMA:-}"
CHAT_PORT="${CHAT_PORT:-}"
CHAT_ENTRY="${CHAT_ENTRY:-}"
SOCKET_PATH="${SOCKET_PATH:-/socket.io}"

# ---------- 颜色 ----------
if [[ -t 1 ]]; then
  C_RESET=$'\033[0m'
  C_GREEN=$'\033[32m'
  C_YELLOW=$'\033[33m'
  C_RED=$'\033[31m'
  C_CYAN=$'\033[36m'
  C_DIM=$'\033[2m'
else
  C_RESET=""; C_GREEN=""; C_YELLOW=""; C_RED=""; C_CYAN=""; C_DIM=""
fi

ok()    { echo "${C_GREEN}✅ $*${C_RESET}"; }
warn()  { echo "${C_YELLOW}⚠️  $*${C_RESET}"; }
fail()  { echo "${C_RED}❌ $*${C_RESET}"; }
info()  { echo "${C_CYAN}ℹ️  $*${C_RESET}"; }
dim()   { echo "${C_DIM}$*${C_RESET}"; }

have() { command -v "$1" >/dev/null 2>&1; }

# ---------- 搜索工具（优先 rg） ----------
rg_or_grep() {
  local pattern="$1"; shift
  if have rg; then
    rg -n --hidden --no-ignore-vcs \
      -g'!node_modules' -g'!.next' -g'!dist' -g'!build' \
      "$pattern" "$@" 2>/dev/null || true
  else
    grep -RIn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build \
      -E "$pattern" "$@" 2>/dev/null || true
  fi
}

unique_env_keys_from_paths() {
  # 从多个路径抓取 process.env.KEY
  if have rg; then
    rg -o --hidden --no-ignore-vcs \
      -g'!node_modules' -g'!.next' -g'!dist' -g'!build' \
      'process\.env\.[A-Z0-9_]+' "$@" 2>/dev/null \
      | sed 's/process\.env\.//' | sort -u
  else
    local p
    for p in "$@"; do
      grep -Rho --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build \
        -E 'process\.env\.[A-Z0-9_]+' "$p" 2>/dev/null || true
    done | sed 's/process\.env\.//' | sort -u
  fi
}

env_defined_keys_from_files() {
  # 从 env 文件解析定义过的 KEY（不输出值）
  local f
  for f in "$@"; do
    [[ -f "$f" ]] || continue
    sed -nE 's/^(export[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)=.*/\2/p' "$f" 2>/dev/null || true
  done | sort -u
}

detect_pm() {
  if [[ -f "${REPO_ROOT}/pnpm-lock.yaml" ]]; then echo "pnpm"; return; fi
  if [[ -f "${REPO_ROOT}/yarn.lock" ]]; then echo "yarn"; return; fi
  echo "npm"
}

pm_install_cmd() {
  local pm; pm="$(detect_pm)"
  case "$pm" in
    pnpm) echo "pnpm install --frozen-lockfile" ;;
    yarn) echo "yarn install --frozen-lockfile" ;;
    npm)  echo "npm ci" ;;
  esac
}

pm_run_cmd() {
  local script="$1"
  local pm; pm="$(detect_pm)"
  case "$pm" in
    pnpm) echo "pnpm run ${script}" ;;
    yarn) echo "yarn ${script}" ;;
    npm)  echo "npm run ${script}" ;;
  esac
}

choose_prisma_schema() {
  if [[ -n "${PRISMA_SCHEMA}" ]]; then
    echo "${PRISMA_SCHEMA}"; return
  fi
  if [[ -f "${REPO_ROOT}/prisma/schema.prisma" ]]; then
    echo "${REPO_ROOT}/prisma/schema.prisma"; return
  fi
  local first
  first="$(find "${REPO_ROOT}/prisma" -maxdepth 1 -type f -name "*.prisma" 2>/dev/null | head -n 1 || true)"
  if [[ -n "${first}" ]]; then echo "${first}"; return; fi
  echo ""
}

infer_chat_port() {
  # 优先 CHAT_PORT，其次 services/chat-server/.env 里的 PORT=，最后默认 4000
  if [[ -n "${CHAT_PORT}" ]]; then
    echo "${CHAT_PORT}"; return
  fi
  local envf="${REPO_ROOT}/services/chat-server/.env"
  if [[ -f "${envf}" ]]; then
    local p
    p="$(sed -nE 's/^PORT=([0-9]+).*/\1/p' "${envf}" | head -n 1 || true)"
    if [[ -n "${p}" ]]; then echo "${p}"; return; fi
  fi
  echo "4000"
}

infer_chat_entry() {
  # 优先 CHAT_ENTRY，否则尝试常见入口
  if [[ -n "${CHAT_ENTRY}" ]]; then
    echo "${CHAT_ENTRY}"; return
  fi
  local d="${REPO_ROOT}/services/chat-server"
  [[ -d "$d" ]] || { echo ""; return; }

  local candidates=("chat-server.js" "server.js" "index.js" "app.js" "main.js")
  local c
  for c in "${candidates[@]}"; do
    if [[ -f "${d}/${c}" ]]; then echo "${c}"; return; fi
  done
  echo ""
}

ensure_checklist() {
  mkdir -p "${REPO_ROOT}/docs"
  if [[ ! -f "${CHECKLIST_FILE}" ]]; then
    init_checklist >/dev/null
  fi
}

ensure_run_log() {
  [[ "${RUN_LOG}" != "1" ]] && return 0
  mkdir -p "${REPO_ROOT}/docs"
  if [[ ! -f "${RUN_LOG_FILE}" ]]; then
    echo "# P0 上线验收 run-log (v2)" > "${RUN_LOG_FILE}"
    echo "" >> "${RUN_LOG_FILE}"
    echo "每次 \`next\` / \`step <ID>\` 的输出会追加 below；\`done <ID>\` 会追加一行完成记录。" >> "${RUN_LOG_FILE}"
    echo "" >> "${RUN_LOG_FILE}"
    echo "---" >> "${RUN_LOG_FILE}"
  fi
}

append_run_log() {
  [[ "${RUN_LOG}" != "1" ]] && return 0
  local line="$1"
  ensure_run_log
  echo "${line}" >> "${RUN_LOG_FILE}"
}

init_checklist() {
  mkdir -p "${REPO_ROOT}/docs"
  cat > "${CHECKLIST_FILE}" <<'MD'
# Cursor P0 上线闭环 Checklist v2（28 小步）

> 运行方式：`./scripts/cursor-planning-v2.sh next`  
> 每次会带你完成下一项，完成后标记 ✅  
> 你也可以手动在这里把 `[ ]` 改成 `[x] ✅`。

## Baseline / 结构
- [ ] {01} Git 基线：确认分支、commit、是否有未提交改动
- [ ] {02} 项目结构：app/src、prisma、services/chat-server、docs、scripts 是否齐全
- [ ] {03} 工具链：node / 包管理器 / pm2 / nginx（服务器）是否就绪
- [ ] {04} package.json：确认 build/start 脚本存在，知道生产启动命令

## 文档与“唯一真相”
- [ ] {05} docs 关键文档是否齐：差异清单、连接说明、路由清单、WhatsApp 说明等

## 环境变量与域名统一（最容易翻车）
- [ ] {06} 主站 env：扫描 process.env.* → 对比 .env* → 输出缺失 keys
- [ ] {07} chat-server env：扫描 process.env.* → 对比 services/chat-server/.env → 输出缺失 keys
- [ ] {08} 域名统一：清除写死 .com/.net，统一用 NEXT_PUBLIC_CHAT_URL（或你的标准变量）

## Prisma / DB（生产稳定的地基）
- [ ] {09} Prisma schema 盘点：列出所有 schema、datasource provider、选择 production schema
- [ ] {10} Prisma validate（不改库）
- [ ] {11} Prisma generate（不改库）
- [ ] {12} Prisma migrate status（确认迁移状态）
- [ ] {13} Prisma migrate deploy（会改库）

## 主站构建与进程（Next.js）
- [ ] {14} 主站依赖安装（npm/pnpm/yarn 自动识别）
- [ ] {15} 主站 build 通过
- [ ] {16} PM2：主站启动方式固化（ecosystem 或 pm2 start npm --name website-new）
- [ ] {17} 主站本机健康检查：localhost 访问正常（或端口监听正常）

## chat-server（Live Chat）
- [ ] {18} chat-server 依赖安装（services/chat-server）
- [ ] {19} chat-server 端口与入口确认（PORT/入口文件/socket.io path）
- [ ] {20} PM2：chat-server 启动并 online
- [ ] {21} chat-server 本机 socket.io polling 测试通过 + logs 无异常

## Nginx（线上连通的关键）
- [ ] {22} Nginx 配置定位：确认主站反代 + /socket.io/ 反代存在
- [ ] {23} Nginx 配置测试：nginx -t 通过
- [ ] {24} Nginx reload + 查看 error.log 无明显报错

## 公网 Smoke Test（最终验收）
- [ ] {25} 公网首页 smoke test（HTTP 200/正常跳转）
- [ ] {26} 公网 socket.io polling smoke test（不 502/不拒绝连接）

## 可靠性与安全（上线后不炸）
- [ ] {27} PM2 开机自启 + save + logrotate（防止重启/爆盘）
- [ ] {28} 端口暴露检查 + 防火墙建议（chat 端口不对公网开放）

MD
  ok "已生成：docs/CURSOR_P0_CHECKLIST_V2.md"
}

mark_done() {
  local id="$1"
  ensure_checklist
  if grep -qE "^- \[ \] \{${id}\}" "${CHECKLIST_FILE}"; then
    sed -i.bak -E "s/^- \\[ \\] \\{${id}\\}/- [x] ✅ {${id}}/" "${CHECKLIST_FILE}" && rm -f "${CHECKLIST_FILE}.bak"
    ok "已打勾：{${id}}"
    append_run_log "✅ Step {${id}} 已完成 @ $(date '+%Y-%m-%d %H:%M:%S')"
  else
    warn "找不到未完成项 {${id}}（可能已完成或 checklist 不匹配）"
  fi
}

mark_undone() {
  local id="$1"
  ensure_checklist
  if grep -qE "^- \[x\] ✅ \{${id}\}" "${CHECKLIST_FILE}"; then
    sed -i.bak -E "s/^- \\[x\\] ✅ \\{${id}\\}/- [ ] {${id}}/" "${CHECKLIST_FILE}" && rm -f "${CHECKLIST_FILE}.bak"
    ok "已取消打勾：{${id}}"
  else
    warn "找不到已完成项 {${id}}"
  fi
}

next_id() {
  ensure_checklist
  grep -E '^- \[ \] \{[0-9]{2}\}' "${CHECKLIST_FILE}" | head -n 1 | sed -E 's/^- \[ \] \{([0-9]{2})\}.*/\1/'
}

prompt_mark_done() {
  local id="$1"
  [[ "${NO_PROMPT}" == "1" ]] && return 0
  echo
  read -r -p "这一步你完成了吗？标记 {${id}} 为 ✅ 请输入 y： " ans || true
  if [[ "${ans:-}" == "y" || "${ans:-}" == "Y" ]]; then
    mark_done "$id"
  else
    warn "未标记完成。你可以稍后执行：./scripts/cursor-planning-v2.sh done ${id}"
  fi
}

step_header() {
  local id="$1" title="$2"
  echo
  echo "============================================================"
  echo "Step {${id}} — ${title}"
  echo "============================================================"
}

run_maybe() {
  local cmd="$1"
  if [[ "${EXEC}" == "1" ]]; then
    info "执行：${cmd}"
    bash -lc "${cmd}"
  else
    dim "（未执行）你可以运行：${cmd}"
  fi
}

run_maybe_db() {
  local cmd="$1"
  if [[ "${EXEC_DB}" == "1" ]]; then
    info "执行（会改数据库）：${cmd}"
    bash -lc "${cmd}"
  else
    dim "（未执行）如确认要改库再运行：EXEC_DB=1 ${cmd}"
  fi
}

run_maybe_sudo() {
  local cmd="$1"
  if [[ "${SUDO}" == "1" ]]; then
    info "执行（sudo）：${cmd}"
    bash -lc "${cmd}"
  else
    dim "（未执行）需要 sudo 才执行：SUDO=1 ${cmd}"
  fi
}

# ---------- Steps 01..28 ----------

step_01() {
  step_header "01" "Git 基线：确认分支、commit、是否有未提交改动"
  cd "${REPO_ROOT}"
  if have git; then
    ok "branch: $(git branch --show-current 2>/dev/null || echo '?')"
    ok "commit: $(git rev-parse --short HEAD 2>/dev/null || echo '?')"
    local dirty
    dirty="$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
    if [[ "${dirty}" == "0" ]]; then ok "工作区干净"; else warn "未提交改动：${dirty} 个文件（建议先 commit 关键改动）"; fi
    dim "查看：git status"
  else
    warn "未检测到 git"
  fi
  echo "验收：你清楚现在部署/运行的是哪个 commit。"
}

step_02() {
  step_header "02" "项目结构：app/src、prisma、services/chat-server、docs、scripts 是否齐全"
  cd "${REPO_ROOT}"
  local okcnt=0

  if [[ -d "${REPO_ROOT}/app" || -d "${REPO_ROOT}/src/app" ]]; then ok "Next App Router 目录存在（app/ 或 src/app/）"; ((okcnt++)); else warn "未找到 app/ 或 src/app/"; fi
  if [[ -d "${REPO_ROOT}/prisma" ]]; then ok "prisma/ 存在"; ((okcnt++)); else warn "prisma/ 不存在"; fi
  if [[ -d "${REPO_ROOT}/services/chat-server" ]]; then ok "services/chat-server 存在"; ((okcnt++)); else warn "services/chat-server 不存在"; fi
  if [[ -d "${REPO_ROOT}/docs" ]]; then ok "docs/ 存在"; ((okcnt++)); else warn "docs/ 不存在（建议保留文档）"; fi
  if [[ -d "${REPO_ROOT}/scripts" ]]; then ok "scripts/ 存在"; ((okcnt++)); else warn "scripts/ 不存在"; fi

  dim "仓库根目录：${REPO_ROOT}"
  echo "验收：核心目录存在（尤其 prisma/ 和 services/chat-server）。"
}

step_03() {
  step_header "03" "工具链：node / 包管理器 / pm2 / nginx（服务器）是否就绪"
  cd "${REPO_ROOT}"
  if have node; then ok "node: $(node -v)"; else fail "缺 node"; fi
  if have npm; then ok "npm : $(npm -v)"; else warn "缺 npm（如果你用 pnpm/yarn 也行）"; fi
  if have pnpm; then ok "pnpm: $(pnpm -v)"; else dim "pnpm 未检测到（不用可忽略）"; fi
  if have yarn; then ok "yarn: $(yarn -v)"; else dim "yarn 未检测到（不用可忽略）"; fi
  if have pm2; then ok "pm2 : $(pm2 -v)"; else warn "pm2 未检测到（生产强烈建议有）"; fi
  if have nginx; then ok "nginx: $(nginx -v 2>&1)"; else dim "nginx 未检测到（本地可忽略；服务器需要）"; fi
  echo "验收：生产服务器具备 node + pm2 + nginx。"
}

step_04() {
  step_header "04" "package.json：确认 build/start 脚本存在，知道生产启动命令"
  cd "${REPO_ROOT}"
  if [[ ! -f "${REPO_ROOT}/package.json" ]]; then fail "缺 package.json"; return 0; fi

  info "检测包管理器：$(detect_pm)"
  info "打印 scripts（重点看 build/start）："
  run_maybe "cd '${REPO_ROOT}' && node -e \"const p=require('./package.json'); console.log(p.scripts||{});\""

  info "快速检查 build/start 是否存在："
  local has_build has_start
  has_build="$(node -e "const p=require('./package.json');process.exit((p.scripts&&p.scripts.build)?0:1)" >/dev/null 2>&1; echo $?)"
  has_start="$(node -e "const p=require('./package.json');process.exit((p.scripts&&p.scripts.start)?0:1)" >/dev/null 2>&1; echo $?)"
  [[ "${has_build}" == "0" ]] && ok "有 build" || warn "没有 build（不常见）"
  [[ "${has_start}" == "0" ]] && ok "有 start" || warn "没有 start（生产用 pm2 启动时会麻烦）"

  dim "常见生产启动：pm2 start npm --name website-new -- start"
  echo "验收：你清楚 build 与 start 具体跑什么。"
}

step_05() {
  step_header "05" "docs 关键文档是否齐：差异清单、连接说明、路由清单、WhatsApp 说明等"
  cd "${REPO_ROOT}"

  local files=(
    "docs/cursor-chat-summary-for-website-new.md"
    "docs/两套项目差异-迁移清单.md"
    "docs/前台与后台连接说明.md"
    "docs/前端页面与路由清单.md"
    "docs/WhatsApp-系统说明.md"
    "docs/admin1167.conf-改好"
  )
  local f found=0
  for f in "${files[@]}"; do
    if [[ -f "${REPO_ROOT}/${f}" ]]; then ok "存在：${f}"; ((found++)); else warn "缺：${f}"; fi
  done

  echo
  info "建议：把这些文档当作“唯一真相”，避免口头/记忆导致线上不一致。"
  echo "验收：至少关键 4 份文档存在并能指导后续配置。"
}

step_06() {
  step_header "06" "主站 env：扫描 process.env.* → 对比 .env* → 输出缺失 keys"
  cd "${REPO_ROOT}"

  local scan_paths=()
  [[ -d "${REPO_ROOT}/app" ]] && scan_paths+=("${REPO_ROOT}/app")
  [[ -d "${REPO_ROOT}/src" ]] && scan_paths+=("${REPO_ROOT}/src")
  [[ -d "${REPO_ROOT}/components" ]] && scan_paths+=("${REPO_ROOT}/components")
  [[ -d "${REPO_ROOT}/lib" ]] && scan_paths+=("${REPO_ROOT}/lib")
  [[ -d "${REPO_ROOT}/server" ]] && scan_paths+=("${REPO_ROOT}/server")

  if [[ "${#scan_paths[@]}" -eq 0 ]]; then
    warn "没找到可扫描的主站目录（app/src/components/lib/server）"
    return 0
  fi

  info "扫描主站 env keys（process.env.*）："
  local used_keys
  used_keys="$(unique_env_keys_from_paths "${scan_paths[@]}" | head -n 300)"
  if [[ -z "${used_keys}" ]]; then warn "没扫描到 env keys（可能你用别的读取方式）"; else echo "${used_keys}"; fi

  local env_files=(
    "${REPO_ROOT}/.env"
    "${REPO_ROOT}/.env.local"
    "${REPO_ROOT}/.env.production"
    "${REPO_ROOT}/.env.production.local"
  )
  info "检测到的 env 文件："
  local ef
  for ef in "${env_files[@]}"; do [[ -f "${ef}" ]] && ok "${ef#${REPO_ROOT}/}" || dim "不存在：${ef#${REPO_ROOT}/}"; done

  info "从 env 文件解析到的定义 keys："
  local defined_keys
  defined_keys="$(env_defined_keys_from_files "${env_files[@]}")"
  [[ -n "${defined_keys}" ]] && echo "${defined_keys}" || warn "env 文件里没解析到任何 KEY=（可能文件不存在）"

  echo
  info "疑似缺失 keys（代码用到了，但 env 文件未定义）："
  if [[ -n "${used_keys}" ]]; then
    comm -23 <(echo "${used_keys}" | sort -u) <(echo "${defined_keys}" | sort -u) | head -n 200 || true
  fi

  dim "注意：NODE_ENV/PORT 等可能由系统提供，不一定需要写进 env。"
  echo "验收：你能列出“必须补齐”的 env keys，并写入正确的 .env（生产）/ .env.local（本地）。"
}

step_07() {
  step_header "07" "chat-server env：扫描 process.env.* → 对比 services/chat-server/.env → 输出缺失 keys"
  cd "${REPO_ROOT}"

  local chat_dir="${REPO_ROOT}/services/chat-server"
  if [[ ! -d "${chat_dir}" ]]; then fail "找不到：services/chat-server"; return 0; fi

  info "扫描 chat-server env keys："
  local used
  used="$(unique_env_keys_from_paths "${chat_dir}" | head -n 200)"
  [[ -n "${used}" ]] && echo "${used}" || warn "chat-server 没扫描到 env keys（可能很少或别的写法）"

  local envf="${chat_dir}/.env"
  if [[ -f "${envf}" ]]; then ok "存在：services/chat-server/.env"; else warn "不存在：services/chat-server/.env（按文档创建）"; fi

  local defined
  defined="$(env_defined_keys_from_files "${envf}")"
  if [[ -n "${defined}" ]]; then
    info "chat-server .env 定义 keys："
    echo "${defined}"
  else
    warn "chat-server .env 未解析到 keys（或文件不存在）"
  fi

  echo
  info "疑似缺失 keys（chat-server 代码用到了，但 .env 未定义）："
  if [[ -n "${used}" ]]; then
    comm -23 <(echo "${used}" | sort -u) <(echo "${defined}" | sort -u) | head -n 200 || true
  fi

  echo "验收：chat-server 的关键 env（至少 PORT、CORS/origin 等）在 .env 里明确。"
}

step_08() {
  step_header "08" "域名统一：清除写死 .com/.net，统一用 NEXT_PUBLIC_CHAT_URL（或你的标准变量）"
  cd "${REPO_ROOT}"

  info "搜索写死域名（admin1167.com / admin1167.net / http(s)://）："
  rg_or_grep 'admin1167\.com|admin1167\.net|https?://' "${REPO_ROOT}/app" "${REPO_ROOT}/src" "${REPO_ROOT}/components" "${REPO_ROOT}/services" 2>/dev/null | head -n 120

  echo
  info "搜索 socket.io-client / io(...) 使用点："
  rg_or_grep 'socket\.io-client|[^a-zA-Z]io\(' "${REPO_ROOT}/app" "${REPO_ROOT}/src" "${REPO_ROOT}/components" "${REPO_ROOT}/services" 2>/dev/null | head -n 120

  cat <<'TXT'

✅ 建议“唯一标准”：
  NEXT_PUBLIC_CHAT_URL=https://admin1167.com   （或你最终决定的唯一域名）

前台/后台统一：
  const socket = io(process.env.NEXT_PUBLIC_CHAT_URL!, { path: "/socket.io" });

⚠️ 最常见翻车：
  - 前台连 .com，后台连 .net
  - chat-server CORS 只允许其中一个 origin
  - Nginx 只给其中一个域名配了 /socket.io/
TXT

  echo "验收：代码里不再出现写死的 .com/.net（或仅出现在 env / docs）。"
}

step_09() {
  step_header "09" "Prisma schema 盘点：列出所有 schema、datasource provider、选择 production schema"
  cd "${REPO_ROOT}"

  if [[ ! -d "${REPO_ROOT}/prisma" ]]; then fail "prisma/ 不存在"; return 0; fi

  info "prisma 目录下所有 .prisma："
  find "${REPO_ROOT}/prisma" -maxdepth 1 -type f -name "*.prisma" 2>/dev/null | sed "s#${REPO_ROOT}/##" || true

  echo
  local schema
  schema="$(choose_prisma_schema)"
  if [[ -z "${schema}" ]]; then fail "无法选择 schema（设置 PRISMA_SCHEMA=...）"; return 0; fi
  ok "当前选择的 schema：${schema#${REPO_ROOT}/}"

  info "datasource provider（快速查看）："
  rg_or_grep 'provider[[:space:]]*=' "${schema}" | head -n 20

  echo
  cat <<'TXT'
✅ 你的项目有 PostgreSQL / SQLite 双 schema，最关键的一点：
  生产环境必须“只允许一种真相”（推荐 PostgreSQL）
  否则会出现：本地正常、线上迁移/字段不一致 的经典噩梦
TXT

  echo "验收：你明确生产要用哪个 schema，并固定部署脚本用它。"
}

step_10() {
  step_header "10" "Prisma validate（不改库）"
  cd "${REPO_ROOT}"
  local schema; schema="$(choose_prisma_schema)"
  [[ -z "${schema}" ]] && { fail "无 schema"; return 0; }
  run_maybe "cd '${REPO_ROOT}' && npx prisma validate --schema '${schema}'"
  echo "验收：validate 无报错。"
}

step_11() {
  step_header "11" "Prisma generate（不改库）"
  cd "${REPO_ROOT}"
  local schema; schema="$(choose_prisma_schema)"
  [[ -z "${schema}" ]] && { fail "无 schema"; return 0; }
  run_maybe "cd '${REPO_ROOT}' && npx prisma generate --schema '${schema}'"
  echo "验收：generate 无报错。"
}

step_12() {
  step_header "12" "Prisma migrate status（确认迁移状态）"
  cd "${REPO_ROOT}"
  local schema; schema="$(choose_prisma_schema)"
  [[ -z "${schema}" ]] && { fail "无 schema"; return 0; }
  run_maybe "cd '${REPO_ROOT}' && npx prisma migrate status --schema '${schema}'"
  echo "验收：能看到迁移状态（或明确 DB 未连通的原因）。"
}

step_13() {
  step_header "13" "Prisma migrate deploy（会改库）"
  cd "${REPO_ROOT}"
  local schema; schema="$(choose_prisma_schema)"
  [[ -z "${schema}" ]] && { fail "无 schema"; return 0; }

  warn "⚠️ 这一步会改数据库（确认 DATABASE_URL 指向正确库）"
  run_maybe_db "cd '${REPO_ROOT}' && npx prisma migrate deploy --schema '${schema}'"
  echo "验收：migrate deploy 成功，且无失败迁移。"
}

step_14() {
  step_header "14" "主站依赖安装（npm/pnpm/yarn 自动识别）"
  cd "${REPO_ROOT}"
  local cmd; cmd="$(pm_install_cmd)"
  ok "包管理器：$(detect_pm)"
  run_maybe "cd '${REPO_ROOT}' && ${cmd}"
  echo "验收：install 无报错。"
}

step_15() {
  step_header "15" "主站 build 通过"
  cd "${REPO_ROOT}"
  local cmd; cmd="$(pm_run_cmd build)"
  run_maybe "cd '${REPO_ROOT}' && ${cmd}"
  echo "验收：build 成功（TypeScript/构建无错误）。"
}

step_16() {
  step_header "16" "PM2：主站启动方式固化（ecosystem 或 pm2 start npm --name website-new）"
  cd "${REPO_ROOT}"
  if ! have pm2; then fail "缺 pm2（生产建议 npm i -g pm2）"; return 0; fi

  if [[ -f "${REPO_ROOT}/ecosystem.config.js" || -f "${REPO_ROOT}/ecosystem.config.cjs" ]]; then
    ok "检测到 ecosystem 文件（推荐使用）"
    dim "示例：pm2 start ecosystem.config.js && pm2 save"
  else
    warn "未检测到 ecosystem 文件（仍可启动，但不如固化稳定）"
    dim "示例：pm2 start npm --name website-new -- start && pm2 save"
  fi

  info "当前 pm2 列表："
  pm2 ls || true

  echo
  info "（可选）如果你想让脚本尝试启动主站："
  dim "EXEC=1 ./scripts/cursor-planning-v2.sh step 16"

  if [[ "${EXEC}" == "1" ]]; then
    if [[ -f "${REPO_ROOT}/ecosystem.config.js" ]]; then
      run_maybe "cd '${REPO_ROOT}' && pm2 start ecosystem.config.js"
      run_maybe "pm2 save"
    elif [[ -f "${REPO_ROOT}/ecosystem.config.cjs" ]]; then
      run_maybe "cd '${REPO_ROOT}' && pm2 start ecosystem.config.cjs"
      run_maybe "pm2 save"
    else
      run_maybe "cd '${REPO_ROOT}' && pm2 start npm --name website-new -- start"
      run_maybe "pm2 save"
    fi
  fi

  echo "验收：pm2 ls 里 website-new 为 online。"
}

step_17() {
  step_header "17" "主站本机健康检查：localhost 访问正常（或端口监听正常）"
  cd "${REPO_ROOT}"
  local port="3000"
  # 如果 env 里有 PORT=，优先用
  for f in "${REPO_ROOT}/.env" "${REPO_ROOT}/.env.production" "${REPO_ROOT}/.env.local"; do
    [[ -f "$f" ]] || continue
    local p
    p="$(sed -nE 's/^PORT=([0-9]+).*/\1/p' "$f" | head -n 1 || true)"
    [[ -n "$p" ]] && port="$p"
  done

  info "推测主站端口：${port}"
  if have ss; then
    ss -ltnp | grep -E ":${port}\b" && ok "端口 ${port} 在监听" || warn "未看到 ${port} 监听（如果你没启动主站，这是正常的）"
  fi

  info "本机 curl（需要主站已启动）："
  run_maybe "curl -I 'http://127.0.0.1:${port}/' | head -n 20"

  echo "验收：主站能在本机打开（或至少端口监听、无明显错误）。"
}

step_18() {
  step_header "18" "chat-server 依赖安装（services/chat-server）"
  cd "${REPO_ROOT}"
  local d="${REPO_ROOT}/services/chat-server"
  [[ -d "$d" ]] || { fail "缺 services/chat-server"; return 0; }

  if [[ -f "${d}/package-lock.json" ]]; then
    run_maybe "cd '${d}' && npm ci"
  else
    run_maybe "cd '${d}' && npm install"
  fi
  echo "验收：chat-server install 无报错。"
}

step_19() {
  step_header "19" "chat-server 端口与入口确认（PORT/入口文件/socket.io path）"
  cd "${REPO_ROOT}"
  local d="${REPO_ROOT}/services/chat-server"
  [[ -d "$d" ]] || { fail "缺 services/chat-server"; return 0; }

  local port; port="$(infer_chat_port)"
  ok "推测 chat-server 端口：${port}（可用 CHAT_PORT= 覆盖）"

  local entry; entry="$(infer_chat_entry)"
  if [[ -n "${entry}" ]]; then ok "推测入口文件：${entry}（可用 CHAT_ENTRY= 覆盖）"; else warn "无法推测入口文件（设置 CHAT_ENTRY=... 或用 npm start）"; fi

  ok "socket.io path：${SOCKET_PATH}（可用 SOCKET_PATH= 覆盖）"

  echo
  info "扫描 chat-server 是否有 listen/PORT 相关："
  rg_or_grep 'listen\(|PORT|socket\.io|path' "${d}" 2>/dev/null | head -n 80

  echo "验收：你明确 chat-server 的端口、入口文件、socket.io path。"
}

step_20() {
  step_header "20" "PM2：chat-server 启动并 online"
  cd "${REPO_ROOT}"
  if ! have pm2; then fail "缺 pm2"; return 0; fi

  local d="${REPO_ROOT}/services/chat-server"
  [[ -d "$d" ]] || { fail "缺 services/chat-server"; return 0; }

  local entry; entry="$(infer_chat_entry)"
  info "推荐启动方式二选一："
  if [[ -n "${entry}" ]]; then
    echo "  A) 直接跑入口文件："
    echo "     (cd services/chat-server && pm2 start '${entry}' --name chat-server)"
  fi
  echo "  B) 用 npm start："
  echo "     (cd services/chat-server && pm2 start npm --name chat-server -- start)"

  if [[ "${EXEC}" == "1" ]]; then
    if [[ -n "${entry}" ]]; then
      run_maybe "cd '${d}' && pm2 start '${entry}' --name chat-server"
    else
      run_maybe "cd '${d}' && pm2 start npm --name chat-server -- start"
    fi
    run_maybe "pm2 save"
  else
    dim "（未执行）如要自动启动：EXEC=1 ./scripts/cursor-planning-v2.sh step 20"
  fi

  info "pm2 列表："
  pm2 ls || true

  echo "验收：pm2 ls 里 chat-server 为 online。"
}

step_21() {
  step_header "21" "chat-server 本机 socket.io polling 测试通过 + logs 无异常"
  cd "${REPO_ROOT}"
  local port; port="$(infer_chat_port)"

  info "端口监听（示例）："
  if have ss; then
    ss -ltnp | grep -E ":${port}\b" && ok "监听 OK :${port}" || warn "未看到监听 :${port}"
  else
    dim "未检测到 ss，可用 netstat/lsof 替代"
  fi

  info "本机 polling 测试（关键：不要 connection refused）："
  run_maybe "curl -i 'http://127.0.0.1:${port}${SOCKET_PATH}/?EIO=4&transport=polling' | head -n 40"

  if have pm2; then
    info "最近 chat-server 日志："
    dim "pm2 logs chat-server --lines 120"
  fi

  echo "验收：curl 不拒绝连接；pm2 logs 无明显报错。"
}

step_22() {
  step_header "22" "Nginx 配置定位：确认主站反代 + /socket.io/ 反代存在"
  cd "${REPO_ROOT}"

  info "仓库 docs 中的 nginx 配置（建议为准）："
  if [[ -f "${REPO_ROOT}/docs/admin1167.conf-改好" ]]; then
    ok "存在：docs/admin1167.conf-改好"
    info "检查其中是否包含 /socket.io/："
    rg_or_grep 'location[[:space:]]+/socket\.io/|/socket\.io/' "${REPO_ROOT}/docs/admin1167.conf-改好" | head -n 80
  else
    warn "未找到 docs/admin1167.conf-改好（确认文件名）"
  fi

  echo
  if have nginx; then
    info "在服务器上（/etc/nginx）搜索 /socket.io/："
    rg_or_grep 'location[[:space:]]+/socket\.io/|/socket\.io/' /etc/nginx 2>/dev/null | head -n 120
  else
    dim "本机无 nginx（这步在服务器做更合适）"
  fi

  cat <<'NGINX'

✅ /socket.io/ 反代标准形态：
location /socket.io/ {
  proxy_pass http://127.0.0.1:4000;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "Upgrade";
  proxy_set_header Host $host;
  proxy_read_timeout 60s;
  proxy_send_timeout 60s;
}
NGINX

  echo "验收：你能定位到线上实际生效的 nginx 配置文件，并确认 /socket.io/ 反代存在。"
}

step_23() {
  step_header "23" "Nginx 配置测试：nginx -t 通过"
  run_maybe_sudo "sudo nginx -t"
  echo "验收：nginx -t 显示 successful。"
}

step_24() {
  step_header "24" "Nginx reload + 查看 error.log 无明显报错"
  run_maybe_sudo "sudo systemctl reload nginx"
  run_maybe_sudo "sudo tail -n 80 /var/log/nginx/error.log"
  echo "验收：reload 成功，error.log 无持续性报错。"
}

step_25() {
  step_header "25" "公网首页 smoke test（HTTP 200/正常跳转）"
  if [[ -z "${DOMAIN}" ]]; then
    warn "缺 DOMAIN。示例：DOMAIN=admin1167.com ./scripts/cursor-planning-v2.sh step 25"
    return 0
  fi
  run_maybe "curl -I 'https://${DOMAIN}/' | head -n 20"
  echo "验收：不 502/不超时；状态码合理（200/302 等）。"
}

step_26() {
  step_header "26" "公网 socket.io polling smoke test（不 502/不拒绝连接）"
  if [[ -z "${DOMAIN}" ]]; then
    warn "缺 DOMAIN。示例：DOMAIN=admin1167.com ./scripts/cursor-planning-v2.sh step 26"
    return 0
  fi
  run_maybe "curl -i 'https://${DOMAIN}${SOCKET_PATH}/?EIO=4&transport=polling' | head -n 60"
  echo "验收：不 502、不 connection refused；能拿到响应。"
}

step_27() {
  step_header "27" "PM2 开机自启 + save + logrotate（防止重启/爆盘）"
  cat <<'TXT'
✅ 服务器建议执行：

# 1) 开机自启（按提示执行它输出的那条 sudo 命令）
pm2 startup
pm2 save

# 2) 安装 logrotate（防爆盘）
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 10
TXT
  echo "验收：服务器重启后，pm2 自动拉起 website-new 与 chat-server；日志不会无限增长。"
}

step_28() {
  step_header "28" "端口暴露检查 + 防火墙建议（chat 端口不对公网开放）"
  local chatp; chatp="$(infer_chat_port)"
  info "当前推测 chat-server 端口：${chatp}"

  if have ss; then
    info "监听端口概览（看 chat 端口是否绑定到 0.0.0.0）："
    ss -ltnp | head -n 80 || true
    echo
    ss -ltnp | grep -E ":${chatp}\b" || warn "未找到 :${chatp} 监听（可能 chat-server 未启动）"
  else
    dim "未检测到 ss（可用 netstat/lsof）"
  fi

  cat <<TXT

✅ 安全建议（Ubuntu ufw 示例，按你服务器情况调整）：
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw deny ${chatp}/tcp
  sudo ufw status

目标：chat-server 端口不要直接对公网开放，只通过 Nginx 的 /socket.io/ 访问。
TXT

  echo "验收：只开放 80/443；chat 端口不直接暴露。"
}

run_step() {
  local id="$1"
  case "$id" in
    01) step_01 ;;
    02) step_02 ;;
    03) step_03 ;;
    04) step_04 ;;
    05) step_05 ;;
    06) step_06 ;;
    07) step_07 ;;
    08) step_08 ;;
    09) step_09 ;;
    10) step_10 ;;
    11) step_11 ;;
    12) step_12 ;;
    13) step_13 ;;
    14) step_14 ;;
    15) step_15 ;;
    16) step_16 ;;
    17) step_17 ;;
    18) step_18 ;;
    19) step_19 ;;
    20) step_20 ;;
    21) step_21 ;;
    22) step_22 ;;
    23) step_23 ;;
    24) step_24 ;;
    25) step_25 ;;
    26) step_26 ;;
    27) step_27 ;;
    28) step_28 ;;
    *) fail "未知 step：$id（可用 01..28）"; return 1 ;;
  esac
}

# 运行 step 并把输出追加到 run-log（RUN_LOG=1 时）
run_step_with_log() {
  local id="$1"
  if [[ "${RUN_LOG}" == "1" ]]; then
    ensure_run_log
    { echo ""; echo "## $(date '+%Y-%m-%d %H:%M:%S') — Step {${id}}"; echo ""; } >> "${RUN_LOG_FILE}"
    run_step "${id}" 2>&1 | tee -a "${RUN_LOG_FILE}"
  else
    run_step "${id}"
  fi
}

show_status() {
  ensure_checklist
  echo
  info "Checklist：${CHECKLIST_FILE#${REPO_ROOT}/}"
  echo "------------------------------------------------------------"
  sed -n '1,220p' "${CHECKLIST_FILE}"
  echo "------------------------------------------------------------"
  local nid; nid="$(next_id || true)"
  if [[ -n "${nid}" ]]; then
    info "下一项：{${nid}}（执行：./scripts/cursor-planning-v2.sh step ${nid} 或 next）"
  else
    ok "全部完成 ✅"
  fi
}

usage() {
  cat <<TXT
Cursor Planning Bash v2（28 Steps）

命令：
  init                 生成 docs/CURSOR_P0_CHECKLIST_V2.md
  status               查看进度与下一项
  next                 运行下一项（未勾选的第一个 step）
  step <ID>            运行指定 step（01..28）
  done <ID>            手动标记完成 ✅
  undone <ID>          取消标记

常用：
  ./scripts/cursor-planning-v2.sh init
  ./scripts/cursor-planning-v2.sh status
  DOMAIN=admin1167.com ./scripts/cursor-planning-v2.sh next

开关：
  EXEC=1       执行非 sudo 命令（install/build/pm2/curl）
  EXEC_DB=1    执行 prisma migrate deploy（会改 DB）
  SUDO=1       执行 sudo 命令（nginx/ufw）
  NO_PROMPT=1  不提示确认
  RUN_LOG=0    关闭 run-log（默认 1，输出追加到 docs/run-log.md）

覆盖参数：
  DOMAIN=admin1167.com
  PRISMA_SCHEMA=/path/to/schema.prisma
  CHAT_PORT=4000
  CHAT_ENTRY=chat-server.js
  SOCKET_PATH=/socket.io
TXT
}

main() {
  local cmd="${1:-help}"
  case "$cmd" in
    init) init_checklist ;;
    status) show_status ;;
    next)
      local nid; nid="$(next_id || true)"
      [[ -z "${nid}" ]] && { ok "全部完成 ✅"; exit 0; }
      run_step_with_log "${nid}"
      prompt_mark_done "${nid}"
      ;;
    step)
      local id="${2:-}"
      [[ -z "${id}" ]] && { fail "缺 step id"; usage; exit 1; }
      run_step_with_log "${id}"
      prompt_mark_done "${id}"
      ;;
    done)
      local id="${2:-}"
      [[ -z "${id}" ]] && { fail "缺 step id"; usage; exit 1; }
      mark_done "${id}"
      ;;
    undone)
      local id="${2:-}"
      [[ -z "${id}" ]] && { fail "缺 step id"; usage; exit 1; }
      mark_undone "${id}"
      ;;
    help|-h|--help) usage ;;
    *) usage ;;
  esac
}

main "$@"
