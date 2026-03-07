"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide";

import { LucideIcon } from "@/components/dashboard/sidebar";

const PT_MONTHS_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface MonthSelectorProps {
  year: number;
  month: number; // 0-indexed
}

export const MonthSelector = ({ year, month }: MonthSelectorProps) => {
  const router = useRouter();

  const navigate = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    const y = next.getFullYear();
    const m = String(next.getMonth() + 1).padStart(2, "0");
    router.push(`/dashboard?month=${y}-${m}`, { scroll: false });
  };

  const goToToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    router.push(`/dashboard?month=${y}-${m}`, { scroll: false });
  };

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1.5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded p-1 text-muted-foreground transition hover:text-foreground"
          aria-label="Mês anterior"
        >
          <LucideIcon icon={ChevronLeft} className="h-4 w-4" aria-hidden />
        </button>
        <span className="min-w-28 sm:min-w-36 text-center text-xs sm:text-sm font-semibold capitalize text-foreground">
          {PT_MONTHS_FULL[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => navigate(1)}
          className="rounded p-1 text-muted-foreground transition hover:text-foreground"
          aria-label="Próximo mês"
        >
          <LucideIcon icon={ChevronRight} className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {!isCurrentMonth && (
        <button
          type="button"
          onClick={goToToday}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          Mês atual
        </button>
      )}
    </div>
  );
};
