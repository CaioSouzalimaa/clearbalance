import React, { type ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: string;
  helper: string;
  icon?: ReactNode;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  helper,
  icon,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {icon && (
          <span className="rounded-full bg-primary/10 p-2 text-primary">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {helper}
        </span>
      </div>
    </div>
  );
};
