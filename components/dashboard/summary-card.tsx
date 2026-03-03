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
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {helper}
        </span>
      </div>
      {subValue && (
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">{subHelper}</p>
          <p className="text-sm font-semibold text-foreground">{subValue}</p>
        </div>
      )}
    </div>
  );
};
