import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { RotateCcw } from "lucide";
import { authOptions } from "@/lib/auth";
import { getRecurringRules } from "@/lib/transactions";
import { RecurringTable } from "@/components/dashboard/recurring-table";
import { SidebarShell } from "@/components/dashboard/sidebar-shell";
import { LucideIcon } from "@/components/dashboard/sidebar";

export const metadata = { title: "Recorrentes | ClearBalance" };

export default async function RecurringPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const rules = await getRecurringRules(session.user.id);

  return (
    <SidebarShell>
      <div className="flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <LucideIcon icon={RotateCcw} className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h1 className="text-xl font-bold leading-none">Recorrentes</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {rules.length} transaç{rules.length === 1 ? "ão" : "ões"} com recorrência ativa
            </p>
          </div>
        </header>

        <div className="rounded-xl sm:rounded-2xl border border-border bg-surface p-3 sm:p-6 shadow-sm">
          <RecurringTable rules={rules} />
        </div>
      </div>
    </SidebarShell>
  );
}
