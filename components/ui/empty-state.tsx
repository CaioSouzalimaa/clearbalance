import React from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  message: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ message, icon: Icon, action, className }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-8 text-center text-muted-foreground ${className ?? ""}`}>
      {Icon && <Icon className="h-8 w-8 opacity-40" />}
      <p className="text-xs sm:text-sm">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 text-xs sm:text-sm font-medium text-primary hover:underline"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
