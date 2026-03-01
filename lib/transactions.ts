import { Prisma, RecurrenceFrequency, RecurrenceMode, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { TransactionFormData } from "@/lib/validations/transactions";

// ---------------------------------------------------------------------------
// Shared UI types (used by table, calendar and dashboard page)
// ---------------------------------------------------------------------------

export interface UITransaction {
  id: string;
  description: string;
  category: string;
  date: string;
  amount: string;
  type: "entrada" | "saida";
  recurrenceMode: "nao_recorrente" | "recorrente";
  recurrenceKind?: "fixa" | "variavel";
  recurrenceFrequency?: "mensal" | "semanal" | "anual";
  billingDay?: string;
  isSettled: boolean;
  paymentDate?: string;
  /** True for projected occurrences generated from a recurring rule — not persisted in DB */
  isVirtual?: boolean;
}

export interface SummaryCardData {
  title: string;
  value: string;
  helper: string;
}

export interface ChartPoint {
  month: string;
  value: number;
}

export interface CategoryPoint {
  label: string;
  value: number;
  color: string;
}

export interface GoalPoint {
  label: string;
  value: number;
}

export interface DashboardData {
  summaryCards: SummaryCardData[];
  transactions: UITransaction[];
  incomeVariation: ChartPoint[];
  expenseVariation: ChartPoint[];
  categoryDistribution: CategoryPoint[];
  goalsProgress: GoalPoint[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PT_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const CATEGORY_COLORS = [
  "#69b3a2", "#8fc1a9", "#f2cc8f", "#f4a261",
  "#e9c46a", "#264653", "#2a9d8f", "#e76f51",
  "#a8dadc", "#457b9d",
];

/** Parse a formatted Brazilian currency string like "R$ 8.500,00" or "8.500,00" */
function parseCurrencyBRL(value: string): number {
  const cleaned = value
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(cleaned) || 0;
}

/** Format a Prisma Decimal / number as Brazilian currency: "R$ 8.500,00" */
function formatCurrencyBRL(amount: Prisma.Decimal | number): string {
  const num = typeof amount === "number" ? amount : amount.toNumber();
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Format a Date as "05 Mar 2025" */
function formatDate(date: Date): string {
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = PT_MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

/** Format a Date as "YYYY-MM-DD" (ISO, UTC) */
function formatIso(date: Date): string {
  return date.toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// DB ↔ UI mapping
// ---------------------------------------------------------------------------

type PrismaTransaction = Awaited<ReturnType<typeof prisma.transaction.findFirst>> & {
  category: { name: string };
};

function mapDbToUI(tx: NonNullable<PrismaTransaction>): UITransaction {
  const type: UITransaction["type"] = tx.type === TransactionType.INCOME ? "entrada" : "saida";
  const prefix = type === "entrada" ? "+" : "-";
  const amount = `${prefix} ${formatCurrencyBRL(tx.amount)}`;

  let recurrenceMode: UITransaction["recurrenceMode"] = "nao_recorrente";
  let recurrenceKind: UITransaction["recurrenceKind"];
  let recurrenceFrequency: UITransaction["recurrenceFrequency"];

  if (tx.recurrenceMode !== RecurrenceMode.NONE) {
    recurrenceMode = "recorrente";
    recurrenceKind = tx.recurrenceMode === RecurrenceMode.FIXED ? "fixa" : "variavel";
  }

  if (tx.recurrenceFrequency) {
    const freqMap: Record<RecurrenceFrequency, UITransaction["recurrenceFrequency"]> = {
      WEEKLY: "semanal",
      MONTHLY: "mensal",
      YEARLY: "anual",
      DAILY: "mensal",
    };
    recurrenceFrequency = freqMap[tx.recurrenceFrequency];
  }

  return {
    id: tx.id,
    description: tx.description,
    category: tx.category.name,
    date: formatDate(tx.date),
    amount,
    type,
    recurrenceMode,
    recurrenceKind,
    recurrenceFrequency,
    billingDay: tx.billingDay != null ? String(tx.billingDay) : undefined,
    isSettled: tx.isSettled,
    paymentDate: tx.paymentDate ? new Date(tx.paymentDate).toISOString().split("T")[0] : undefined,
  };
}

type FormDbPayload = {
  description: string;
  amount: Prisma.Decimal;
  type: TransactionType;
  date: Date;
  isSettled: boolean;
  paymentDate: Date | null;
  recurrenceMode: RecurrenceMode;
  recurrenceFrequency: RecurrenceFrequency | null;
  billingDay: number | null;
  categoryId: string;
};

async function formToDbPayload(
  userId: string,
  data: TransactionFormData
): Promise<FormDbPayload> {
  const amount = new Prisma.Decimal(parseCurrencyBRL(data.amount));
  const type = data.type === "entrada" ? TransactionType.INCOME : TransactionType.EXPENSE;
  const date = new Date(data.date);

  let recurrenceMode: RecurrenceMode = RecurrenceMode.NONE;
  let recurrenceFrequency: RecurrenceFrequency | null = null;
  let billingDay: number | null = null;

  if (data.recurrenceMode === "recorrente") {
    recurrenceMode = data.recurrenceKind === "fixa" ? RecurrenceMode.FIXED : RecurrenceMode.VARIABLE;

    const freqMap: Record<TransactionFormData["recurrenceFrequency"], RecurrenceFrequency> = {
      mensal: RecurrenceFrequency.MONTHLY,
      semanal: RecurrenceFrequency.WEEKLY,
      anual: RecurrenceFrequency.YEARLY,
    };
    recurrenceFrequency = freqMap[data.recurrenceFrequency];

    if (data.billingDay) {
      billingDay = parseInt(data.billingDay, 10) || null;
    }
  }

  // Upsert category
  const category = await prisma.category.upsert({
    where: { userId_name: { userId, name: data.category } },
    create: { userId, name: data.category },
    update: {},
  });

  return {
    description: data.description,
    amount,
    type,
    date,
    isSettled: data.isSettled,
    paymentDate: data.isSettled && data.paymentDate ? new Date(data.paymentDate) : null,
    recurrenceMode,
    recurrenceFrequency,
    billingDay,
    categoryId: category.id,
  };
}

// ---------------------------------------------------------------------------
// Recurring expansion
// ---------------------------------------------------------------------------

/**
 * For a given 0-indexed month, generates virtual UITransaction entries
 * from all recurring DB transactions. Skips a recurring tx in its origin month
 * (the real DB entry is already included). Does NOT mutate the DB.
 */
function expandRecurringForMonth(
  recurringRecords: NonNullable<PrismaTransaction>[],
  year: number,
  month: number // 0-indexed
): UITransaction[] {
  const results: UITransaction[] = [];
  const monthEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  for (const tx of recurringRecords) {
    if (tx.recurrenceMode === RecurrenceMode.NONE) continue;
    const txStart = new Date(tx.date);
    if (txStart > monthEnd) continue;
    // The origin month already has a real DB entry — skip virtual for it
    if (txStart.getUTCFullYear() === year && txStart.getUTCMonth() === month) continue;

    const base = mapDbToUI(tx);
    const freq = tx.recurrenceFrequency;

    if (!freq || freq === RecurrenceFrequency.MONTHLY || freq === RecurrenceFrequency.DAILY) {
      const day = tx.billingDay ?? txStart.getUTCDate();
      const actualDay = Math.min(day, daysInMonth);
      const occDate = new Date(Date.UTC(year, month, actualDay));
      results.push({ ...base, id: `virtual-${tx.id}-${formatIso(occDate)}`, date: formatDate(occDate), isSettled: false, paymentDate: undefined, isVirtual: true });
    } else if (freq === RecurrenceFrequency.WEEKLY) {
      const targetWeekday = txStart.getUTCDay();
      for (let d = 1; d <= daysInMonth; d++) {
        const occDate = new Date(Date.UTC(year, month, d));
        if (occDate.getUTCDay() === targetWeekday) {
          results.push({ ...base, id: `virtual-${tx.id}-${formatIso(occDate)}`, date: formatDate(occDate), isSettled: false, paymentDate: undefined, isVirtual: true });
        }
      }
    } else if (freq === RecurrenceFrequency.YEARLY) {
      if (txStart.getUTCMonth() === month) {
        const occDate = new Date(Date.UTC(year, month, txStart.getUTCDate()));
        results.push({ ...base, id: `virtual-${tx.id}-${formatIso(occDate)}`, date: formatDate(occDate), isSettled: false, paymentDate: undefined, isVirtual: true });
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

/** Transactions for a user in the given month, with recurring expansion. Defaults to current month. */
export async function getUserTransactions(
  userId: string,
  year?: number,
  month?: number // 0-indexed
): Promise<UITransaction[]> {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();
  const monthStart = new Date(Date.UTC(y, m, 1));
  const monthEnd = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59));

  const [records, recurringRecords] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.transaction.findMany({
      where: { userId, recurrenceMode: { not: RecurrenceMode.NONE } },
      include: { category: true },
    }),
  ]);

  const real = records.map(mapDbToUI);
  const virtual = expandRecurringForMonth(recurringRecords, y, m);
  // Sort combined list by date descending
  return [...real, ...virtual].sort((a, b) => {
    const parse = (s: string) => new Date(s.split(" ").reverse().join("-")).getTime();
    return parse(b.date) - parse(a.date);
  });
}

/** Create a new transaction */
export async function createTransaction(
  userId: string,
  data: TransactionFormData
): Promise<UITransaction> {
  const payload = await formToDbPayload(userId, data);
  const record = await prisma.transaction.create({
    data: { ...payload, userId },
    include: { category: true },
  });
  return mapDbToUI(record);
}

/** Update an existing transaction (must belong to userId) */
export async function updateTransaction(
  id: string,
  userId: string,
  data: TransactionFormData
): Promise<UITransaction> {
  const payload = await formToDbPayload(userId, data);
  const record = await prisma.transaction.update({
    where: { id, userId },
    data: payload,
    include: { category: true },
  });
  return mapDbToUI(record);
}

/** Delete a transaction (must belong to userId) */
export async function deleteTransaction(id: string, userId: string): Promise<void> {
  await prisma.transaction.delete({ where: { id, userId } });
}

/** Toggle the isSettled flag for a transaction */
export async function toggleTransactionSettlement(
  id: string,
  userId: string
): Promise<UITransaction> {
  const existing = await prisma.transaction.findUnique({
    where: { id, userId },
    include: { category: true },
  });
  if (!existing) throw new Error("Transaction not found");

  const nextSettled = !existing.isSettled;
  const updated = await prisma.transaction.update({
    where: { id, userId },
    data: {
      isSettled: nextSettled,
      paymentDate: nextSettled ? (existing.paymentDate ?? new Date()) : null,
    },
    include: { category: true },
  });
  return mapDbToUI(updated);
}

// ---------------------------------------------------------------------------
// Dashboard aggregations
// ---------------------------------------------------------------------------

export async function getDashboardData(
  userId: string,
  year?: number,
  month?: number // 0-indexed
): Promise<DashboardData> {
  const now = new Date();
  const currentYear = year ?? now.getFullYear();
  const currentMonth = month ?? now.getMonth();

  const monthStart = new Date(Date.UTC(currentYear, currentMonth, 1));
  const monthEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59));

  // ── Current month real transactions + all recurring records ──────────────
  const [currentMonthTxs, recurringRecords] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.transaction.findMany({
      where: { userId, recurrenceMode: { not: RecurrenceMode.NONE } },
      include: { category: true },
    }),
  ]);

  // ── Summary cards ────────────────────────────────────────────────────────
  let totalIncome = new Prisma.Decimal(0);
  let totalExpense = new Prisma.Decimal(0);

  for (const tx of currentMonthTxs) {
    if (tx.type === TransactionType.INCOME) {
      totalIncome = totalIncome.add(tx.amount);
    } else {
      totalExpense = totalExpense.add(tx.amount);
    }
  }

  const balance = totalIncome.sub(totalExpense);

  const summaryCards: SummaryCardData[] = [
    {
      title: "Entradas",
      value: formatCurrencyBRL(totalIncome),
      helper: "Este mês",
    },
    {
      title: "Saídas",
      value: formatCurrencyBRL(totalExpense),
      helper: "Este mês",
    },
    {
      title: "Saldo",
      value: formatCurrencyBRL(balance),
      helper: balance.gte(0) ? "Saldo positivo" : "Saldo negativo",
    },
  ];

  // ── Transactions list: real + virtual recurring, sorted by date desc ─────
  const virtualTxs = expandRecurringForMonth(recurringRecords, currentYear, currentMonth);
  const transactions = [...currentMonthTxs.map(mapDbToUI), ...virtualTxs].sort((a, b) => {
    const parse = (s: string) => {
      const parts = s.split(" "); // ["05", "Mar", "2025"]
      return new Date(`${parts[1]} ${parts[0]} ${parts[2]}`).getTime();
    };
    return parse(b.date) - parse(a.date);
  });

  // ── Category distribution (expenses this month, including virtual) ────────
  const expenseTxs = currentMonthTxs.filter((tx) => tx.type === TransactionType.EXPENSE);
  const byCategoryMap = new Map<string, Prisma.Decimal>();
  for (const tx of expenseTxs) {
    const prev = byCategoryMap.get(tx.category.name) ?? new Prisma.Decimal(0);
    byCategoryMap.set(tx.category.name, prev.add(tx.amount));
  }

  const totalExpenseForDist = totalExpense.isZero()
    ? new Prisma.Decimal(1)
    : totalExpense;
  let colorIndex = 0;
  const categoryDistribution: CategoryPoint[] = Array.from(byCategoryMap.entries()).map(
    ([label, value]) => ({
      label,
      value: parseFloat(value.div(totalExpenseForDist).mul(100).toFixed(1)),
      color: CATEGORY_COLORS[colorIndex++ % CATEGORY_COLORS.length],
    })
  );

  // ── 6-month variation ─────────────────────────────────────────────────────
  const sixMonthsAgo = new Date(Date.UTC(currentYear, currentMonth - 5, 1));
  const allSixMonthTxs = await prisma.transaction.findMany({
    where: { userId, date: { gte: sixMonthsAgo } },
    select: { type: true, amount: true, date: true },
  });

  const incomeByMonth = new Map<string, number>();
  const expenseByMonth = new Map<string, number>();

  for (const tx of allSixMonthTxs) {
    const d = new Date(tx.date);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    const amount = tx.amount.toNumber();
    if (tx.type === TransactionType.INCOME) {
      incomeByMonth.set(key, (incomeByMonth.get(key) ?? 0) + amount);
    } else {
      expenseByMonth.set(key, (expenseByMonth.get(key) ?? 0) + amount);
    }
  }

  const incomeVariation: ChartPoint[] = [];
  const expenseVariation: ChartPoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(currentYear, currentMonth - i, 1));
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    const month = PT_MONTHS[d.getUTCMonth()];
    incomeVariation.push({ month, value: parseFloat(((incomeByMonth.get(key) ?? 0) / 1000).toFixed(1)) });
    expenseVariation.push({ month, value: parseFloat(((expenseByMonth.get(key) ?? 0) / 1000).toFixed(1)) });
  }

  // ── Goals progress ────────────────────────────────────────────────────────
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  const goalsProgress: GoalPoint[] = goals.map((g) => ({
    label: g.name,
    value:
      g.targetAmount.isZero()
        ? 0
        : parseFloat(g.currentAmount.div(g.targetAmount).mul(100).toFixed(0)),
  }));

  return {
    summaryCards,
    transactions,
    incomeVariation,
    expenseVariation,
    categoryDistribution,
    goalsProgress,
  };
}
