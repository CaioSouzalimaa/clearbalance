"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide";

import { LucideIcon } from "@/components/dashboard/sidebar";
import { PT_MONTHS_FULL, PT_MONTHS_SHORT } from "@/lib/date-utils";

interface MonthSelectorProps {
  year: number;
  month: number; // 0-indexed
  onMonthChange?: (year: number, month: number) => void;
}

export const MonthSelector = ({
  year,
  month,
  onMonthChange,
}: MonthSelectorProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);
  const containerRef = useRef<HTMLDivElement>(null);

  const pushDashboardMonth = (y: number, m: number) => {
    const mStr = String(m + 1).padStart(2, "0");
    router.push(`/dashboard?month=${y}-${mStr}`, { scroll: false });
  };

  const commitMonthChange = (y: number, m: number) => {
    if (onMonthChange) {
      onMonthChange(y, m);
      return;
    }

    pushDashboardMonth(y, m);
  };

  // Sync picker year when prop changes (e.g. arrow nav outside picker)
  useEffect(() => {
    setPickerYear(year);
  }, [year]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const navigate = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    const y = next.getFullYear();
    const m = next.getMonth();
    startTransition(() => {
      commitMonthChange(y, m);
    });
  };

  const goToMonth = (y: number, m: number) => {
    setIsOpen(false);
    startTransition(() => {
      commitMonthChange(y, m);
    });
  };

  const goToToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    startTransition(() => {
      commitMonthChange(y, m);
    });
  };

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div ref={containerRef} className="relative">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isPending}
            className="rounded p-1 text-muted-foreground transition hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            aria-label="Mês anterior"
          >
            <LucideIcon icon={ChevronLeft} className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => { setPickerYear(year); setIsOpen((v) => !v); }}
            disabled={isPending}
            className="relative flex min-w-28 sm:min-w-36 items-center justify-center rounded px-1 py-0.5 transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            aria-label="Selecionar mês"
            aria-expanded={isOpen}
          >
            {isPending ? (
              <LucideIcon icon={Loader2} className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
            ) : (
              <span className="text-xs sm:text-sm font-semibold capitalize text-foreground">
                {PT_MONTHS_FULL[month]} {year}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(1)}
            disabled={isPending}
            className="rounded p-1 text-muted-foreground transition hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            aria-label="Próximo mês"
          >
            <LucideIcon icon={ChevronRight} className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Month/Year picker dropdown */}
        {isOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-background p-3 shadow-lg">
            {/* Year navigation */}
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPickerYear((y) => y - 1)}
                className="rounded p-1 text-muted-foreground transition hover:text-foreground"
                aria-label="Ano anterior"
              >
                <LucideIcon icon={ChevronLeft} className="h-4 w-4" aria-hidden />
              </button>
              <span className="text-sm font-semibold text-foreground">{pickerYear}</span>
              <button
                type="button"
                onClick={() => setPickerYear((y) => y + 1)}
                className="rounded p-1 text-muted-foreground transition hover:text-foreground"
                aria-label="Próximo ano"
              >
                <LucideIcon icon={ChevronRight} className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-3 gap-1">
              {PT_MONTHS_SHORT.map((label, idx) => {
                const isSelected = pickerYear === year && idx === month;
                const isToday = pickerYear === now.getFullYear() && idx === now.getMonth();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goToMonth(pickerYear, idx)}
                    className={`rounded-lg py-2 text-xs font-medium transition ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : isToday
                          ? "border border-primary text-primary hover:bg-primary/10"
                          : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!isCurrentMonth && (
        <button
          type="button"
          onClick={goToToday}
          disabled={isPending}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          Mês atual
        </button>
      )}
    </div>
  );
};
