import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { BarChart2 } from "lucide";
import { authOptions } from "@/lib/auth";
import { getMonthlyReportData, getAnnualReportData } from "@/lib/transactions";
import { ReportsTabs } from "@/components/dashboard/reports-tabs";
import { SidebarShell } from "@/components/dashboard/sidebar-shell";
import { LucideIcon } from "@/components/dashboard/sidebar";

export const metadata = { title: "Relatórios | ClearBalance" };

interface Props {
  searchParams: Promise<{ tab?: string; year?: string; month?: string }>;
}

export default async function ReportsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const tab = params.tab === "annual" ? "annual" : "monthly";
  const now = new Date();
  const year = parseInt(params.year ?? String(now.getFullYear()), 10) || now.getFullYear();
  const month = parseInt(params.month ?? String(now.getMonth()), 10);
  const safeMonth = Math.min(Math.max(month, 0), 11);

  const [monthly, annual] = await Promise.all([
    tab === "monthly" ? getMonthlyReportData(session.user.id, year, safeMonth) : Promise.resolve(null),
    tab === "annual" ? getAnnualReportData(session.user.id, year) : Promise.resolve(null),
  ]);

  return (
    <SidebarShell>
      <div className="flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <LucideIcon icon={BarChart2} className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h1 className="text-xl font-bold leading-none">Relatórios</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Análise das suas finanças por período
            </p>
          </div>
        </header>

        <div className="rounded-xl sm:rounded-2xl border border-border bg-surface p-3 sm:p-6 shadow-sm">
          <ReportsTabs
            tab={tab}
            year={year}
            month={safeMonth}
            monthly={monthly}
            annual={annual}
          />
        </div>
      </div>
    </SidebarShell>
  );
}
