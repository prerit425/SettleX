import { Prisma } from "@prisma/client";

type DecimalLike = Prisma.Decimal | string | number | bigint;

/** Convert a 2-decimal currency amount into integer paise. */
export function toPaise(value: DecimalLike): bigint {
  const decimal = new Prisma.Decimal(value.toString());
  return BigInt(decimal.mul(100).toFixed(0));
}

export function fromPaise(paise: bigint): Prisma.Decimal {
  return new Prisma.Decimal(paise.toString()).div(100);
}

/** Equal split with deterministic remainder: first participants get the extra paise. */
export function splitEqually(amount: DecimalLike, count: number): Prisma.Decimal[] {
  if (count < 1) throw new Error("At least one participant is required");
  const total = toPaise(amount);
  const base = total / BigInt(count);
  const remainder = total % BigInt(count);
  return Array.from({ length: count }, (_, index) =>
    fromPaise(base + (BigInt(index) < remainder ? 1n : 0n)),
  );
}

export function formatPaise(paise: bigint): string {
  const sign = paise < 0n ? "-" : "";
  const absolute = paise < 0n ? -paise : paise;
  const rupees = new Intl.NumberFormat("en-IN").format(Number(absolute / 100n));
  return `${sign}₹${rupees}.${(absolute % 100n).toString().padStart(2, "0")}`;
}

export function formatMoney(value: DecimalLike): string {
  return formatPaise(toPaise(value));
}
