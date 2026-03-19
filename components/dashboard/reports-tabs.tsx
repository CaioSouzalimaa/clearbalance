"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CategoryDistributionChart } from "@/components/dashboard/category-distribution-chart";
import { VariationChart } from "@/components/dashboard/variation-chart";
import { MonthSelector } from "@/components/dashboard/month-selector";
import type { MonthlyReportData, AnnualReportData } from "@/lib/transactions";
import { formatBRLFromNumber } from "@/lib/formatting";
import { PT_MONTHS_SHORT } from "@/lib/date-utils";

const COLORS = [
  "#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4",
];

interface ReportsTabsProps {
  tab: "monthly" | "annual";
  year: number;
  month: number; // 0-indexed
  monthly: MonthlyReportData | null;
  annual: AnnualReportData | null;
}

const fmtBRL = formatBRLFromNumber;

type InsightTone = "emerald" | "rose" | "neutral";

interface InsightItem {
  label: string;
  value: string;
  helper: string;
  tone?: InsightTone;
}

const fmtPercent = (value: number) => `${value.toFixed(1)}%`;

export function ReportsTabs({ tab, year, month, monthly, annual }: ReportsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [localTab, setLocalTab] = useState<"monthly" | "annual">(tab);
  const [localYear, setLocalYear] = useState(year);
  const monthDays = new Date(year, month + 1, 0).getDate();

  const monthlyInsights: InsightItem[] = monthly
    ? (() => {
        const income = monthly.summary.income;
        const expense = monthly.summary.expense;
        const balance = monthly.summary.balance;
        const savingsRate = income > 0 ? (balance / income) * 100 : 0;
        const expenseRatio = income > 0 ? (expense / income) * 100 : 0;
        const topExpense = monthly.categoryExpenses[0];
        const topIncome = monthly.categoryIncomes[0];
        const top3ExpenseShare = monthly.categoryExpenses
          .slice(0, 3)
          .reduce((acc, row) => acc + row.percentage, 0);

        return [
          {
            label: "Taxa de economia",
            value: fmtPercent(savingsRate),
            helper: "Percentual da receita que sobrou no mês",
            tone: savingsRate >= 0 ? "emerald" : "rose",
          },
          {
            label: "Comprometimento da receita",
            value: fmtPercent(expenseRatio),
            helper: "Quanto das entradas foi consumido por despesas",
            tone: expenseRatio <= 100 ? "neutral" : "rose",
          },
          {
            label: "Maior categoria de gasto",
            value: topExpense ? topExpense.name : "Sem dados",
            helper: topExpense
              ? `${fmtBRL(topExpense.amount)} (${topExpense.percentage}%)`
              : "Nenhuma despesa no período",
            tone: "rose",
          },
          {
            label: "Maior categoria de receita",
            value: topIncome ? topIncome.name : "Sem dados",
            helper: topIncome
              ? `${fmtBRL(topIncome.amount)} (${topIncome.percentage}%)`
              : "Nenhuma receita no período",
            tone: "emerald",
          },
          {
            label: "Concentração Top 3 despesas",
            value: fmtPercent(top3ExpenseShare),
            helper: "Participação das 3 maiores categorias de saída",
            tone: top3ExpenseShare >= 70 ? "rose" : "neutral",
          },
          {
            label: "Saldo médio diário",
            value: fmtBRL(balance / monthDays),
            helper: `Média do saldo distribuída em ${monthDays} dias`,
            tone: balance >= 0 ? "emerald" : "rose",
          },
        ];
      })()
    : [];

  const annualIncomeTotal = annual
    ? annual.monthlyTotals.reduce((sum, row) => sum + row.income, 0)
    : 0;
  const annualExpenseTotal = annual
    ? annual.monthlyTotals.reduce((sum, row) => sum + row.expense, 0)
    : 0;
  const annualBalanceTotal = annualIncomeTotal - annualExpenseTotal;

  const annualCategoryDistribution = annual
    ? annual.categoryTotals.map((row, index) => ({
        label: row.name,
        amount: row.totalExpense,
        value:
          annualExpenseTotal > 0
            ? Math.round((row.totalExpense / annualExpenseTotal) * 1000) / 10
            : 0,
        color: row.color ?? COLORS[index % COLORS.length],
      }))
    : [];

  const annualInsights: InsightItem[] = annual
    ? (() => {
        const balances = annual.monthlyTotals.map((row) => ({
          month: row.month,
          value: row.income - row.expense,
          expense: row.expense,
        }));
        const bestMonth = balances.reduce((best, current) =>
          current.value > best.value ? current : best
        );
        const worstMonth = balances.reduce((worst, current) =>
          current.value < worst.value ? current : worst
        );
        const highestExpenseMonth = balances.reduce((peak, current) =>
          current.expense > peak.expense ? current : peak
        );
        const positiveMonths = balances.filter((row) => row.value >= 0).length;
        const averageMonthlyBalance = annualBalanceTotal / 12;

        return [
          {
            label: "Melhor mês do ano",
            value: bestMonth.month,
            helper: `Saldo de ${fmtBRL(bestMonth.value)}`,
            tone: "emerald",
          },
          {
            label: "Mês mais desafiador",
            value: worstMonth.month,
            helper: `Saldo de ${fmtBRL(worstMonth.value)}`,
            tone: "rose",
          },
          {
            label: "Maior pico de despesas",
            value: highestExpenseMonth.month,
            helper: `Despesas de ${fmtBRL(highestExpenseMonth.expense)}`,
            tone: "rose",
          },
          {
            label: "Meses com saldo positivo",
            value: `${positiveMonths}/12`,
            helper: "Quantidade de meses que fecharam no azul",
            tone: positiveMonths >= 8 ? "emerald" : "neutral",
          },
          {
            label: "Saldo médio mensal",
            value: fmtBRL(averageMonthlyBalance),
            helper: "Média de resultado por mês no ano",
            tone: averageMonthlyBalance >= 0 ? "emerald" : "rose",
          },
          {
            label: "Receita x despesa do ano",
            value:
              annualExpenseTotal > 0
                ? fmtPercent((annualIncomeTotal / annualExpenseTotal) * 100)
                : "Sem despesas",
            helper: "Indicador de cobertura das despesas pelas receitas",
            tone:
              annualIncomeTotal >= annualExpenseTotal ? "emerald" : "rose",
          },
        ];
      })()
    : [];

  function switchTab(t: "monthly" | "annual") {
    setLocalTab(t);
    const params = new URLSearchParams({ tab: t, year: String(localYear), month: String(month) });
    router.replace(`${pathname}?${params.toString()}`);
  }

  function switchYear(delta: number) {
    const ny = localYear + delta;
    setLocalYear(ny);
    const params = new URLSearchParams({ tab: localTab, year: String(ny), month: String(month) });
    router.replace(`${pathname}?${params.toString()}`);
  }

  function switchMonth(nextYear: number, nextMonth: number) {
    setLocalYear(nextYear);
    const params = new URLSearchParams({
      tab: localTab,
      year: String(nextYear),
      month: String(nextMonth),
    });
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-border">
        {(["monthly", "annual"] as const).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              localTab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "monthly" ? "Mensal" : "Anual"}
          </button>
        ))}
      </div>

      {/* Monthly tab */}
      {localTab === "monthly" && (
        <div className="flex flex-col gap-6">
          {/* Month selector */}
          <div className="flex items-center gap-3">
            <MonthSelector year={year} month={month} onMonthChange={switchMonth} />
          </div>

          {monthly ? (
            <>
              {/* Summary cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard label="Receitas" value={monthly.summary.income} color="emerald" />
                <SummaryCard label="Despesas" value={monthly.summary.expense} color="rose" />
                <SummaryCard
                  label="Saldo"
                  value={monthly.summary.balance}
                  color={monthly.summary.balance >= 0 ? "emerald" : "rose"}
                />
              </div>

              <InsightGrid title="Insights do mês" items={monthlyInsights} />

              {/* Category charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                {monthly.categoryExpenses.length > 0 && (
                  <CategoryDistributionChart
                    title="Despesas por categoria"
                    subtitle="Distribuição das saídas no período"
                    data={monthly.categoryExpenses.map((c, i) => ({
                      label: c.name,
                      value: c.percentage,
                      amount: c.amount,
                      color: c.color ?? COLORS[i % COLORS.length],
                    }))}
                  />
                )}
                {monthly.categoryIncomes.length > 0 && (
                  <CategoryDistributionChart
                    title="Receitas por categoria"
                    subtitle="Distribuição das entradas no período"
                    data={monthly.categoryIncomes.map((c, i) => ({
                      label: c.name,
                      value: c.percentage,
                      amount: c.amount,
                      color: c.color ?? COLORS[i % COLORS.length],
                    }))}
                  />
                )}
              </div>

              {/* Category table for expenses */}
              {monthly.categoryExpenses.length > 0 && (
                <CategoryTable
                  title="Detalhamento de despesas"
                  rows={monthly.categoryExpenses.map((c, i) => ({
                    name: c.name,
                    color: c.color ?? COLORS[i % COLORS.length],
                    amount: c.amount,
                    percentage: c.percentage,
                  }))}
                />
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      )}

      {/* Annual tab */}
      {localTab === "annual" && (
        <div className="flex flex-col gap-6">
          {/* Year selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => switchYear(-1)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              ‹
            </button>
            <span className="text-base font-semibold min-w-[4ch] text-center">{localYear}</span>
            <button
              onClick={() => switchYear(1)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              ›
            </button>
          </div>

          {annual ? (
            <>
              {/* Line chart — income vs expense per month */}
              <VariationChart
                title="Receitas e Despesas"
                subtitle={`Variação mensal em ${annual.year}`}
                incomeData={annual.monthlyTotals.map((m, index) => ({ month: PT_MONTHS_SHORT[index], value: m.income }))}
                expenseData={annual.monthlyTotals.map((m, index) => ({ month: PT_MONTHS_SHORT[index], value: m.expense }))}
              />

              {/* Annual totals */}
              <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard label="Total Receitas" value={annualIncomeTotal} color="emerald" />
                <SummaryCard label="Total Despesas" value={annualExpenseTotal} color="rose" />
                <SummaryCard
                  label="Saldo do ano"
                  value={annualBalanceTotal}
                  color={annualBalanceTotal >= 0 ? "emerald" : "rose"}
                />
              </div>

              <InsightGrid title="Insights do ano" items={annualInsights} />

              {annualCategoryDistribution.length > 0 && (
                <CategoryDistributionChart
                  title="Participação de despesas por categoria"
                  subtitle="Distribuição anual das saídas por categoria"
                  data={annualCategoryDistribution}
                />
              )}

              {/* Category totals */}
              {annual.categoryTotals.length > 0 && (
                <CategoryTable
                  title="Despesas por categoria (ano)"
                  rows={annual.categoryTotals.map((c, i) => ({
                    name: c.name,
                    color: c.color ?? COLORS[i % COLORS.length],
                    amount: c.totalExpense,
                    percentage: null,
                  }))}
                />
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryCard({ label, value, color }: { label: string; value: number; color: "emerald" | "rose" }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-bold ${color === "emerald" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
        {fmtBRL(value)}
      </p>
    </div>
  );
}

function InsightGrid({ title, items }: { title: string; items: InsightItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <InsightCard key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}

function InsightCard({ item }: { item: InsightItem }) {
  const toneClass =
    item.tone === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : item.tone === "rose"
      ? "text-rose-600 dark:text-rose-400"
      : "text-foreground";

  return (
    <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {item.label}
      </p>
      <p className={`mt-1 text-sm font-semibold ${toneClass}`}>{item.value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
    </div>
  );
}

interface CategoryTableRow {
  name: string;
  color: string;
  amount: number;
  percentage: number | null;
}

function CategoryTable({ title, rows }: { title: string; rows: CategoryTableRow[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-left">
              <th className="pb-2 font-medium">Categoria</th>
              <th className="pb-2 font-medium text-right">Total</th>
              {rows[0]?.percentage !== null && <th className="pb-2 font-medium text-right">%</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.name} className="hover:bg-muted/30">
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                    {r.name}
                  </div>
                </td>
                <td className="py-2 text-right tabular-nums">{fmtBRL(r.amount)}</td>
                {r.percentage !== null && (
                  <td className="py-2 text-right tabular-nums text-muted-foreground">{r.percentage}%</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
      <p className="text-base">Nenhum dado disponível para o período selecionado.</p>
    </div>
  );
}
