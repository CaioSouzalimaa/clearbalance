import React from "react";

interface SummaryCardProps {
  title: string;
  value: string;
  helper: string;
  subValue?: string;
  subHelper?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  helper,
  subValue,
  subHelper,
}) => {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-border bg-surface p-2 sm:p-6 shadow-sm min-w-0">
      <p className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
      <p className="mt-1 sm:mt-3 text-xs sm:text-2xl font-semibold text-foreground truncate">{value}</p>
      <span className="mt-1 sm:mt-2 inline-block rounded-full bg-primary/10 px-1 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-xs font-semibold text-primary max-w-full truncate">
        {helper}
      </span>
      {subValue && (
        <div className="mt-1.5 sm:mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-border pt-1.5 sm:pt-3 gap-0.5">
          <p className="text-[8px] sm:text-xs text-muted-foreground truncate">{subHelper}</p>
          <p className="text-[9px] sm:text-sm font-semibold text-foreground truncate">{subValue}</p>
        </div>
      )}
    </div>
  );
};
