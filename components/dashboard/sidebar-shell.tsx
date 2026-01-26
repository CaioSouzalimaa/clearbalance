"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";

import { LucideIcon, navItems, Sidebar } from "@/components/dashboard/sidebar";

interface SidebarShellProps {
  children: ReactNode;
}

export const SidebarShell = ({ children }: SidebarShellProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />
        <main className="flex flex-1 flex-col gap-8 bg-background px-4 py-6 pb-24 sm:px-6 md:px-8 md:py-10 md:pb-10">
          {children}
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface px-6 py-3 md:hidden">
        <div className="flex items-center justify-around text-xs font-medium text-muted-foreground">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-1 text-center transition-colors hover:text-primary"
            >
              <LucideIcon icon={item.icon} className="h-5 w-5" aria-hidden />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};
