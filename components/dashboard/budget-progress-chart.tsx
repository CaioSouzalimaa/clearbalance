"use client";

import { resolveIcon } from "@/lib/icon-options";
import { LucideIcon } from "@/components/dashboard/sidebar";
import { formatBRLFromNumber } from "@/lib/formatting";
import { EmptyState } from "@/components/ui/empty-state";

interface BudgetProgressItem {
  categoryName: string;
  iconId: string | null;
  color: string | null;
  budget: number;
  spent: number;
  percentage: number;
}

interface BudgetProgressChartProps {
  title: string;
  subtitle: string;
  data: BudgetProgressItem[];
}


export const BudgetProgressChart = ({
  title,
  subtitle,
  data,
}: BudgetProgressChartProps) => {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-border bg-surface p-3 sm:p-6 shadow-sm">
      <h2 className="text-sm sm:text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">{subtitle}</p>

      {data.length === 0 ? (
        <EmptyState message="Nenhuma categoria com orçamento definido." />
      ) : (
        <div className="mt-3 sm:mt-6 space-y-3 sm:space-y-4">
          {data.map((item) => {
            const Icon = resolveIcon(item.iconId);
            const pct = item.percentage;
            const barWidth = Math.min(pct, 100);
            const barColor =
              pct >= 100
                ? "bg-rose-500"
                : pct >= 80
                ? "bg-amber-400"
                : "bg-emerald-500";

            return (
              <div key={item.categoryName} className="flex items-center gap-3">
                {/* Icon */}
                <span
                  className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full ${item.color ? "text-white" : "bg-muted text-foreground"}`}
                  style={item.color ? { backgroundColor: item.color } : undefined}
                >
                  <LucideIcon icon={Icon} className="h-4 w-4" aria-hidden />
                </span>

                {/* Bar + labels */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="truncate text-xs sm:text-sm font-medium text-foreground">
                        {item.categoryName}
                      </p>
                      {pct >= 100 && (
                        <span className="shrink-0 rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                          Excedido
                        </span>
                      )}
                      {pct >= 80 && pct < 100 && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                          Atenção
                        </span>
                      )}
                    </div>
                    <p className="shrink-0 text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                      {formatBRLFromNumber(item.spent)} / {formatBRLFromNumber(item.budget)}
                    </p>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <p
                    className={`mt-0.5 text-[10px] font-semibold ${
                      pct >= 100
                        ? "text-rose-500"
                        : pct >= 80
                        ? "text-amber-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {pct.toFixed(1)}%{pct >= 100 ? " — limite excedido" : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
