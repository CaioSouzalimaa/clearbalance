import React from "react";

interface SummaryCardProps {
  title: string;
  value: string;
  helper?: string;
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
    <div className="min-w-0 rounded-xl border border-border bg-surface p-2.5 shadow-sm sm:rounded-2xl sm:p-4 lg:p-4">
      <p className="truncate text-[10px] font-medium text-muted-foreground sm:text-xs lg:text-sm">
        {title}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground truncate sm:mt-2 sm:text-lg lg:text-xl">
        {value}
      </p>
      {helper ? (
        <span className="mt-1 inline-block max-w-full truncate rounded-full bg-primary/10 px-1.5 py-0.5 text-[8px] font-semibold text-primary sm:mt-1.5 sm:px-2.5 sm:text-[10px] lg:px-3 lg:py-1 lg:text-xs">
          {helper}
        </span>
      ) : null}
      {subValue && (
        <div className="mt-1.5 flex flex-col gap-0.5 border-t border-border pt-1.5 sm:mt-2 sm:flex-row sm:items-center sm:justify-between sm:pt-2 lg:mt-2.5 lg:pt-2.5">
          <p className="truncate text-[8px] text-muted-foreground sm:text-[10px] lg:text-xs">
            {subHelper}
          </p>
          <p className="truncate text-[10px] font-semibold text-foreground sm:text-xs lg:text-sm">
            {subValue}
          </p>
        </div>
      )}
    </div>
  );
};
