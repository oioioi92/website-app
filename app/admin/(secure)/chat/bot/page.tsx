import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminChatBotPage() {
  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/chat" className="font-medium text-sky-600 hover:underline">← Live Chat</Link>
      </div>
      <h1 className="text-xl font-semibold text-slate-800">Auto Reply Bot</h1>
      <p className="mt-1 text-sm text-slate-500">自动回复机器人由 chat-server 提供，可配置欢迎语、关键词规则与排程。</p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-700">
          在 chat-server 中通过 <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">PUT /chat/api/admin/bot/config</code> 配置 Bot；
          后台客服在 Live Chat 中与访客对话时，Bot 会根据规则自动回复（如欢迎语、关键词匹配）。
        </p>
        <p className="mt-3 text-sm text-slate-500">
          配置项包括：启用/关闭、欢迎语、离线回复、关键词规则（keyword → reply）、排程、分配客服后暂停等。
        </p>
      </div>
    </div>
  );
}
