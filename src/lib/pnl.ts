import type { InstrumentType, TradeSide } from "@/generated/prisma/client";

export interface PnlInput {
  instrumentType: InstrumentType;
  side: TradeSide;
  quantity: number;
  entryPrice: number;
  exitPrice: number | null | undefined;
  fees: number;
  contractMultiplier?: number | null; // futures
  lotSize?: number | null; // forex
}

const OPTION_SHARES_PER_CONTRACT = 100;

/**
 * Per-instrument PnL math. Called from both manual entry and CSV import
 * so pricing logic only lives in one place.
 */
export function calculatePnl(input: PnlInput): number | null {
  if (input.exitPrice == null) return null;

  const direction = input.side === "LONG" ? 1 : -1;
  const priceDelta = (input.exitPrice - input.entryPrice) * direction;

  let multiplier: number;
  switch (input.instrumentType) {
    case "OPTION":
      multiplier = OPTION_SHARES_PER_CONTRACT;
      break;
    case "FUTURE":
      multiplier = input.contractMultiplier ?? 1;
      break;
    case "FOREX":
      multiplier = input.lotSize ?? 1;
      break;
    case "STOCK":
    case "CRYPTO":
    default:
      multiplier = 1;
      break;
  }

  const grossPnl = priceDelta * input.quantity * multiplier;
  return grossPnl - input.fees;
}
