"use client";

import { useMemo } from "react";

import { MonthSelector } from "@/components/dashboard/month-selector";

const PT_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const PT_MONTHS_FULL = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

interface Transaction {
  id: string;
  description: string;
  category: string;
  date: string;
  amount: string;
  type: "entrada" | "saida";
  isVirtual?: boolean;
}

interface TransactionsCalendarProps {
  transactions: Transaction[];
  year: number;
  month: number; // 0-indexed
}

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Parse "05 Mar 2025" → UTC date key "2025-03-05" */
function parseDateKey(dateStr: string): string | null {
  const parts = dateStr.split(" ");
  if (parts.length !== 3) return null;
  const day = parts[0].padStart(2, "0");
  const monthIndex = PT_MONTHS.indexOf(parts[1]);
  const year = parts[2];
  if (monthIndex === -1) return null;
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${day}`;
}

export const TransactionsCalendar = ({
  transactions,
  year,
  month,
}: TransactionsCalendarProps) => {
  const { days, transactionsByDay, monthLabel } = useMemo(() => {
    const firstDay = new Date(Date.UTC(year, month, 1));
    const startWeekday = firstDay.getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    const calendarDays: Array<number | null> = [
      ...Array.from({ length: startWeekday }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];

    const grouped = transactions.reduce<Record<string, Transaction[]>>(
      (acc, item) => {
        const key = parseDateKey(item.date);
        if (!key) return acc;
        acc[key] = acc[key] ? [...acc[key], item] : [item];
        return acc;
      },
      {}
    );

    const label = `${PT_MONTHS_FULL[month]} ${year}`;

    return { days: calendarDays, transactionsByDay: grouped, monthLabel: label };
  }, [transactions, year, month]);

  function parseAmount(amount: string): number {
    return (
      parseFloat(
        amount
          .replace(/^[+\-]\s*/, "")
          .replace(/R\$\s*/, "")
          .replace(/\./g, "")
          .replace(",", ".")
          .trim()
      ) || 0
    );
  }

  function formatBRL(value: number): string {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Calendário de lançamentos
          </h2>
          <p className="text-sm text-muted-foreground">
            Visualize seus lançamentos por dia.
          </p>
        </div>
        <MonthSelector year={year} month={month} />
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Entrada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />
          Saída
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          Recorrente
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-105">
          <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground sm:gap-2">
            {weekDays.map((day) => (
              <span key={day} className="text-center font-medium py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-2">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-20 sm:h-24" />;
              }

              const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayTransactions = transactionsByDay[dateKey] ?? [];

              const totalEntrada = dayTransactions
                .filter((t) => t.type === "entrada")
                .reduce((s, t) => s + parseAmount(t.amount), 0);
              const totalSaida = dayTransactions
                .filter((t) => t.type === "saida")
                .reduce((s, t) => s + parseAmount(t.amount), 0);
              const net = totalEntrada - totalSaida;

              const MAX_DOTS = 7;
              const visibleDots = dayTransactions.slice(0, MAX_DOTS);
              const overflowCount = dayTransactions.length - MAX_DOTS;

              const tooltipText =
                dayTransactions.length > 0
                  ? dayTransactions
                      .map(
                        (t) =>
                          `${t.type === "entrada" ? "+" : "-"} ${t.description} (${t.amount})`
                      )
                      .join("\n")
                  : undefined;

              return (
                <div
                  key={dateKey}
                  title={tooltipText}
                  className="flex h-20 cursor-default flex-col justify-between rounded-lg border border-border bg-background p-1.5 sm:h-24 sm:p-2"
                >
                  {/* Day number + count badge */}
                  <div className="flex items-start justify-between gap-0.5">
                    <span className="text-xs font-semibold text-foreground">{day}</span>
                    {dayTransactions.length > 0 && (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold leading-none text-muted-foreground">
                        {dayTransactions.length}
                      </span>
                    )}
                  </div>

                  {/* Dot indicators */}
                  {dayTransactions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-0.5">
                      {visibleDots.map((t) => (
                        <span
                          key={t.id}
                          className={`inline-block h-2 w-2 rounded-full ${
                            t.isVirtual ? "opacity-35" : ""
                          } ${
                            t.type === "entrada" ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                      ))}
                      {overflowCount > 0 && (
                        <span className="text-[9px] font-semibold leading-none text-muted-foreground">
                          +{overflowCount}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Net total */}
                  {dayTransactions.length > 0 && (
                    <span
                      className={`truncate text-[10px] font-semibold leading-none ${
                        net >= 0 ? "text-emerald-600" : "text-rose-500"
                      }`}
                    >
                      {net >= 0 ? "+" : ""}{formatBRL(net)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
