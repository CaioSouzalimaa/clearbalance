"use client";

import { createElement } from "react";
import Image from "next/image";
import icon from "@/app/icon.png";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Goal,
  LayoutDashboard,
  Settings,
  Tags,
} from "lucide";

import { Button } from "@/components/ui/button";

export const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Categorias", href: "/categories", icon: Tags },
  { label: "Metas", href: "/goals", icon: Goal },
  { label: "Configurações", href: "/settings", icon: Settings },
];

export type IconNode = [string, Record<string, string | number>][];

interface LucideIconProps {
  icon: IconNode;
  className?: string;
  "aria-hidden"?: boolean;
}

export const LucideIcon = ({ icon, className, ...props }: LucideIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {icon.map(([tag, attrs], index) =>
        createElement(tag, { ...attrs, key: `${tag}-${index}` }),
      )}
    </svg>
  );
};

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pathname?: string;
}

export const Sidebar = ({ isCollapsed, onToggleCollapse, pathname = "" }: SidebarProps) => {
  return (
    <aside
      className={`sticky top-0 hidden h-screen flex-col gap-8 overflow-x-hidden border-r border-border bg-surface py-8 transition-all duration-200 md:flex ${
        isCollapsed ? "w-20 px-4" : "w-65 px-6"
      }`}
    >
      <Link
        href="/dashboard"
        className={`flex w-full items-center gap-3 ${
          isCollapsed ? "justify-center" : ""
        }`}
      >
        {isCollapsed ? (
          <Image
            src={icon}
            alt="ClearBalance"
            width={32}
            height={32}
            className="object-contain"
          />
        ) : (
          <Image
            src="/logo.png"
            alt="ClearBalance"
            width={140}
            height={40}
            className="object-contain"
          />
        )}
      </Link>
      <nav className="flex flex-1 flex-col gap-2 text-sm font-medium text-muted-foreground">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href !== "#" &&
            (item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-primary/10 hover:text-primary"
              } ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <LucideIcon icon={Icon} className="h-5 w-5" aria-hidden />
              <span className={isCollapsed ? "sr-only" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!isCollapsed}
          className={`flex h-9 w-9 items-center justify-center px-0 ${
            isCollapsed ? "self-center" : ""
          }`}
        >
          {isCollapsed ? (
            <LucideIcon icon={ChevronRight} className="h-4 w-4" aria-hidden />
          ) : (
            <LucideIcon icon={ChevronLeft} className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </div>
    </aside>
  );
};
