"use client";

import Link from "next/link";

const MODULES: Array<{
  id: string;
  icon: string;
  title: string;
  desc: string;
  href: string;
  adminOnly?: boolean;
}> = [
  {
    id: "number-library",
    icon: "📚",
    title: "号码库",
    desc: "冷热号 / 未开分析",
    href: "#number-library"
  },
  {
    id: "strategy-library",
    icon: "📊",
    title: "策略库",
    desc: "Boom A/B/C、P1/P4/P12/P24",
    href: "#strategy"
  },
  {
    id: "backtest-lab",
    icon: "🔬",
    title: "回测实验室",
    desc: "ROI、命中率、走势区间",
    href: "#backtest"
  },
  {
    id: "data-sync",
    icon: "🔄",
    title: "数据同步",
    desc: "更新状态、最近错误",
    href: "#sync"
  },
  {
    id: "ocr-monitor",
    icon: "🖥️",
    title: "OCR / 监控",
    desc: "LDPlayer 监控入口",
    href: "#ocr"
  }
];

export function ModuleGrid({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <section id="control-tower-modules" className="space-y-4">
      <h2 className="text-xl font-bold text-white lg:text-2xl">
        控制台模块
      </h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {MODULES.map((m) => {
          const disabled = Boolean(m.adminOnly && !isAdmin);
          const commonClass =
            "group flex flex-col rounded-2xl border p-5 shadow-lg transition";
          const activeClass = "border-white/15 bg-white/5 hover:border-[color:var(--front-gold)]/30 hover:bg-white/10";
          const disabledClass = "cursor-not-allowed border-white/10 bg-white/5 opacity-60";

          if (disabled) {
            return (
              <div key={m.id} className={`${commonClass} ${disabledClass}`}>
                <span className="text-2xl" aria-hidden>
                  {m.icon}
                </span>
                <h3 className="mt-3 text-base font-bold text-white">{m.title}</h3>
                <p className="mt-1 text-sm text-white/70">{m.desc}</p>
                <span className="mt-3 text-sm font-semibold text-white/70">需管理员权限</span>
              </div>
            );
          }

          return (
            <Link key={m.id} href={m.href} className={`${commonClass} ${activeClass}`}>
              <span className="text-2xl" aria-hidden>
                {m.icon}
              </span>
              <h3 className="mt-3 text-base font-bold text-white">{m.title}</h3>
              <p className="mt-1 text-sm text-white/70">{m.desc}</p>
              <span className="mt-3 text-sm font-semibold text-[color:var(--front-gold)] group-hover:opacity-90">
                进入 →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
