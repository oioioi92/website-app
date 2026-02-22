"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const DEFAULT_DEPOSIT_COLOR = "#2563eb";
const DEFAULT_WITHDRAW_COLOR = "#d97706";
const DEFAULT_LOGIN_COLOR = "#caa04a"; // gold
const DEFAULT_REGISTER_COLOR = "#1590d5"; // blue

type Member = { id: string; userRef: string; displayName: string | null };

type ButtonImages = {
  login?: string | null;
  register?: string | null;
  deposit?: string | null;
  withdraw?: string | null;
  refresh?: string | null;
  signout?: string | null;
};

function ActionButton({
  href,
  onClick,
  isLink,
  imageUrl,
  children,
  className,
  style,
  target,
  rel,
  disabled,
  "data-testid": testid
}: {
  href?: string;
  onClick?: () => void;
  isLink: boolean;
  imageUrl?: string | null;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  target?: string;
  rel?: string;
  disabled?: boolean;
  "data-testid"?: string;
}) {
  const wrap =
    "inline-flex h-10 min-w-[100px] items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold";
  const content = imageUrl ? (
    <img src={imageUrl} alt="" className="max-h-8 w-auto max-w-[120px] object-contain" />
  ) : (
    children
  );
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={`${wrap} opacity-50 cursor-not-allowed ${className ?? ""}`}
        style={style}
        data-testid={testid}
      >
        {content}
      </button>
    );
  }
  if (isLink && href) {
    // External link support (deposit/login pages are often on another domain)
    if (/^https?:\/\//i.test(href)) {
      return (
        <a
          href={href}
          target={target ?? "_blank"}
          rel={rel ?? "noopener noreferrer"}
          className={`${wrap} ${className ?? ""}`}
          style={style}
          data-testid={testid}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={`${wrap} ${className ?? ""}`} style={style} data-testid={testid}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${wrap} ${className ?? ""}`} style={style} data-testid={testid}>
      {content}
    </button>
  );
}

export function WalletActionBarV3({
  variant = "default",
  loginUrl = "#",
  registerUrl = "#",
  depositUrl = "#",
  withdrawUrl = "#",
  depositColor,
  withdrawColor,
  buttonImages,
  limits
}: {
  variant?: "default" | "reference";
  loginUrl?: string | null;
  registerUrl?: string | null;
  depositUrl?: string | null;
  withdrawUrl?: string | null;
  depositColor?: string | null;
  withdrawColor?: string | null;
  buttonImages?: ButtonImages | null;
  limits?: {
    minDeposit?: string | null;
    maxDeposit?: string | null;
    minWithdraw?: string | null;
    maxWithdraw?: string | null;
  } | null;
}) {
  const [member, setMember] = useState<Member | null | undefined>(undefined);
  const imgs = buttonImages ?? {};

  useEffect(() => {
    fetch("/api/public/member/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { member: null }))
      .then((json: { member?: Member | null }) => setMember(json.member ?? null))
      .catch(() => setMember(null));
  }, []);

  const depositStyle = depositColor ? { backgroundColor: depositColor } : undefined;
  const withdrawStyle = withdrawColor ? { backgroundColor: withdrawColor } : undefined;
  const loginStyle = { backgroundColor: DEFAULT_LOGIN_COLOR };
  const registerStyle = { backgroundColor: DEFAULT_REGISTER_COLOR };

  const canLogin = Boolean(loginUrl && loginUrl !== "#");
  const canRegister = Boolean(registerUrl && registerUrl !== "#");
  const canDeposit = Boolean(depositUrl && depositUrl !== "#");
  const canWithdraw = Boolean(withdrawUrl && withdrawUrl !== "#");

  const handleRefresh = () => {
    // Simplest reliable "refresh" behavior across WeChat/webview.
    window.location.reload();
  };

  const handleSignOut = () => {
    fetch("/api/public/member/session/logout", { method: "POST" }).then(() => setMember(null));
  };

  // Mobile reference layout (match screenshot)
  if (variant === "reference") {
    // If theme URLs are not configured yet, fall back to in-site routes
    // so the buttons are still clickable (and can show a helpful page).
    const loginHref = (loginUrl && loginUrl.trim().length > 0 ? loginUrl : "/login") ?? "/login";
    const registerHref = (registerUrl && registerUrl.trim().length > 0 ? registerUrl : "/register") ?? "/register";
    const depositHref = (depositUrl && depositUrl.trim().length > 0 ? depositUrl : "/deposit") ?? "/deposit";
    const withdrawHref = (withdrawUrl && withdrawUrl.trim().length > 0 ? withdrawUrl : "/withdraw") ?? "/withdraw";

    return (
      <section className="w-full" data-testid="v3-action-bar-reference">
        {/* Remove the blue background per request; keep a subtle dark glass panel */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
          {/* Top: big pills */}
          <div className="grid grid-cols-2 gap-4">
            <ActionButton
              isLink
              href={loginHref}
              data-testid="action-bar-login"
              className="ui-ab-seq flex h-14 items-center justify-center rounded-full bg-gradient-to-b from-[#e2c785] to-[#b78d2e] text-xl font-extrabold tracking-wide text-black shadow-[inset_0_2px_0_rgba(255,255,255,0.35),0_6px_18px_rgba(0,0,0,0.20)]"
              style={{ ["--ab-i" as string]: 0 } as React.CSSProperties}
            >
              LOGIN
            </ActionButton>
            <ActionButton
              isLink
              href={registerHref}
              data-testid="action-bar-register"
              className="ui-ab-seq flex h-14 items-center justify-center rounded-full bg-gradient-to-b from-[#1fb2ff] to-[#0b7fc5] text-xl font-extrabold tracking-wide text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.20)]"
              style={{ ["--ab-i" as string]: 1 } as React.CSSProperties}
            >
              REGISTER
            </ActionButton>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_168px] gap-4">
            {/* Left: balance + limits */}
            <div className="min-w-0">
              <p className="text-base font-semibold text-white/85">Balance:</p>
              <p className="mt-1 text-3xl font-extrabold text-[#f0b400] tabular-nums" data-testid="action-bar-balance">
                {member && member !== null ? "RM—" : "RM0.00"}
              </p>
              <div className="mt-2 space-y-1 text-sm font-semibold text-white/70">
                <div>
                  Minimum Deposit:{" "}
                  <span className="font-extrabold text-white/90 tabular-nums">{limits?.minDeposit ?? "—"}</span>
                </div>
                <div>
                  Minimum Withdraw:{" "}
                  <span className="font-extrabold text-white/90 tabular-nums">{limits?.minWithdraw ?? "—"}</span>
                </div>
              </div>
            </div>

            {/* Right: vertical buttons */}
            <div className="grid gap-2">
              <ActionButton
                isLink
                href={depositHref}
                data-testid="action-bar-deposit"
                className="ui-ab-seq flex h-11 w-full items-center justify-center rounded-full border border-black/15 bg-gradient-to-b from-[#2fe46d] to-[#13a545] text-base font-extrabold text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.28),0_4px_12px_rgba(0,0,0,0.18)]"
                style={{ ["--ab-i" as string]: 2 } as React.CSSProperties}
              >
                DEPOSIT
              </ActionButton>
              <ActionButton
                isLink
                href={withdrawHref}
                data-testid="action-bar-withdraw"
                className="ui-ab-seq flex h-11 w-full items-center justify-center rounded-full border border-black/15 bg-gradient-to-b from-[#ff3b3b] to-[#b30000] text-base font-extrabold text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.20),0_4px_12px_rgba(0,0,0,0.18)]"
                style={{ ["--ab-i" as string]: 3 } as React.CSSProperties}
              >
                WITHDRAW
              </ActionButton>
              <button
                type="button"
                onClick={handleRefresh}
                data-testid="action-bar-refresh"
                className="ui-ab-seq flex h-11 w-full items-center justify-center rounded-full border border-black/15 bg-gradient-to-b from-[#ffd24a] to-[#e0a700] text-base font-extrabold text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.28),0_4px_12px_rgba(0,0,0,0.18)]"
                style={{ ["--ab-i" as string]: 4 } as React.CSSProperties}
              >
                REFRESH
              </button>
            </div>
          </div>

          {member && member !== null ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full rounded-lg border border-black/15 bg-black/10 px-3 py-2 text-sm font-bold text-black/75"
                data-testid="action-bar-signout"
              >
                SIGN OUT
              </button>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section
      className="mx-auto w-full max-w-[1320px] px-6"
      data-testid="v3-action-bar"
    >
      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
        {/* Left: Login/Register + Balance + limits */}
        <div className="rounded-xl border border-white/15 bg-black/25 p-3">
          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              isLink
              href={loginUrl ?? "#"}
              imageUrl={imgs.login}
              style={loginStyle}
              className="text-white hover:opacity-95"
              disabled={!canLogin}
              data-testid="action-bar-login"
            >
              LOGIN
            </ActionButton>
            <ActionButton
              isLink
              href={registerUrl ?? "#"}
              imageUrl={imgs.register}
              style={registerStyle}
              className="text-white hover:opacity-95"
              disabled={!canRegister}
              data-testid="action-bar-register"
            >
              REGISTER
            </ActionButton>
          </div>

          <div className="mt-3 rounded-lg border border-white/15 bg-white/5 p-3" data-testid="action-bar-balance">
            <p className="text-[12px] font-semibold text-white/75">Balance:</p>
            <p className="mt-1 text-2xl font-extrabold text-[color:var(--front-gold)] tabular-nums">
              {member && member !== null ? "RM—" : "RM0.00"}
            </p>
            {limits && (limits.minDeposit || limits.minWithdraw) ? (
              <p className="mt-2 text-[12px] text-white/65">
                {[
                  limits.minDeposit && `Minimum Deposit: ${limits.minDeposit}`,
                  limits.minWithdraw && `Minimum Withdrawal: ${limits.minWithdraw}`
                ]
                  .filter(Boolean)
                  .join("  ")}
              </p>
            ) : null}
          </div>
        </div>

        {/* Right: Deposit/Withdraw/Refresh (+ Signout when available) */}
        <div className="grid gap-2">
          <ActionButton
            isLink
            href={depositUrl ?? "#"}
            imageUrl={imgs.deposit}
            style={depositStyle ?? { backgroundColor: DEFAULT_DEPOSIT_COLOR }}
            className="w-full text-white hover:opacity-90"
            disabled={!canDeposit}
            data-testid="action-bar-deposit"
          >
            DEPOSIT
          </ActionButton>
          <ActionButton
            isLink
            href={withdrawUrl ?? "#"}
            imageUrl={imgs.withdraw}
            style={withdrawStyle ?? { backgroundColor: DEFAULT_WITHDRAW_COLOR }}
            className="w-full text-white hover:opacity-90"
            disabled={!canWithdraw}
            data-testid="action-bar-withdraw"
          >
            WITHDRAW
          </ActionButton>
          <ActionButton
            isLink={false}
            onClick={handleRefresh}
            imageUrl={imgs.refresh}
            className="w-full border border-white/20 bg-white/5 text-white hover:bg-white/10"
            data-testid="action-bar-refresh"
          >
            REFRESH
          </ActionButton>
          {member && member !== null ? (
            <ActionButton
              isLink={false}
              onClick={handleSignOut}
              imageUrl={imgs.signout}
              className="w-full border border-white/20 bg-white/5 text-white hover:bg-white/10"
              data-testid="action-bar-signout"
            >
              SIGN OUT
            </ActionButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}
