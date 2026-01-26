import {
  Briefcase,
  Home,
  Lightbulb,
  PiggyBank,
  ShoppingCart,
} from "lucide";

import { CategoryDistributionChart } from "@/components/dashboard/category-distribution-chart";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { GoalsProgressChart } from "@/components/dashboard/goals-progress-chart";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { SidebarShell } from "@/components/dashboard/sidebar-shell";
import { TransactionsCalendar } from "@/components/dashboard/transactions-calendar";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { VariationChart } from "@/components/dashboard/variation-chart";

const summaryCards = [
  {
    title: "Entradas",
    value: "R$ 18.450,00",
    helper: "+12% mês",
  },
  {
    title: "Saídas",
    value: "R$ 9.680,00",
    helper: "-4% mês",
  },
  {
    title: "Montante",
    value: "R$ 52.390,00",
    helper: "Saldo atual",
  },
];

const transactions = [
  {
    id: 1,
    description: "Salário mensal",
    category: "Renda",
    categoryIcon: Briefcase,
    date: "05 Mar 2025",
    amount: "+ R$ 8.500,00",
    type: "entrada" as const,
    recurrenceMode: "recorrente" as const,
    recurrenceKind: "fixa" as const,
    recurrenceFrequency: "mensal" as const,
    billingDay: "5",
    isSettled: true,
    paymentDate: "2025-03-05",
  },
  {
    id: 2,
    description: "Aluguel",
    category: "Moradia",
    categoryIcon: Home,
    date: "03 Mar 2025",
    amount: "- R$ 2.150,00",
    type: "saida" as const,
    recurrenceMode: "recorrente" as const,
    recurrenceKind: "fixa" as const,
    recurrenceFrequency: "mensal" as const,
    billingDay: "3",
    isSettled: true,
    paymentDate: "2025-03-03",
  },
  {
    id: 3,
    description: "Supermercado",
    category: "Alimentação",
    categoryIcon: ShoppingCart,
    date: "02 Mar 2025",
    amount: "- R$ 620,00",
    type: "saida" as const,
    recurrenceMode: "nao_recorrente" as const,
    isSettled: false,
  },
  {
    id: 4,
    description: "Investimento CDB",
    category: "Investimentos",
    categoryIcon: PiggyBank,
    date: "01 Mar 2025",
    amount: "+ R$ 1.200,00",
    type: "entrada" as const,
    recurrenceMode: "recorrente" as const,
    recurrenceKind: "variavel" as const,
    recurrenceFrequency: "mensal" as const,
    billingDay: "1",
    isSettled: false,
  },
  {
    id: 5,
    description: "Conta de energia",
    category: "Serviços",
    categoryIcon: Lightbulb,
    date: "28 Fev 2025",
    amount: "- R$ 310,00",
    type: "saida" as const,
    recurrenceMode: "recorrente" as const,
    recurrenceKind: "variavel" as const,
    recurrenceFrequency: "mensal" as const,
    billingDay: "28",
    isSettled: false,
  },
];

const incomeVariation = [
  { month: "Out", value: 6.4 },
  { month: "Nov", value: 7.1 },
  { month: "Dez", value: 5.8 },
  { month: "Jan", value: 6.9 },
  { month: "Fev", value: 7.6 },
  { month: "Mar", value: 8.2 },
];

const expenseVariation = [
  { month: "Out", value: 4.2 },
  { month: "Nov", value: 4.8 },
  { month: "Dez", value: 5.1 },
  { month: "Jan", value: 4.4 },
  { month: "Fev", value: 4.9 },
  { month: "Mar", value: 4.3 },
];

const categoryDistribution = [
  { label: "Moradia", value: 35, color: "#69b3a2" },
  { label: "Alimentação", value: 22, color: "#8fc1a9" },
  { label: "Transporte", value: 18, color: "#f2cc8f" },
  { label: "Lazer", value: 15, color: "#f4a261" },
  { label: "Outros", value: 10, color: "#e9c46a" },
];

const goalsProgress = [
  { label: "Reserva", value: 75 },
  { label: "Viagem", value: 40 },
  { label: "Cursos", value: 60 },
];

export default function DashboardPage() {
  return (
    <>
      <SidebarShell>
        <DashboardHeader />

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

        <TransactionsCalendar transactions={transactions} />

        <TransactionsTable transactions={transactions} />
      </SidebarShell>
    </>
  );
}
