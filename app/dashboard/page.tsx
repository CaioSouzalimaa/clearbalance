import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDashboardData } from "@/lib/transactions";
import { CategoryBarsChart } from "../../components/dashboard/category-bars-chart";
import { BudgetProgressChart } from "@/components/dashboard/budget-progress-chart";
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
    budgetProgress,
  } = dashboardData;

  const displaySummaryCards = [
    ...summaryCards,
    {
      title: "Montante",
      value: cumulativeBalance,
    },
  ];

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
          className="grid grid-cols-2 items-start gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4"
        >
          {displaySummaryCards.map((card) => (
            <SummaryCard
              key={card.title}
              {...card}
              helper={
                card.title === "Saldo" || card.title === "Montante"
                  ? undefined
                  : card.helper
              }
            />
          ))}
        </section>

        <section className="grid gap-3 sm:gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div data-tour="variation-charts" className="h-full">
            <VariationChart
              title="Variação de entradas e saídas"
              subtitle="Últimos 6 meses"
              incomeData={incomeVariation}
              expenseData={expenseVariation}
              className="h-full min-h-90 sm:min-h-105"
            />
          </div>

          <div data-tour="charts" className="h-full">
            <CategoryBarsChart
              expenseData={categoryDistribution}
              incomeData={incomeDistribution}
              maxVisibleItems={5}
              className="h-full min-h-90 sm:min-h-105"
            />
          </div>
        </section>

        <section data-tour="goals-chart" className="grid gap-3 sm:gap-6">
          <GoalsProgressChart
            title="Metas do mês"
            subtitle="Progresso das suas metas financeiras."
            data={goalsProgress}
          />
        </section>

        <section className="grid gap-3 sm:gap-6">
          <BudgetProgressChart
            title="Orçamento por categoria"
            subtitle="Quanto você gastou em relação ao limite mensal de cada categoria."
            data={budgetProgress}
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
