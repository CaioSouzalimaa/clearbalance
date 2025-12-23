import React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        "w-full px-4 py-2.5 rounded-md border border-gray-300 bg-white",
        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
        "transition-all text-foreground placeholder:text-gray-400",
        className
      )}
      {...props}
    />
  );
};
