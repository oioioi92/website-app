"use client";

import Link from "next/link";
import { RegisterFormClient } from "@/components/public/RegisterFormClient";

const WHY_REGISTER = [
  "Fast verification via WhatsApp",
  "Secure account & data protection",
  "24/7 support & exclusive bonuses",
  "Easy deposit & withdrawal",
];

/** V3: Left col-span-7，Right col-span-5；Card 内 flex flex-col，按钮区 mt-auto */
export function RegisterDesktopWrapper() {
  return (
    <div className="public-desktop-shell hidden min-h-screen lg:block">
      <div data-desktop-header>
        <div className="desk-container flex h-full items-center justify-between">
          <Link href="/" className="text-base font-semibold text-[var(--desk-text)]">KINGDOM888</Link>
          <Link href="/login" className="desk-btn-secondary h-12">Login</Link>
        </div>
      </div>
      <main className="mx-auto max-w-[1560px] px-6 py-6" data-desktop-main>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7">
            <div className="desk-card flex flex-col min-h-0">
              <RegisterFormClient />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <div className="desk-card flex flex-col">
              <div className="desk-card-head">
                <h2 className="desk-section-title">Why Register</h2>
              </div>
              <ul className="desk-card-body list-none p-0 m-0">
                {WHY_REGISTER.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[14px] text-[var(--desk-text-muted)]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--desk-accent)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <footer data-desktop-footer>
        <div className="desk-container text-center">
          <p className="m-0 text-[13px] font-medium text-[var(--desk-text-muted)]">18+ Only. Play responsibly.</p>
        </div>
      </footer>
    </div>
  );
}
