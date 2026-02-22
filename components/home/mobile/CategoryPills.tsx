"use client";

const CATEGORIES = [
  { id: "all", label: "ALL" },
  { id: "events", label: "EVENTS" },
  { id: "slots", label: "SLOTS" },
  { id: "fishing", label: "FISHING" },
  { id: "sports", label: "SPORTS" },
  { id: "live", label: "LIVE" }
];

export function CategoryPills({
  activeId,
  onChange,
  categories
}: {
  activeId: string;
  onChange: (id: string) => void;
  categories?: Array<{ id: string; label: string }>;
}) {
  const list = categories && categories.length > 0 ? categories : CATEGORIES;
  return (
    <div className="flex w-full gap-2 overflow-x-auto px-4 pb-4 pt-2 scrollbar-hide">
      {list.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
              isActive
                ? "border-[#C9A24F] bg-[#C9A24F] text-[#080808]"
                : "border-[#3E3625] bg-transparent text-[#C9A24F]"
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
