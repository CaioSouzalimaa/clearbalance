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
    primary: "bg-[#69B3A2] text-white hover:bg-[#589d8e] shadow-sm",
    outline: "border border-gray-300 text-gray-600 hover:bg-gray-50",
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
