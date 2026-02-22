import { AdminLiveChatClient } from "@/components/admin/AdminLiveChatClient";

export const dynamic = "force-dynamic";

export default function AdminChatPage() {
  return (
    <div
      className="admin-chat-full -m-3 flex flex-col min-h-0 overflow-hidden"
      style={{ height: "calc(100vh - var(--topbar-h, 48px))" }}
    >
      <AdminLiveChatClient />
    </div>
  );
}
