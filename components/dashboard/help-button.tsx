"use client";

import { HelpCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTour } from "@/components/providers/tour-provider";
import { Button } from "@/components/ui/button";

interface HelpButtonProps {
  isCollapsed?: boolean;
}

export const HelpButton = ({ isCollapsed = false }: HelpButtonProps) => {
  const { startTour } = useTour();
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = () => {
    if (pathname !== "/dashboard") {
      // Save flag to start tour after redirect
      sessionStorage.setItem("clearbalance-start-tour", "true");
      router.push("/dashboard");
    } else {
      startTour();
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      data-tour="help-button"
      onClick={handleClick}
      aria-label="Iniciar tour guiado"
      title="Tour guiado"
      className={`flex h-9 items-center gap-2 px-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors ${
        isCollapsed ? "w-9 justify-center px-0" : "w-full"
      }`}
    >
      <HelpCircle className="h-5 w-5 shrink-0" aria-hidden />
      <span className={isCollapsed ? "sr-only" : ""}>Ajuda</span>
    </Button>
  );
};
