"use client";

import { Fragment, useMemo } from "react";

interface Transaction {
  id: number;
  description: string;
  category: string;
  date: string;
  amount: string;
  type: "entrada" | "saida";
}

interface TransactionsCalendarProps {
  transactions: Transaction[];
}

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const formatKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const TransactionsCalendar = ({
  transactions,
}: TransactionsCalendarProps) => {
  const { days, transactionsByDay, monthLabel } = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays: Array<number | null> = Array.from(
      { length: startWeekday },
      () => null
    ).concat(Array.from({ length: daysInMonth }, (_, index) => index + 1));

    const grouped = transactions.reduce<Record<string, Transaction[]>>(
      (acc, item) => {
        const parsedDate = new Date(item.date);
        if (Number.isNaN(parsedDate.getTime())) {
          return acc;
        }
        const key = formatKey(parsedDate);
        acc[key] = acc[key] ? [...acc[key], item] : [item];
        return acc;
      },
      {}
    );

    const label = today.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });

    return {
      days: calendarDays,
      transactionsByDay: grouped,
      monthLabel: label,
    };
  }, [transactions]);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Calendário de lançamentos
          </h2>
          <p className="text-sm text-muted-foreground">
            Visualize seus lançamentos por dia.
          </p>
        </div>
        <span className="text-sm font-medium text-muted-foreground capitalize">
          {monthLabel}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-xs text-muted-foreground">
        {weekDays.map((day) => (
          <span key={day} className="text-center font-medium">
            {day}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-24" />;
          }

          const dateKey = formatKey(
            new Date(new Date().getFullYear(), new Date().getMonth(), day)
          );
          const dayTransactions = transactionsByDay[dateKey] ?? [];

          return (
            <div
              key={dateKey}
              className="flex h-24 flex-col rounded-lg border border-border bg-background p-2"
            >
              <span className="text-xs font-semibold text-foreground">
                {day}
              </span>
              <div className="mt-2 space-y-1 overflow-hidden">
                {dayTransactions.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground">
                    Sem lançamentos
                  </span>
                ) : (
                  dayTransactions.slice(0, 2).map((transaction) => (
                    <Fragment key={transaction.id}>
                      <span
                        className={`block truncate text-[11px] font-medium ${
                          transaction.type === "entrada"
                            ? "text-emerald-600"
                            : "text-rose-500"
                        }`}
                      >
                        {transaction.description}
                      </span>
                    </Fragment>
                  ))
                )}
                {dayTransactions.length > 2 ? (
                  <span className="text-[11px] text-muted-foreground">
                    +{dayTransactions.length - 2} outros
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
