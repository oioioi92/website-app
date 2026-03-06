"use client";

import { cn } from "@/lib/utils";

/** P44 门户用卡片：支持 title、right，样式统一 desk-card */
export function DeskCardP44({
  title,
  right,
  noPadding,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  right?: React.ReactNode;
  /** 为 true 时 body 不加 p-4，用于全幅 Banner 等 */
  noPadding?: boolean;
}) {
  return (
    <div
      className={cn("desk-card flex flex-col", className)}
      {...props}
    >
      {(title != null || right != null) && (
        <div className="desk-card-head flex h-12 shrink-0 items-center justify-between border-b-2 border-[var(--desk-border)] px-4">
          {title != null ? (
            <h3 className="m-0 text-lg font-bold text-[var(--desk-text)]">{title}</h3>
          ) : (
            <span />
          )}
          {right != null ? <div className="text-sm text-[var(--desk-text-muted)]">{right}</div> : null}
        </div>
      )}
      <div className={cn("desk-card-body flex flex-1 flex-col min-h-0", !noPadding && "p-4")}>{children}</div>
    </div>
  );
}
