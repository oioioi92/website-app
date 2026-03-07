import Link from "next/link";
import { LiveChatQuickTemplatesClient } from "@/components/admin/LiveChatQuickTemplatesClient";

export const dynamic = "force-dynamic";

export default function AdminChatSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/chat" className="text-sm font-medium text-sky-600 hover:underline">← Live Chat</Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-800">Live Chat Settings</h1>
        <p className="mt-0.5 text-sm text-slate-500">配置 Live Chat 全部功能：欢迎语与自动回复、三类快捷句、快捷回复模板等。</p>
      </div>

      {/* 入口卡片 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/chat/bot"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/30"
        >
          <h2 className="font-semibold text-slate-800">自动回复 Bot</h2>
          <p className="mt-1 text-sm text-slate-500">欢迎语、欢迎语下方选项按钮、离线回复、关键词规则与排程。</p>
        </Link>
        <Link
          href="/admin/chat/templates"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/30"
        >
          <h2 className="font-semibold text-slate-800">快捷回复模板</h2>
          <p className="mt-1 text-sm text-slate-500">通用快捷回复模板的增删改，在聊天底部可与三类快捷句一起选用。</p>
        </Link>
      </div>

      {/* 三类快捷句：Deposit / Withdraw / Wallet Problem */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">三类快捷句（聊天底部三个 Template 下拉框）</h2>
        <p className="mt-1 text-sm text-slate-500">
          Deposit Template、Withdraw Template、Wallet Problem Template：各为一组预设回复句，客服在聊天面板底部按类别选用。
        </p>
        <div className="mt-4">
          <LiveChatQuickTemplatesClient />
        </div>
      </section>
    </div>
  );
}
