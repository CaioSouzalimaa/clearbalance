"use client";

import { useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { formatBRLFromNumber } from "@/lib/formatting";
import type { CategoryPoint } from "@/lib/transactions";
import { cn } from "@/lib/utils";

interface CategoryBarsChartProps {
  expenseData: CategoryPoint[];
  incomeData: CategoryPoint[];
  maxVisibleItems?: number;
  className?: string;
}

type CategoryMode = "expense" | "income";

const MODE_CONFIG: Record<
  CategoryMode,
  {
    label: string;
    title: string;
    subtitle: string;
    emptyMessage: string;
  }
> = {
  expense: {
    label: "Saídas",
    title: "Categorias e gastos",
    subtitle: "Categorias com maior peso nas saídas do mês.",
    emptyMessage: "Nenhuma saída categorizada neste mês.",
  },
  income: {
    label: "Entradas",
    title: "Categorias e entradas",
    subtitle: "Categorias com maior peso nas entradas do mês.",
    emptyMessage: "Nenhuma entrada categorizada neste mês.",
  },
};

export function CategoryBarsChart({
  expenseData,
  incomeData,
  maxVisibleItems = 5,
  className,
}: CategoryBarsChartProps) {
  const [mode, setMode] = useState<CategoryMode>("expense");

  const activeData = (mode === "expense" ? expenseData : incomeData)
    .slice()
    .sort((left, right) => right.amount - left.amount);
  const visibleData = activeData.slice(0, maxVisibleItems);
  const hiddenCount = Math.max(activeData.length - visibleData.length, 0);

  const maxAmount = activeData[0]?.amount ?? 0;
  const config = MODE_CONFIG[mode];

  return (
    <div
      className={`rounded-xl border border-border bg-surface p-3 shadow-sm sm:rounded-2xl sm:p-5 flex flex-col ${className ?? ""}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground sm:text-base">
            {config.title}
          </h3>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {config.subtitle}
          </p>
        </div>

        <div className="inline-flex w-full rounded-lg border border-border bg-muted/40 p-1 sm:w-auto">
          {(["expense", "income"] as const).map((option) => {
            const isActive = option === mode;

            return (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors sm:flex-none",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {MODE_CONFIG[option].label}
              </button>
            );
          })}
        </div>
      </div>

      {activeData.length === 0 ? (
        <EmptyState className="min-h-36 sm:min-h-44" message={config.emptyMessage} />
      ) : (
        <div className="mt-4 flex-1 space-y-3 sm:mt-5 sm:space-y-3.5">
          {visibleData.map((item) => {
            const width = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;

            return (
              <div
                key={`${mode}-${item.label}`}
                className="grid gap-2 sm:grid-cols-[minmax(0,150px)_1fr] sm:items-center sm:gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground sm:text-sm">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    {item.value}% do total
                  </p>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3 text-[11px] sm:text-xs">
                    <span className="font-semibold text-foreground">
                      {formatBRLFromNumber(item.amount)}
                    </span>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>

                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted/80 sm:mt-2">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(width, 6)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {hiddenCount > 0 ? (
            <p className="border-t border-border pt-3 text-[11px] text-muted-foreground sm:text-xs">
              Mostrando as {visibleData.length} categorias mais relevantes de um total de {activeData.length}.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}