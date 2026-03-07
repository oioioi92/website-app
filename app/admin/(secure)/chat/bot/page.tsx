import { AdminChatBotConfigClient } from "@/components/admin/AdminChatBotConfigClient";

export const dynamic = "force-dynamic";

export default function AdminChatBotPage() {
  return (
    <div>
      <AdminChatBotConfigClient />
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">自动回复中的变量（欢迎语、离线回复、规则回复均支持）</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          <li><code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">{"{{visitorName}}"}</code> 访客姓名</li>
          <li><code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">{"{{visitorEmail}}"}</code> 访客邮箱</li>
          <li><code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">{"{{visitorPhone}}"}</code> 访客电话</li>
          <li><code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">{"{{date}}"}</code> 当前日期</li>
          <li><code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">{"{{time}}"}</code> 当前时间</li>
          <li><code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">{"{{waitingCount}}"}</code> 当前排队人数（不含本会话）</li>
        </ul>
        <p className="mt-2 text-xs text-slate-500">示例：离线回复写「{"{{visitorName}}"} 您好，客服暂时忙碌中，当前还有 {"{{waitingCount}}"} 人在等待，我们会尽快回复。」可个性化展示。</p>
      </div>
    </div>
  );
}
