import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDashboardData } from "@/lib/transactions";
import { CategoryDistributionChart } from "@/components/dashboard/category-distribution-chart";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { GoalsProgressChart } from "@/components/dashboard/goals-progress-chart";
import { GuidedTour } from "@/components/dashboard/guided-tour";
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

  const [userPrefs, dashboardData] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hasSeenTour: true },
    }),
    getDashboardData(session.user.id, year, month),
  ]);

  const {
    summaryCards,
    cumulativeBalance,
    transactions,
    incomeVariation,
    expenseVariation,
    incomeDistribution,
    categoryDistribution,
    goalsProgress,
  } = dashboardData;

  const hasSeenTour = userPrefs?.hasSeenTour ?? false;

  return (
    <>
      <SidebarShell>
        <GuidedTour hasSeenTour={hasSeenTour} />

        <DashboardHeader />

        <div data-tour="month-selector">
          <MonthSelector year={year} month={month} />
        </div>

        <section
          data-tour="summary-cards"
          className="grid grid-cols-3 gap-2 sm:gap-6"
        >
          {summaryCards.map((card) => (
            <SummaryCard
              key={card.title}
              {...card}
              {...(card.title === "Saldo"
                ? {
                    subValue: cumulativeBalance,
                    subHelper: "Montante acumulado",
                  }
                : {})}
            />
          ))}
        </section>

        <section
          data-tour="charts"
          className="grid gap-3 sm:gap-6 md:grid-cols-2"
        >
          <CategoryDistributionChart
            title="Distribuição de entradas"
            subtitle="Suas principais categorias de entradas no mês."
            data={incomeDistribution}
          />
          <CategoryDistributionChart
            title="Distribuição de saídas"
            subtitle="Suas principais categorias de saídas no mês."
            data={categoryDistribution}
          />
        </section>

        <section data-tour="goals-chart" className="grid gap-3 sm:gap-6">
          <GoalsProgressChart
            title="Metas do mês"
            subtitle="Progresso das suas metas financeiras."
            data={goalsProgress}
          />
        </section>

        <section data-tour="variation-charts">
          <VariationChart
            title="Variação de entradas e saídas"
            subtitle="Últimos 6 meses"
            incomeData={incomeVariation}
            expenseData={expenseVariation}
          />
        </section>

        <div data-tour="calendar">
          <TransactionsCalendar
            transactions={transactions}
            year={year}
            month={month}
          />
        </div>

        <div data-tour="transactions-table">
          <TransactionsTable
            transactions={transactions}
            year={year}
            month={month}
          />
        </div>
      </SidebarShell>
    </>
  );
}
