"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LucideIcon, navItems, Sidebar } from "@/components/dashboard/sidebar";

interface SidebarShellProps {
  children: ReactNode;
}

const STORAGE_KEY = "sidebar-collapsed";
const mobileNavItems = navItems.filter((item) => item.href !== "#");

export const SidebarShell = ({ children }: SidebarShellProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setIsCollapsed(stored === "true");
  }, []);

  const handleToggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggle}
          pathname={pathname}
        />
        <main className="flex min-w-0 flex-1 flex-col gap-4 md:gap-8 bg-background px-4 py-6 pb-24 sm:px-6 md:px-8 md:py-10 md:pb-10">
          {children}
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface md:hidden">
        <div className="flex items-center justify-around">
          {mobileNavItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-center text-[11px] font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <LucideIcon
                  icon={item.icon}
                  className={`h-5 w-5 ${
                    isActive ? "stroke-primary" : ""
                  }`}
                  aria-hidden
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
