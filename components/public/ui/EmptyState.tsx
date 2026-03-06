"use client";

/** Empty state (DESKTOP-UI-DESIGN-SPEC §3.1) */
export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] py-12 px-6 text-center">
      <p className="text-lg font-semibold text-[var(--desk-text-primary)]">{title}</p>
      {description && <p className="mt-2 text-sm text-[var(--desk-text-muted)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
