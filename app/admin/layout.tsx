import type { ReactNode } from "react";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 antialiased">
      {children}
    </div>
  );
}
