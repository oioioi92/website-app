import { Prisma } from "@prisma/client";

export type DecimalLike = Prisma.Decimal | number | string;

function d(value: DecimalLike): Prisma.Decimal {
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
}

export function abs(value: DecimalLike): Prisma.Decimal {
  const n = d(value);
  return n.isNegative() ? n.mul(-1) : n;
}

export function sum(values: DecimalLike[]): Prisma.Decimal {
  let acc = new Prisma.Decimal(0);
  for (const value of values) {
    acc = acc.add(d(value));
  }
  return acc;
}

export function toSignedAmount(type: "DEPOSIT" | "WITHDRAW" | "ADJUSTMENT", amount: DecimalLike) {
  const normalized = abs(amount);
  if (type === "DEPOSIT") return normalized;
  if (type === "WITHDRAW") return normalized.mul(-1);
  return d(amount);
}

export function toProviderSignedAmount(type: "CREDIT_IN" | "CREDIT_OUT" | "ADJUSTMENT", amount: DecimalLike) {
  const normalized = abs(amount);
  if (type === "CREDIT_IN") return normalized;
  if (type === "CREDIT_OUT") return normalized.mul(-1);
  return d(amount);
}

export function calcInOut(amounts: DecimalLike[]) {
  const totalIn = sum(
    amounts
      .map((v) => d(v))
      .filter((v) => v.gt(0))
  );
  const totalOut = sum(
    amounts
      .map((v) => d(v))
      .filter((v) => v.lt(0))
      .map((v) => v.mul(-1))
  );
  return { totalIn, totalOut };
}

export function calcExpected(openingBalance: DecimalLike, totalIn: DecimalLike, totalOut: DecimalLike) {
  return d(openingBalance).add(d(totalIn)).sub(d(totalOut));
}

export function calcDiff(actual: DecimalLike, expected: DecimalLike) {
  return d(actual).sub(d(expected));
}
