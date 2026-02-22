"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="admin-compact-btn admin-compact-btn-ghost w-full h-8 text-white border-white/20 hover:bg-white/10"
    >
      退出登录
    </button>
  );
}
