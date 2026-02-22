"use client";

import { useEffect, useState } from "react";
import { GoldButton } from "@/components/public/ui/GoldButton";
import { GoldFrame } from "@/components/public/ui/GoldFrame";
import type { ThemeConfig } from "@/lib/public/theme";

const KEY = "age_ok_until";

export function AgeGateModal({
  ageGate,
  uiText
}: {
  ageGate: ThemeConfig["ageGate"];
  uiText?: Record<string, string>;
}) {
  const [status, setStatus] = useState<"loading" | "ask" | "blocked" | "ok">("loading");
  const t = uiText ?? {};
  const okText = t.agegateoktext ?? "我已满18岁";
  const noText = t.agegatenotext ?? "未满18岁";
  const blockedTitle = t.agegateblockedtitle ?? "Access Restricted";
  const blockedBody =
    t.agegateblockedbody ?? "You must be at least 18 years old to continue browsing this website.";

  useEffect(() => {
    if (!ageGate.enabled) {
      setStatus("ok");
      return;
    }
    const raw = localStorage.getItem(KEY);
    const until = raw ? Number(raw) : 0;
    if (until > Date.now()) setStatus("ok");
    else setStatus("ask");
  }, [ageGate.enabled]);

  if (status === "ok" || status === "loading") return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 p-4">
      <div className="mx-auto mt-20 max-w-md">
        <GoldFrame innerClassName="p-5">
          {status === "ask" ? (
            <>
              <h2 className="text-lg font-extrabold text-[color:var(--front-gold-light)]">{ageGate.title}</h2>
              <p className="mt-2 text-sm text-white/80">{ageGate.content}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <GoldButton
                  variant="success"
                  onClick={() => {
                    localStorage.setItem(KEY, String(Date.now() + 30 * 24 * 60 * 60 * 1000));
                    document.cookie = "age_ok=1; Path=/; Max-Age=2592000; SameSite=Lax";
                    setStatus("ok");
                  }}
                >
                  {okText}
                </GoldButton>
                <GoldButton variant="danger" onClick={() => setStatus("blocked")}>
                  {noText}
                </GoldButton>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-extrabold text-[color:var(--front-danger-light)]">{blockedTitle}</h2>
              <p className="mt-2 text-sm text-white/80">{blockedBody}</p>
            </>
          )}
        </GoldFrame>
      </div>
    </div>
  );
}
