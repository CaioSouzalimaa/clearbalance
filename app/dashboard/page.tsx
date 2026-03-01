import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/transactions";
import { CategoryDistributionChart } from "@/components/dashboard/category-distribution-chart";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { GoalsProgressChart } from "@/components/dashboard/goals-progress-chart";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { SidebarShell } from "@/components/dashboard/sidebar-shell";
import { TransactionsCalendar } from "@/components/dashboard/transactions-calendar";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { VariationChart } from "@/components/dashboard/variation-chart";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const now = new Date();

  let year = now.getFullYear();
  let month = now.getMonth(); // 0-indexed

  if (params.month) {
    const [y, m] = params.month.split("-").map(Number);
    if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
      year = y;
      month = m - 1; // convert to 0-indexed
    }
  }

  const {
    summaryCards,
    transactions,
    incomeVariation,
    expenseVariation,
    categoryDistribution,
    goalsProgress,
  } = await getDashboardData(session.user.id, year, month);

  return (
    <>
      <SidebarShell>
        <DashboardHeader />

        <MonthSelector year={year} month={month} />

        <section className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {summaryCards.map((card) => (
            <SummaryCard key={card.title} {...card} />
          ))}
        </section>

        <section className="grid gap-4 sm:gap-6 lg:grid-cols-[2fr_1fr]">
          <CategoryDistributionChart
            title="Distribuição por categoria"
            subtitle="Suas principais categorias no mês atual."
            data={categoryDistribution}
          />
          <GoalsProgressChart
            title="Metas do mês"
            subtitle="Progresso das suas metas financeiras."
            data={goalsProgress}
          />
        </section>

        <section className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <VariationChart
            title="Variação de entradas"
            subtitle="Últimos 6 meses"
            accentClassName="text-primary"
            accentColor="#69b3a2"
            data={incomeVariation}
          />
          <VariationChart
            title="Variação de saídas"
            subtitle="Últimos 6 meses"
            accentClassName="text-rose-500"
            accentColor="#f43f5e"
            data={expenseVariation}
          />
        </section>

        <TransactionsCalendar
          transactions={transactions}
          year={year}
          month={month}
        />

        <TransactionsTable transactions={transactions} />
      </SidebarShell>
    </>
  );
}

