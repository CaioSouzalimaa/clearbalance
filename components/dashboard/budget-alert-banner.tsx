interface BudgetAlertBannerProps {
  exceeded: string[]; // category names ≥ 100%
  nearLimit: string[]; // category names ≥ 80% and < 100%
}

export const BudgetAlertBanner = ({
  exceeded,
  nearLimit,
}: BudgetAlertBannerProps) => {
  if (exceeded.length === 0 && nearLimit.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {exceeded.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
          <span className="mt-0.5 shrink-0 text-base leading-none">✕</span>
          <p className="text-xs sm:text-sm">
            <span className="font-semibold">Limite excedido: </span>
            {exceeded.join(", ")}
            {" — "}
            {exceeded.length === 1
              ? "esta categoria ultrapassou o orçamento mensal."
              : "estas categorias ultrapassaram o orçamento mensal."}
          </p>
        </div>
      )}
      {nearLimit.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          <span className="mt-0.5 shrink-0 text-base leading-none">⚠</span>
          <p className="text-xs sm:text-sm">
            <span className="font-semibold">Próximo do limite: </span>
            {nearLimit.join(", ")}
            {" — "}
            {nearLimit.length === 1
              ? "esta categoria está acima de 80% do orçamento."
              : "estas categorias estão acima de 80% do orçamento."}
          </p>
        </div>
      )}
    </div>
  );
};
