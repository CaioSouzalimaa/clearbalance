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
        "py-2 px-6 rounded-md font-medium transition-all active:scale-[0.98]",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
