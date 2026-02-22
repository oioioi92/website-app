import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { recalcSheetLines } from "@/lib/ledger/reconcile";
import { normalizeRule } from "@/lib/promo/engine";
import { PROMO_TEMPLATES } from "@/lib/promo/templates";

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function upsertPromotionByTitle(input: {
  title: string;
  subtitle: string;
  percent: number;
  ruleJson: Record<string, unknown>;
  sortOrder: number;
}) {
  const found = await db.promotion.findFirst({ where: { title: input.title } });
  if (found) {
    return db.promotion.update({
      where: { id: found.id },
      data: {
        subtitle: input.subtitle,
        percent: input.percent,
        ruleJson: normalizeRule(input.ruleJson as never) as never,
        isClaimable: true,
        isActive: true,
        sortOrder: input.sortOrder
      }
    });
  }
  return db.promotion.create({
    data: {
      title: input.title,
      subtitle: input.subtitle,
      coverUrl: null,
      detailJson: { blocks: [{ id: "seed-h1", type: "h1", text: input.title }] },
      percent: input.percent,
      isClaimable: true,
      ruleJson: normalizeRule(input.ruleJson as never) as never,
      isActive: true,
      sortOrder: input.sortOrder
    }
  });
}

export async function seedTestScenarios() {
  const internalMode = (process.env.INTERNAL_TEST_MODE ?? "0") === "1";
  const today = todayStart();

  const admin = await db.adminUser.findFirst({ where: { role: "admin" }, orderBy: { createdAt: "asc" } });
  if (!admin) throw new Error("No admin user found. Run seed:admin first.");

  const [r001, r002, r003] = await Promise.all([
    db.member.upsert({
      where: { userRef: "R001" },
      create: {
        userRef: "R001",
        displayName: "Robin Smoke",
        isActive: true,
        referralCode: "REF001",
        mobile: "60123450001"
      },
      update: {
        displayName: "Robin Smoke",
        isActive: true,
        referralCode: "REF001",
        mobile: "60123450001"
      }
    }),
    db.member.upsert({
      where: { userRef: "R002" },
      create: {
        userRef: "R002",
        displayName: "Alice Test",
        isActive: true,
        referralCode: "REF002",
        mobile: "60123450002"
      },
      update: {
        displayName: "Alice Test",
        isActive: true,
        referralCode: "REF002",
        mobile: "60123450002"
      }
    }),
    db.member.upsert({
      where: { userRef: "R003" },
      create: { userRef: "R003", displayName: "Bob Test", isActive: true },
      update: { displayName: "Bob Test", isActive: true }
    })
  ]);

  // 推荐关系：R001 为顶级推荐人，R002/R003 为 R001 下线；R002 也有推荐码，R004/R005 为 R002 下线；R006/R007 为 R001 下线
  await db.member.update({
    where: { id: r002.id },
    data: { referrerId: r001.id }
  });
  await db.member.update({
    where: { id: r003.id },
    data: { referrerId: r001.id }
  });

  await Promise.all([
    db.member.upsert({
      where: { userRef: "R004" },
      create: {
        userRef: "R004",
        displayName: "Carol Down",
        isActive: true,
        referrerId: r002.id,
        depositCount: 2,
        withdrawCount: 0
      },
      update: { displayName: "Carol Down", referrerId: r002.id, depositCount: 2, withdrawCount: 0 }
    }),
    db.member.upsert({
      where: { userRef: "R005" },
      create: {
        userRef: "R005",
        displayName: "Dave Down",
        isActive: true,
        referrerId: r002.id,
        depositCount: 1,
        withdrawCount: 1
      },
      update: { displayName: "Dave Down", referrerId: r002.id, depositCount: 1, withdrawCount: 1 }
    }),
    db.member.upsert({
      where: { userRef: "R006" },
      create: {
        userRef: "R006",
        displayName: "Eve Down",
        isActive: true,
        referrerId: r001.id,
        mobile: "60123450006"
      },
      update: { displayName: "Eve Down", referrerId: r001.id, mobile: "60123450006" }
    }),
    db.member.upsert({
      where: { userRef: "R007" },
      create: {
        userRef: "R007",
        displayName: "Frank Down",
        isActive: true,
        referrerId: r001.id
      },
      update: { displayName: "Frank Down", referrerId: r001.id }
    })
  ]);

  // 仿参考图：JKJ 风格推荐人，用于测试 Affiliate / Top Referrer 报表
  const jkj01 = await db.member.upsert({
    where: { userRef: "JKJ00001" },
    create: {
      userRef: "JKJ00001",
      displayName: "Trent Morey",
      isActive: true,
      referralCode: "JKJ4054589",
      mobile: "60181167001"
    },
    update: { displayName: "Trent Morey", referralCode: "JKJ4054589", mobile: "60181167001" }
  });
  const jkj02 = await db.member.upsert({
    where: { userRef: "JKJ00007" },
    create: {
      userRef: "JKJ00007",
      displayName: "Casey d Cordwell",
      isActive: true,
      referrerId: jkj01.id,
      referralCode: "JKJ4783058",
      mobile: "60181167007"
    },
    update: { displayName: "Casey d Cordwell", referrerId: jkj01.id, referralCode: "JKJ4783058", mobile: "60181167007" }
  });
  await db.member.upsert({
    where: { userRef: "JKJ00008" },
    create: {
      userRef: "JKJ00008",
      displayName: "Binji10k",
      isActive: true,
      referrerId: jkj01.id,
      referralCode: "JKJ4780287",
      depositCount: 1,
      withdrawCount: 0
    },
    update: { displayName: "Binji10k", referrerId: jkj01.id, referralCode: "JKJ4780287", depositCount: 1, withdrawCount: 0 }
  });
  await db.member.upsert({
    where: { userRef: "JKJ00005" },
    create: {
      userRef: "JKJ00005",
      displayName: "PC7",
      isActive: true,
      referrerId: jkj02.id,
      depositCount: 0,
      withdrawCount: 0
    },
    update: { displayName: "PC7", referrerId: jkj02.id, depositCount: 0, withdrawCount: 0 }
  });

  const p1Tpl = PROMO_TEMPLATES.find((x) => x.key === "DAILY_CLAIM_1")!;
  const p2Tpl = PROMO_TEMPLATES.find((x) => x.key === "WEEKLY_CLAIM_3")!;
  const p3Tpl = PROMO_TEMPLATES.find((x) => x.key === "LIFETIME_ONCE")!;
  const p4Tpl = PROMO_TEMPLATES.find((x) => x.key === "FIRST_DEPOSIT")!;

  const [p1, p2, p3, p4] = await Promise.all([
    upsertPromotionByTitle({
      title: "[TEST] P1 DAILY_CLAIM_1",
      subtitle: "internal scenario",
      percent: 10,
      ruleJson: p1Tpl.rule as never,
      sortOrder: 0
    }),
    upsertPromotionByTitle({
      title: "[TEST] P2 WEEKLY_CLAIM_3",
      subtitle: "internal scenario",
      percent: 10,
      ruleJson: p2Tpl.rule as never,
      sortOrder: 1
    }),
    upsertPromotionByTitle({
      title: "[TEST] P3 LIFETIME_ONCE",
      subtitle: "internal scenario",
      percent: 20,
      ruleJson: p3Tpl.rule as never,
      sortOrder: 2
    }),
    upsertPromotionByTitle({
      title: "[TEST] P4 FIRST_DEPOSIT",
      subtitle: "internal scenario",
      percent: 100,
      ruleJson: p4Tpl.rule as never,
      sortOrder: 3
    })
  ]);

  await db.promotionClaim.deleteMany({
    where: {
      promotionId: { in: [p1.id, p2.id, p3.id, p4.id] },
      memberId: { in: [r001.id, r002.id, r003.id] }
    }
  });
  if (internalMode) {
    await db.promotionClaimAttempt.deleteMany({
      where: {
        promotionId: { in: [p1.id, p2.id, p3.id, p4.id] },
        memberId: { in: [r001.id, r002.id, r003.id] }
      }
    });
  }

  await db.promotionClaim.create({
    data: {
      promotionId: p1.id,
      memberId: r001.id,
      status: "APPROVED",
      amountGranted: new Prisma.Decimal(10),
      metaJson: { scenario: "R001 first claim ok", baseAmount: 100 },
      createdByAdminId: admin.id,
      claimedAt: today
    }
  });
  await db.promotionClaim.create({
    data: {
      promotionId: p3.id,
      memberId: r002.id,
      status: "APPROVED",
      amountGranted: new Prisma.Decimal(20),
      metaJson: { scenario: "R002 first claim ok", baseAmount: 100 },
      createdByAdminId: admin.id,
      claimedAt: today
    }
  });

  if (internalMode) {
    await db.promotionClaimAttempt.createMany({
      data: [
        {
          promotionId: p1.id,
          memberId: r001.id,
          ok: true,
          reason: "OK",
          happenedAt: today
        },
        {
          promotionId: p1.id,
          memberId: r001.id,
          ok: false,
          reason: "LIMIT_REACHED",
          happenedAt: new Date(today.getTime() + 60 * 1000)
        },
        {
          promotionId: p3.id,
          memberId: r002.id,
          ok: true,
          reason: "OK",
          happenedAt: today
        },
        {
          promotionId: p3.id,
          memberId: r002.id,
          ok: false,
          reason: "LIFETIME_LIMIT",
          happenedAt: new Date(today.getTime() + 2 * 60 * 1000)
        }
      ]
    });
  }

  const provider =
    (await db.gameProvider.findFirst({ where: { isActive: true }, orderBy: { sortOrder: "asc" } })) ??
    (await db.gameProvider.create({
      data: {
        name: "TEST_PROVIDER",
        logoUrl: null,
        isActive: true,
        sortOrder: 0
      }
    }));

  await db.walletTransaction.create({
    data: {
      memberId: r001.id,
      type: "DEPOSIT",
      amountSigned: new Prisma.Decimal(200),
      currency: "MYR",
      channel: "BANK",
      status: "COMPLETED",
      refNo: `TEST-WALLET-${Date.now()}`,
      note: "seed test scenario",
      happenedAt: new Date(today.getTime() + 5 * 60 * 1000),
      createdByAdminId: admin.id
    }
  });
  await db.providerTransaction.create({
    data: {
      providerId: provider.id,
      memberId: r001.id,
      type: "CREDIT_IN",
      amountSigned: new Prisma.Decimal(150),
      currency: "MYR",
      refNo: `TEST-PROVIDER-${Date.now()}`,
      note: "seed test scenario",
      happenedAt: new Date(today.getTime() + 6 * 60 * 1000),
      createdByAdminId: admin.id
    }
  });

  const sheet = await db.reconcileSheet.create({
    data: {
      date: today,
      status: "OPEN",
      openedAt: new Date(),
      openedByAdminId: admin.id,
      note: "[TEST_SCENARIO]"
    }
  });

  const lines = await recalcSheetLines(sheet.id, today);
  const firstLine = lines[0];
  if (firstLine) {
    const actual = firstLine.closingBalanceExpected.add(new Prisma.Decimal(150));
    const diff = actual.sub(firstLine.closingBalanceExpected);
    await db.reconcileLine.update({
      where: { id: firstLine.id },
      data: {
        closingBalanceActual: actual,
        diff,
        isMatched: false
      }
    });
  }

  return {
    members: [
      r001.userRef,
      r002.userRef,
      r003.userRef,
      "R004",
      "R005",
      "R006",
      "R007",
      "JKJ00001",
      "JKJ00007",
      "JKJ00008",
      "JKJ00005"
    ],
    promotions: [p1.title, p2.title, p3.title, p4.title],
    sheetId: sheet.id,
    internalMode
  };
}
