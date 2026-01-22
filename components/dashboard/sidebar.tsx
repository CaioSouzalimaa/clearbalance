"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", shortLabel: "D", href: "/dashboard" },
  { label: "Carteiras", shortLabel: "C", href: "#" },
  { label: "Lançamentos", shortLabel: "L", href: "#" },
  { label: "Metas", shortLabel: "M", href: "#" },
  { label: "Configurações", shortLabel: "C", href: "#" },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <aside
        className={cn(
          "hidden min-h-screen flex-col gap-6 border-r border-border bg-white px-4 py-6 transition-all md:flex",
          collapsed ? "md:w-20" : "md:w-64"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="ClearBalance"
              width={collapsed ? 40 : 140}
              height={40}
              className="object-contain"
            />
            {!collapsed && (
              <span className="text-sm font-semibold text-foreground">
                ClearBalance
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-primary/10 hover:text-primary"
            aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {collapsed ? ">" : "<"}
          </button>
        </div>
        <nav
          className={cn(
            "flex flex-col gap-2 text-sm font-medium text-gray-600",
            collapsed && "items-center"
          )}
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 transition-colors hover:bg-primary/10 hover:text-primary",
                collapsed && "px-2"
              )}
            >
              <span className={cn("block", collapsed && "hidden")}>
                {item.label}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-semibold text-gray-500",
                  collapsed && "block"
                )}
              >
                {item.shortLabel}
              </span>
            </Link>
          ))}
        </nav>
        {!collapsed && (
          <div className="mt-auto rounded-2xl bg-primary/10 p-4 text-sm text-gray-600">
            <p className="font-semibold text-foreground">Dica rápida</p>
            <p className="mt-2">
              Categorize seus lançamentos para visualizar seus maiores gastos.
            </p>
          </div>
        )}
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-around border-t border-border bg-white px-4 py-3 text-xs font-semibold text-gray-500 shadow-sm md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-1 rounded-md px-2 py-1 transition-colors hover:text-primary"
          >
            <span>{item.shortLabel}</span>
            <span className="text-[10px] text-gray-400">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};
