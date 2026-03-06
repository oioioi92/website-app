"use client";

export function LanguageModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (lang: "EN" | "CN" | "MY") => void;
}) {
  if (!open) return null;

  const langs: Array<{ k: "EN" | "CN" | "MY"; label: string }> = [
    { k: "EN", label: "English" },
    { k: "CN", label: "中文" },
    { k: "MY", label: "Bahasa" },
  ];

  return (
    <div className="fixed inset-0 z-[110]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div
        className="absolute left-1/2 top-24 w-[520px] -translate-x-1/2 rounded-[22px] border-2 border-[var(--desk-border)] bg-[var(--desk-header-bg)] p-6 shadow-xl"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
      >
        <div className="flex h-14 items-center justify-between">
          <div className="text-lg font-bold text-[var(--desk-accent)]">Language</div>
          <button
            type="button"
            className="text-[var(--desk-text-muted)] hover:text-[var(--desk-text)]"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {langs.map((l) => (
            <button
              key={l.k}
              type="button"
              onClick={() => {
                onSelect(l.k);
                onClose();
              }}
              className="h-12 rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel)] font-semibold text-[var(--desk-text)] hover:border-[var(--desk-accent)]"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="mt-4 text-sm text-[var(--desk-text-muted)]">
          Tip: 语言切换逻辑后续接 i18n 即可。
        </div>
      </div>
    </div>
  );
}
