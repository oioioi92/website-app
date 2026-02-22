import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { calcDiff, calcExpected, calcInOut } from "@/lib/ledger/calc";

function dayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function ensureSheetLines(sheetId: string, date: Date) {
  const providers = await db.gameProvider.findMany({
    where: { isActive: true },
    select: { id: true }
  });

  await Promise.all(
    providers.map(async (provider) => {
      const exists = await db.reconcileLine.findFirst({
        where: { sheetId, providerId: provider.id },
        select: { id: true }
      });
      if (exists) return;
      await db.reconcileLine.create({
        data: {
          sheetId,
          providerId: provider.id,
          openingBalance: new Prisma.Decimal(0),
          totalIn: new Prisma.Decimal(0),
          totalOut: new Prisma.Decimal(0),
          closingBalanceExpected: new Prisma.Decimal(0)
        }
      });
    })
  );

  return recalcSheetLines(sheetId, date);
}

export async function recalcSheetLines(sheetId: string, date: Date) {
  const { start, end } = dayRange(date);
  return db.$transaction(async (tx) => {
    const lines = await tx.reconcileLine.findMany({
      where: { sheetId },
      select: {
        id: true,
        providerId: true,
        closingBalanceActual: true
      }
    });

    for (const line of lines) {
      // Opening balance can only come from snapshot history.
      const snapshot = await tx.balanceSnapshot.findFirst({
        where: {
          providerId: line.providerId,
          takenAt: { lt: start }
        },
        orderBy: { takenAt: "desc" },
        select: { balance: true }
      });

      const dayTx = await tx.providerTransaction.findMany({
        where: { providerId: line.providerId, happenedAt: { gte: start, lt: end } },
        select: { amountSigned: true }
      });

      const openingBalance = snapshot?.balance ?? new Prisma.Decimal(0);
      const { totalIn, totalOut } = calcInOut(dayTx.map((txItem) => txItem.amountSigned));
      const expected = calcExpected(openingBalance, totalIn, totalOut);
      const hasActual = line.closingBalanceActual !== null;
      const diff = hasActual ? calcDiff(line.closingBalanceActual!, expected) : null;
      const isMatched = hasActual ? diff!.equals(0) : false;

      await tx.reconcileLine.update({
        where: { id: line.id },
        data: {
          openingBalance,
          totalIn,
          totalOut,
          closingBalanceExpected: expected,
          diff,
          isMatched
        }
      });
    }

    return tx.reconcileLine.findMany({
      where: { sheetId },
      include: { provider: { select: { id: true, name: true } } },
      orderBy: { provider: { name: "asc" } }
    });
  });
}
