import { createElement } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Goal,
  LayoutDashboard,
  Receipt,
  Settings,
  Tags,
  Wallet,
} from "lucide";

import { Button } from "@/components/ui/button";

export const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Categorias", href: "/categories", icon: Tags },
  { label: "Carteiras", href: "#", icon: Wallet },
  { label: "Lançamentos", href: "#", icon: Receipt },
  { label: "Metas", href: "#", icon: Goal },
  { label: "Configurações", href: "/settings", icon: Settings },
];

export type IconNode = [string, Record<string, string | number>][];

interface LucideIconProps {
  icon: IconNode;
  className?: string;
  "aria-hidden"?: boolean;
}

export const LucideIcon = ({
  icon,
  className,
  ...props
}: LucideIconProps) => {
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
        createElement(tag, { ...attrs, key: `${tag}-${index}` })
      )}
    </svg>
  );
};

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar = ({ isCollapsed, onToggleCollapse }: SidebarProps) => {
  return (
    <aside
      className={`hidden min-h-screen flex-col gap-8 border-r border-border bg-surface py-8 transition-all duration-200 md:flex ${
        isCollapsed ? "w-20 px-4" : "w-[260px] px-6"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isCollapsed ? (
            <span className="text-lg font-semibold text-foreground">CB</span>
          ) : (
            <Image
              src="/logo.png"
              alt="ClearBalance"
              width={140}
              height={40}
              className="object-contain"
            />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!isCollapsed}
          className="flex h-9 w-9 items-center justify-center px-0"
        >
          {isCollapsed ? (
            <LucideIcon icon={ChevronRight} className="h-4 w-4" aria-hidden />
          ) : (
            <LucideIcon icon={ChevronLeft} className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </div>
      <nav className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-primary/10 hover:text-primary ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <LucideIcon icon={Icon} className="h-5 w-5" aria-hidden />
              <span className={isCollapsed ? "sr-only" : ""}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      {!isCollapsed ? (
        <div className="mt-auto rounded-2xl bg-primary/10 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Dica rápida</p>
          <p className="mt-2">
            Categorize seus lançamentos para visualizar seus maiores gastos.
          </p>
        </div>
      ) : null}
    </aside>
  );
};
