import { AdminLiveChatClient } from "@/components/admin/AdminLiveChatClient";

export const dynamic = "force-dynamic";

export default function AdminChatPage() {
  return (
    <div className="admin-chat-full flex flex-1 flex-col min-h-0 overflow-hidden">
      <AdminLiveChatClient />
    </div>
  );
}
