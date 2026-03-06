"use client";

import Link from "next/link";
import { DeskCardP44 } from "@/components/public/DeskCardP44";

export function LoginCard() {
  return (
    <DeskCardP44 title="LOGIN" className="mx-auto max-w-[560px]">
      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
        <Input label="+60 Mobile No" placeholder="+60 1X-XXXX-XXXX" type="tel" />
        <Input label="Password" placeholder="••••••••" type="password" />

        <div className="flex items-center justify-between text-sm">
          <a className="text-[var(--desk-text-muted)] hover:text-[var(--desk-text)]" href="#">
            Forgot password?
          </a>
          <Link
            href="/register-wa"
            className="text-[var(--desk-accent)] hover:underline"
          >
            Sign up
          </Link>
        </div>

        <div className="pt-2">
          <button type="submit" className="desk-btn-primary w-full leading-12">
            Login
          </button>
        </div>
      </form>
    </DeskCardP44>
  );
}

function Input({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <div className="mb-2 text-sm text-[var(--desk-text-muted)]">{label}</div>
      <input
        type={type}
        placeholder={placeholder}
        className="h-12 w-full rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] px-4 text-[var(--desk-text)] outline-none focus:border-[var(--desk-accent)]"
      />
    </div>
  );
}
