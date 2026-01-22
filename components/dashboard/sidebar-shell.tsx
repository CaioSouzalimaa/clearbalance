"use client";

import { ReactNode, useState } from "react";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";

interface SidebarShellProps {
  children: ReactNode;
}

export const SidebarShell = ({ children }: SidebarShellProps) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className={`grid min-h-screen gap-0 ${
          isSidebarVisible ? "grid-cols-[260px_1fr]" : "grid-cols-1"
        }`}
      >
        {isSidebarVisible ? <Sidebar /> : null}
        <main className="flex flex-col gap-8 bg-background px-8 py-10">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSidebarVisible((prev) => !prev)}
              aria-expanded={isSidebarVisible}
            >
              {isSidebarVisible ? "Esconder menu" : "Mostrar menu"}
            </Button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};
