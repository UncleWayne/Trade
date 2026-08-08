"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/require-user";
import { calculatePnl } from "@/lib/pnl";
import type { InstrumentType, TradeSide, OptionType } from "@/generated/prisma/client";

export interface TradeInput {
  accountId: string;
  instrumentType: InstrumentType;
  symbol: string;
  side: TradeSide;
  quantity: number;
  entryPrice: number;
  exitPrice?: number | null;
  entryDate: Date;
  exitDate?: Date | null;
  fees?: number;
  contractMultiplier?: number | null;
  lotSize?: number | null;
  strike?: number | null;
  expiry?: Date | null;
  optionType?: OptionType | null;
  notes?: string | null;
  tagIds?: string[];
}

async function assertOwnsAccount(userId: string, accountId: string) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
    select: { id: true },
  });
  if (!account) throw new Error("Account not found");
}

export async function createTrade(input: TradeInput) {
  const userId = await requireUserId();
  await assertOwnsAccount(userId, input.accountId);

  const fees = input.fees ?? 0;
  const pnl = calculatePnl({
    instrumentType: input.instrumentType,
    side: input.side,
    quantity: input.quantity,
    entryPrice: input.entryPrice,
    exitPrice: input.exitPrice,
    fees,
    contractMultiplier: input.contractMultiplier,
    lotSize: input.lotSize,
  });

  const trade = await prisma.trade.create({
    data: {
      userId,
      accountId: input.accountId,
      status: input.exitPrice == null ? "OPEN" : "CLOSED",
      instrumentType: input.instrumentType,
      symbol: input.symbol.toUpperCase(),
      side: input.side,
      quantity: input.quantity,
      entryPrice: input.entryPrice,
      exitPrice: input.exitPrice ?? null,
      entryDate: input.entryDate,
      exitDate: input.exitDate ?? null,
      fees,
      contractMultiplier: input.contractMultiplier ?? null,
      lotSize: input.lotSize ?? null,
      strike: input.strike ?? null,
      expiry: input.expiry ?? null,
      optionType: input.optionType ?? null,
      pnl,
      notes: input.notes ?? null,
      tags: input.tagIds?.length
        ? { create: input.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  });

  revalidatePath("/dashboard");
  return trade;
}

export async function updateTrade(tradeId: string, input: Partial<TradeInput>) {
  const userId = await requireUserId();
  const existing = await prisma.trade.findFirst({ where: { id: tradeId, userId } });
  if (!existing) throw new Error("Trade not found");

  const merged = {
    instrumentType: input.instrumentType ?? existing.instrumentType,
    side: input.side ?? existing.side,
    quantity: input.quantity ?? existing.quantity,
    entryPrice: input.entryPrice ?? existing.entryPrice,
    exitPrice: input.exitPrice !== undefined ? input.exitPrice : existing.exitPrice,
    fees: input.fees ?? existing.fees,
    contractMultiplier:
      input.contractMultiplier !== undefined
        ? input.contractMultiplier
        : existing.contractMultiplier,
    lotSize: input.lotSize !== undefined ? input.lotSize : existing.lotSize,
  };

  const pnl = calculatePnl(merged);
  const { tagIds, ...rest } = input;

  const trade = await prisma.trade.update({
    where: { id: tradeId },
    data: {
      ...rest,
      symbol: input.symbol?.toUpperCase(),
      status: merged.exitPrice == null ? "OPEN" : "CLOSED",
      pnl,
      tags: tagIds
        ? {
            deleteMany: {},
            create: tagIds.map((tagId) => ({ tagId })),
          }
        : undefined,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/trades/${tradeId}`);
  return trade;
}

export async function deleteTrade(tradeId: string) {
  const userId = await requireUserId();
  await prisma.trade.deleteMany({ where: { id: tradeId, userId } });
  revalidatePath("/dashboard");
}

export async function listTrades(accountId: string) {
  const userId = await requireUserId();
  return prisma.trade.findMany({
    where: { userId, accountId },
    orderBy: { entryDate: "desc" },
    include: { tags: { include: { tag: true } } },
  });
}

export async function getTrade(tradeId: string) {
  const userId = await requireUserId();
  return prisma.trade.findFirst({
    where: { id: tradeId, userId },
    include: { tags: { include: { tag: true } }, attachments: true },
  });
}

export async function bulkCreateTrades(accountId: string, rows: TradeInput[]) {
  const userId = await requireUserId();
  await assertOwnsAccount(userId, accountId);

  const data = rows.map((row) => {
    const fees = row.fees ?? 0;
    const pnl = calculatePnl({
      instrumentType: row.instrumentType,
      side: row.side,
      quantity: row.quantity,
      entryPrice: row.entryPrice,
      exitPrice: row.exitPrice,
      fees,
      contractMultiplier: row.contractMultiplier,
      lotSize: row.lotSize,
    });

    return {
      userId,
      accountId,
      status: row.exitPrice == null ? ("OPEN" as const) : ("CLOSED" as const),
      instrumentType: row.instrumentType,
      symbol: row.symbol.toUpperCase(),
      side: row.side,
      quantity: row.quantity,
      entryPrice: row.entryPrice,
      exitPrice: row.exitPrice ?? null,
      entryDate: row.entryDate,
      exitDate: row.exitDate ?? null,
      fees,
      contractMultiplier: row.contractMultiplier ?? null,
      lotSize: row.lotSize ?? null,
      strike: row.strike ?? null,
      expiry: row.expiry ?? null,
      optionType: row.optionType ?? null,
      pnl,
      notes: row.notes ?? null,
    };
  });

  const result = await prisma.trade.createMany({ data });
  revalidatePath("/dashboard");
  return result;
}

export interface CsvTradeRow {
  symbol: string;
  instrumentType: InstrumentType;
  side: TradeSide;
  quantity: number;
  entryPrice: number;
  exitPrice?: number | null;
  entryDate: string;
  exitDate?: string | null;
  fees?: number;
  contractMultiplier?: number | null;
  lotSize?: number | null;
  strike?: number | null;
  expiry?: string | null;
  optionType?: OptionType | null;
  notes?: string | null;
}

export async function importTradesFromCsvRows(accountId: string, rows: CsvTradeRow[]) {
  const parsed: TradeInput[] = rows.map((row) => ({
    accountId,
    symbol: row.symbol,
    instrumentType: row.instrumentType,
    side: row.side,
    quantity: row.quantity,
    entryPrice: row.entryPrice,
    exitPrice: row.exitPrice ?? null,
    entryDate: new Date(row.entryDate),
    exitDate: row.exitDate ? new Date(row.exitDate) : null,
    fees: row.fees ?? 0,
    contractMultiplier: row.contractMultiplier ?? null,
    lotSize: row.lotSize ?? null,
    strike: row.strike ?? null,
    expiry: row.expiry ? new Date(row.expiry) : null,
    optionType: row.optionType ?? null,
    notes: row.notes ?? null,
  }));

  return bulkCreateTrades(accountId, parsed);
}

export interface CreateTradeFormState {
  error?: string;
}

function num(formData: FormData, key: string): number | undefined {
  const raw = formData.get(key);
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isNaN(n) ? undefined : n;
}

function str(formData: FormData, key: string): string | undefined {
  const raw = formData.get(key);
  return raw == null || raw === "" ? undefined : String(raw);
}

export async function createTradeFromForm(
  _prevState: CreateTradeFormState,
  formData: FormData
): Promise<CreateTradeFormState> {
  const accountId = str(formData, "accountId");
  const instrumentType = str(formData, "instrumentType") as InstrumentType | undefined;
  const symbol = str(formData, "symbol");
  const side = str(formData, "side") as TradeSide | undefined;
  const quantity = num(formData, "quantity");
  const entryPrice = num(formData, "entryPrice");
  const entryDateRaw = str(formData, "entryDate");

  if (!accountId || !instrumentType || !symbol || !side || quantity == null || entryPrice == null || !entryDateRaw) {
    return { error: "Please fill in all required fields." };
  }

  const exitDateRaw = str(formData, "exitDate");
  const expiryRaw = str(formData, "expiry");
  const tagIds = formData.getAll("tagIds").map(String);

  try {
    await createTrade({
      accountId,
      instrumentType,
      symbol,
      side,
      quantity,
      entryPrice,
      exitPrice: num(formData, "exitPrice") ?? null,
      entryDate: new Date(entryDateRaw),
      exitDate: exitDateRaw ? new Date(exitDateRaw) : null,
      fees: num(formData, "fees") ?? 0,
      contractMultiplier: num(formData, "contractMultiplier") ?? null,
      lotSize: num(formData, "lotSize") ?? null,
      strike: num(formData, "strike") ?? null,
      expiry: expiryRaw ? new Date(expiryRaw) : null,
      optionType: (str(formData, "optionType") as OptionType | undefined) ?? null,
      notes: str(formData, "notes") ?? null,
      tagIds,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create trade." };
  }

  redirect("/dashboard/trades");
}

export async function updateTradeNotesAndTags(tradeId: string, formData: FormData) {
  const notes = str(formData, "notes") ?? null;
  const tagIds = formData.getAll("tagIds").map(String);
  await updateTrade(tradeId, { notes, tagIds });
}

export async function deleteTradeAndRedirect(tradeId: string) {
  await deleteTrade(tradeId);
  redirect("/dashboard/trades");
}
