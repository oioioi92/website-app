import { db } from "@/lib/db";
import { cookies } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PublicMePage() {
  const cookieStore = await cookies();
  const userRef = cookieStore.get("member_ref")?.value;

  if (!userRef) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 text-white">
        <h1 className="text-2xl font-semibold">My Claims</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">No member session. Go to home and use Test Login first.</p>
        <Link className="mt-4 inline-block text-[color:var(--front-gold)] underline" href="/">
          Back to Home
        </Link>
      </main>
    );
  }

  try {
    const member = await db.member.findUnique({
      where: { userRef },
      select: { id: true, userRef: true }
    });
    if (!member) {
      return (
        <main className="mx-auto max-w-3xl px-4 py-8 text-white">
          <h1 className="text-2xl font-semibold">My Claims</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Member not found.</p>
        </main>
      );
    }
    const claims = await db.promotionClaim.findMany({
      where: { memberId: member.id },
      include: { promotion: { select: { title: true } } },
      orderBy: { claimedAt: "desc" },
      take: 20
    });

    return (
      <main className="mx-auto max-w-4xl px-4 py-8 text-white">
        <div className="rb-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h1 className="text-base font-semibold text-[color:var(--front-gold-light)]">My Claims ({member.userRef})</h1>
            <Link className="text-xs font-semibold text-[color:var(--rb-gold2)] hover:text-[color:var(--front-gold-light)]" href="/">
              Back to Home
            </Link>
          </div>
          <div className="p-3">
            <div className="ui-table-wrap">
              <table className="ui-table">
                <thead>
              <tr>
                <th className="px-3 py-2 text-left">Promotion</th>
                <th className="px-3 py-2 text-left">Claimed At</th>
                <th className="px-3 py-2 text-left">Amount</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
                </thead>
                <tbody>
                  {claims.map((c) => (
                    <tr key={c.id} className="ui-row-min">
                      <td>{c.promotion.title}</td>
                      <td>{new Date(c.claimedAt).toLocaleString()}</td>
                      <td>{c.amountGranted?.toFixed(2) ?? "-"}</td>
                      <td>{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    );
  } catch {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 text-white">
        <h1 className="text-2xl font-semibold">My Claims</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">数据库未连接，请检查 .env 中的 DATABASE_URL。</p>
        <Link className="mt-4 inline-block text-[color:var(--front-gold)] underline" href="/">
          Back to Home
        </Link>
      </main>
    );
  }
}
