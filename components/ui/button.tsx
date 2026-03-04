import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className,
  ...props
}) => {
  const variants = {
    primary: "bg-primary text-white hover:bg-secondary shadow-sm",
    outline:
      "border border-border text-foreground hover:bg-muted hover:text-foreground",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 py-2 px-6 rounded-md font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
