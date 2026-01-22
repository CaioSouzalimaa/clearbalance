import Image from "next/image";
import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Carteiras", href: "#" },
  { label: "Lançamentos", href: "#" },
  { label: "Metas", href: "#" },
  { label: "Configurações", href: "/settings" },
];

export const Sidebar = () => {
  return (
    <aside className="flex h-full flex-col gap-8 border-r border-border bg-surface px-6 py-8">
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="ClearBalance"
          width={140}
          height={40}
          className="object-contain"
        />
      </div>
      <nav className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-lg px-3 py-2 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl bg-primary/10 p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Dica rápida</p>
        <p className="mt-2">
          Categorize seus lançamentos para visualizar seus maiores gastos.
        </p>
      </div>
    </aside>
  );
};
