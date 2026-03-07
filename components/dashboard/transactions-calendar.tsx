"use client";

import { useMemo, useState } from "react";

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

interface DayModalProps {
  isOpen: boolean;
  dateLabel: string;
  transactions: Transaction[];
  onClose: () => void;
  formatBRL: (value: number) => string;
  parseAmount: (amount: string) => number;
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

const DayModal = ({ isOpen, dateLabel, transactions, onClose, formatBRL, parseAmount }: DayModalProps) => {
  if (!isOpen) return null;

  const totalEntrada = transactions
    .filter((t) => t.type === "entrada")
    .reduce((s, t) => s + parseAmount(t.amount), 0);
  const totalSaida = transactions
    .filter((t) => t.type === "saida")
    .reduce((s, t) => s + parseAmount(t.amount), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-xl bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold capitalize text-foreground">{dateLabel}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Summary */}
        <div className="mt-4 flex gap-4">
          {totalEntrada > 0 && (
            <div className="flex-1 rounded-lg bg-emerald-500/10 px-3 py-2">
              <p className="text-xs text-muted-foreground">Entradas</p>
              <p className="font-semibold text-emerald-600">+{formatBRL(totalEntrada)}</p>
            </div>
          )}
          {totalSaida > 0 && (
            <div className="flex-1 rounded-lg bg-rose-500/10 px-3 py-2">
              <p className="text-xs text-muted-foreground">Saídas</p>
              <p className="font-semibold text-rose-500">-{formatBRL(totalSaida)}</p>
            </div>
          )}
        </div>

        {/* Transaction list */}
        <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto">
          {transactions.map((t) => (
            <li
              key={t.id}
              className={`flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm ${t.isVirtual ? "opacity-60" : ""}`}
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-medium text-foreground">{t.description}</span>
                <span className="text-xs text-muted-foreground">
                  {t.category}
                  {t.isVirtual && " · Recorrente"}
                </span>
              </div>
              <span className={`ml-3 shrink-0 font-semibold ${t.type === "entrada" ? "text-emerald-600" : "text-rose-500"}`}>
                {t.type === "entrada" ? "+" : "-"}{t.amount.replace(/^[+\-]\s*/, "")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const TransactionsCalendar = ({
  transactions,
  year,
  month,
}: TransactionsCalendarProps) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const { days, transactionsByDay } = useMemo(() => {
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

  const selectedTransactions = selectedDay ? (transactionsByDay[selectedDay] ?? []) : [];
  const selectedDateLabel = selectedDay
    ? (() => {
        const [y, m, d] = selectedDay.split("-");
        return `${parseInt(d)} de ${PT_MONTHS_FULL[parseInt(m) - 1]} de ${y}`;
      })()
    : "";

  return (
    <>
      <DayModal
        isOpen={!!selectedDay}
        dateLabel={selectedDateLabel}
        transactions={selectedTransactions}
        onClose={() => setSelectedDay(null)}
        formatBRL={formatBRL}
        parseAmount={parseAmount}
      />

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Calendário de lançamentos
            </h2>
            <p className="text-sm text-muted-foreground">
              Clique em um dia para ver os lançamentos.
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
        </div>

        <div className="mt-4 overflow-x-auto">
          <div className="sm:min-w-105">
            <div className="grid grid-cols-7 gap-0.5 text-xs text-muted-foreground sm:gap-2">
              {weekDays.map((day) => (
                <span key={day} className="text-center font-medium py-1">
                  {day}
                </span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-0.5 sm:gap-2">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square sm:aspect-auto sm:h-24" />;
                }

                const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayTransactions = transactionsByDay[dateKey] ?? [];

                const totalEntrada = dayTransactions
                  .filter((t) => t.type === "entrada")
                  .reduce((s, t) => s + parseAmount(t.amount), 0);
                const totalSaida = dayTransactions
                  .filter((t) => t.type === "saida")
                  .reduce((s, t) => s + parseAmount(t.amount), 0);

                const hasTransactions = dayTransactions.length > 0;

                return (
                  <div
                    key={dateKey}
                    onClick={() => hasTransactions && setSelectedDay(dateKey)}
                    className={`flex aspect-square flex-col justify-between rounded-md border border-border bg-background p-0.5 sm:aspect-auto sm:h-24 sm:rounded-lg sm:p-2 ${
                      hasTransactions
                        ? "cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                        : "cursor-default"
                    }`}
                  >
                    {/* Day number */}
                    <span className="text-[9px] font-semibold text-foreground sm:text-xs">{day}</span>

                    {/* Income + Expense totals */}
                    {hasTransactions && (
                      <div className="flex flex-col gap-0.5">
                        {totalEntrada > 0 && (
                          <span className="truncate text-[7px] font-semibold leading-none text-emerald-600 sm:text-[10px]">
                            +{formatBRL(totalEntrada)}
                          </span>
                        )}
                        {totalSaida > 0 && (
                          <span className="truncate text-[7px] font-semibold leading-none text-rose-500 sm:text-[10px]">
                            -{formatBRL(totalSaida)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
