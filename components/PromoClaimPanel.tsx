"use client";

import { useEffect, useState } from "react";

type SessionMember = { id: string; userRef: string; displayName: string | null };

export function PromoClaimPanel({ promotionId }: { promotionId: string }) {
  const [member, setMember] = useState<SessionMember | null>(null);
  const [userRef, setUserRef] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [baseAmount, setBaseAmount] = useState("10");
  const [result, setResult] = useState<{
    ok: boolean;
    reason: string;
    grantAmount: string;
    nextEligibleAt?: string | null;
    ruleSummary?: Record<string, unknown>;
  } | null>(null);
  const [msg, setMsg] = useState("");

  async function loadSession() {
    const res = await fetch("/api/public/member/session", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setMember(data.member ?? null);
  }

  useEffect(() => {
    void loadSession();
  }, []);

  async function testLogin() {
    const res = await fetch("/api/public/member/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userRef, displayName })
    });
    if (!res.ok) return;
    setMsg("Test login success");
    await loadSession();
  }

  async function logout() {
    await fetch("/api/public/member/session/logout", { method: "POST" });
    setMember(null);
    setResult(null);
  }

  async function preview() {
    const res = await fetch(`/api/public/promotions/${promotionId}/claim/preview`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ baseAmount: Number(baseAmount) })
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setMsg(d.error ?? "Preview failed");
      return;
    }
    setResult(await res.json());
  }

  async function confirm() {
    const res = await fetch(`/api/public/promotions/${promotionId}/claim/confirm`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ baseAmount: Number(baseAmount) })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.reason ?? data.error ?? "Claim failed");
      return;
    }
    setMsg(`Claim success: ${data.grantedAmount}`);
    await preview();
  }

  return (
    <div className="mt-6 rounded-xl border border-[color:var(--admin-warning)]/40 bg-[color:var(--admin-panel2)] p-4 text-[color:var(--admin-text)] [color-scheme:light]" data-admin-theme>
      <h4 className="text-lg font-semibold">Promo Claim (Internal Test)</h4>
      {!member ? (
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input
            className="rounded border border-gray-300 bg-white px-3 py-2 text-gray-900"
            placeholder="userRef (R001)"
            value={userRef}
            onChange={(e) => setUserRef(e.target.value)}
          />
          <input
            className="rounded border border-gray-300 bg-white px-3 py-2 text-gray-900"
            placeholder="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={() => void testLogin()}
            disabled={!userRef.trim()}
          >
            Test Login
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <p className="text-sm">Your ID: {member.userRef}</p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="w-[160px] rounded border border-gray-300 bg-white px-3 py-2 text-gray-900"
              type="number"
              value={baseAmount}
              onChange={(e) => setBaseAmount(e.target.value)}
            />
            <button
              type="button"
              className="rounded border border-gray-400 bg-white px-4 py-2 text-gray-800 hover:bg-gray-50"
              onClick={() => void preview()}
            >
              Check Eligibility
            </button>
            <button
              type="button"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              data-claim-now-btn="1"
              onClick={() => void confirm()}
              disabled={!result?.ok}
            >
              Claim Now
            </button>
            <button
              type="button"
              className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => void logout()}
            >
              Logout
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className={`mt-3 rounded-lg p-3 text-sm ${result.ok ? "border border-[color:var(--admin-success)]/30 bg-[color:var(--admin-success)]/10" : "border border-[color:var(--admin-danger)]/35 bg-[color:var(--admin-danger)]/10"}`}>
          {result.ok ? (
            <p>Eligible. grantAmount: {result.grantAmount}</p>
          ) : (
            <p>
              Blocked: {result.reason}
              {result.nextEligibleAt ? ` / next: ${new Date(result.nextEligibleAt).toLocaleString()}` : ""}
            </p>
          )}
        </div>
      )}
      {msg && <p className="mt-2 text-xs text-[color:var(--admin-muted)]">{msg}</p>}
    </div>
  );
}
