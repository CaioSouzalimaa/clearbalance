"use client";

interface GoalDataPoint {
  label: string;
  value: number;
  currentAmount: number;
  targetAmount: number;
  deadline: string | null;
}

interface GoalsProgressChartProps {
  title: string;
  subtitle: string;
  data: GoalDataPoint[];
}

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const GoalsProgressChart = ({
  title,
  subtitle,
  data,
}: GoalsProgressChartProps) => {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

      {data.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Nenhuma meta cadastrada.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((goal) => {
            const pct = goal.value;
            const exceeded = pct > 100;
            const barWidth = Math.min(pct, 100);

            return (
              <div
                key={goal.label}
                className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4"
              >
                {/* Name + badge */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug text-foreground">
                    {goal.label}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      exceeded
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : pct >= 75
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {pct.toFixed(0)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      exceeded ? "bg-emerald-500" : "bg-primary"
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* Amounts */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatBRL(goal.currentAmount)}</span>
                  <span className="font-medium text-foreground">
                    {formatBRL(goal.targetAmount)}
                  </span>
                </div>

                {/* Deadline */}
                {goal.deadline && (
                  <p className="text-[11px] text-muted-foreground">
                    Prazo:{" "}
                    {new Date(goal.deadline + "T00:00:00").toLocaleDateString(
                      "pt-BR",
                      { day: "2-digit", month: "short", year: "numeric" },
                    )}
                  </p>
                )}

                {exceeded && (
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    ✔ Meta atingida!
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
