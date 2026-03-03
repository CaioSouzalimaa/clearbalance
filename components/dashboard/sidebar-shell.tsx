"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LucideIcon, navItems, Sidebar } from "@/components/dashboard/sidebar";

interface SidebarShellProps {
  children: ReactNode;
}

const mobileNavItems = navItems.filter((item) => item.href !== "#");

export const SidebarShell = ({ children }: SidebarShellProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          pathname={pathname}
        />
        <main className="flex flex-1 flex-col gap-8 bg-background px-4 py-6 pb-24 sm:px-6 md:px-8 md:py-10 md:pb-10">
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
