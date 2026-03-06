"use client";

import { DeskCardP44 } from "@/components/public/DeskCardP44";
import { useEffect, useMemo, useState } from "react";

type Step = 1 | 2 | 3;

export function WaRegisterStepper() {
  const [step, setStep] = useState<Step>(1);

  const [phone, setPhone] = useState("+60");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [waTicket, setWaTicket] = useState<string | null>(null);
  const canSend = cooldown <= 0;

  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");

  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const stepLabel = useMemo(() => {
    if (step === 1) return "Step 1/3 • WhatsApp Verify";
    if (step === 2) return "Step 2/3 • Profile";
    return "Step 3/3 • Confirm";
  }, [step]);

  const sendCode = async () => {
    setCooldown(60);
    alert("WhatsApp code sent (placeholder). Connect /api/auth/wa/send-code when ready.");
  };

  const verifyCode = async () => {
    if (code.trim().length !== 6) {
      alert("Please enter 6 digits code.");
      return;
    }
    setWaTicket("mock_wa_ticket");
    setStep(2);
  };

  const createAccount = async () => {
    if (!confirm) {
      alert("Please confirm name matches bank account.");
      return;
    }
    alert("Account created (placeholder). Connect POST /api/auth/register when ready.");
  };

  return (
    <DeskCardP44
      title="REGISTER (WhatsApp)"
      right={<div className="text-sm text-[var(--desk-text-muted)]">{stepLabel}</div>}
      className="flex h-[520px] flex-col"
    >
      {step === 1 && (
        <div className="space-y-3">
          <Field label="WhatsApp Phone (+60)">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 w-full rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] px-4 text-[var(--desk-text)] outline-none focus:border-[var(--desk-accent)]"
              placeholder="+60123456789"
            />
          </Field>

          <div className="flex gap-3">
            <button
              type="button"
              className="desk-btn-primary flex-1 disabled:opacity-50"
              onClick={sendCode}
              disabled={!canSend}
            >
              {canSend ? "Send WhatsApp Code" : `Resend in ${cooldown}s`}
            </button>
            <button
              type="button"
              className="desk-btn-secondary flex-1"
              onClick={() => setCooldown(0)}
            >
              Reset
            </button>
          </div>

          <Field label="6-digit Code">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="h-12 w-full rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] px-4 text-[var(--desk-text)] outline-none focus:border-[var(--desk-accent)]"
              placeholder="______"
            />
          </Field>

          <button type="button" className="desk-btn-primary w-full leading-12" onClick={verifyCode}>
            Verify Code
          </button>

          <div className="text-sm text-[var(--desk-text-muted)]">
            Tip: please check WhatsApp message requests if not received.
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="text-sm text-[var(--desk-text-muted)]">Verified ticket: {waTicket}</div>

          <Field label="Fullname">
            <input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="h-12 w-full rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] px-4 text-[var(--desk-text)] outline-none focus:border-[var(--desk-accent)]"
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] px-4 text-[var(--desk-text)] outline-none focus:border-[var(--desk-accent)]"
            />
          </Field>

          <Field label="Referral (optional)">
            <input
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
              className="h-12 w-full rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] px-4 text-[var(--desk-text)] outline-none focus:border-[var(--desk-accent)]"
            />
          </Field>

          <div className="flex gap-3">
            <button
              type="button"
              className="desk-btn-secondary flex-1"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button type="button" className="desk-btn-primary flex-1" onClick={() => setStep(3)}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <div className="rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)] p-4 text-sm text-[var(--desk-text-muted)]">
            Please confirm your fullname matches your bank account name to avoid issues.
          </div>

          <label className="flex items-center gap-3 text-sm text-[var(--desk-text)]">
            <input
              type="checkbox"
              checked={confirm}
              onChange={(e) => setConfirm(e.target.checked)}
            />
            I confirm the name matches bank account
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              className="desk-btn-secondary flex-1"
              onClick={() => setStep(2)}
            >
              Back
            </button>
            <button
              type="button"
              className="desk-btn-primary flex-1"
              onClick={createAccount}
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      <div className="mt-auto text-xs text-[var(--desk-text-muted)]">
        Desktop only spec. Mobile stays unchanged.
      </div>
    </DeskCardP44>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm text-[var(--desk-text-muted)]">{label}</div>
      {children}
    </div>
  );
}
