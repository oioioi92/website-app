"use client";

import { Block } from "@/components/blocks";

export function BlocksRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block) => {
        if (block.type === "h1") return <h1 key={block.id} className="text-2xl font-bold">{block.text}</h1>;
        if (block.type === "p") return <p key={block.id} className="leading-7 text-[color:var(--text)]">{block.text}</p>;
        if (block.type === "list") {
          return (
            <ul key={block.id} className="list-disc pl-6 space-y-1 text-[color:var(--text)]">
              {block.items.map((item, idx) => <li key={`${block.id}-${idx}`}>{item}</li>)}
            </ul>
          );
        }
        if (block.type === "button") {
          return (
            <a
              key={block.id}
              href={block.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-md px-4 py-2 text-white bg-[color:var(--front-accent)] hover:opacity-90"
            >
              {block.label}
            </a>
          );
        }
        if (block.type === "image") {
          return (
            <img
              key={block.id}
              src={block.url}
              alt=""
              className="max-w-full rounded-lg border border-[color:var(--rb-border)]"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
