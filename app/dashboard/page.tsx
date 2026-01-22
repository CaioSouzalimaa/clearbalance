import {
  ArrowDownCircle,
  ArrowUpCircle,
  Landmark,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { VariationChart } from "@/components/dashboard/variation-chart";

const summaryCards = [
  {
    title: "Entradas",
    value: "R$ 18.450,00",
    helper: "+12% mês",
    icon: ArrowUpCircle,
  },
  {
    title: "Saídas",
    value: "R$ 9.680,00",
    helper: "-4% mês",
    icon: ArrowDownCircle,
  },
  {
    title: "Montante",
    value: "R$ 52.390,00",
    helper: "Saldo atual",
    icon: Landmark,
  },
];

const transactions = [
  {
    id: 1,
    description: "Salário mensal",
    category: "Renda",
    date: "05 Mar 2025",
    amount: "+ R$ 8.500,00",
    type: "entrada" as const,
  },
  {
    id: 2,
    description: "Aluguel",
    category: "Moradia",
    date: "03 Mar 2025",
    amount: "- R$ 2.150,00",
    type: "saida" as const,
  },
  {
    id: 3,
    description: "Supermercado",
    category: "Alimentação",
    date: "02 Mar 2025",
    amount: "- R$ 620,00",
    type: "saida" as const,
  },
  {
    id: 4,
    description: "Investimento CDB",
    category: "Investimentos",
    date: "01 Mar 2025",
    amount: "+ R$ 1.200,00",
    type: "entrada" as const,
  },
  {
    id: 5,
    description: "Conta de energia",
    category: "Serviços",
    date: "28 Fev 2025",
    amount: "- R$ 310,00",
    type: "saida" as const,
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

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <main className="flex flex-1 flex-col gap-8 bg-background px-6 py-8 pb-24 md:px-10 md:py-10 md:pb-10">
          <DashboardHeader />

          <section className="grid gap-6 md:grid-cols-3">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <SummaryCard
                  key={card.title}
                  {...card}
                  icon={<Icon size={20} />}
                />
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">
                Distribuição por categoria
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Suas principais categorias no mês atual.
              </p>
              <div className="mt-6 space-y-4">
                {[
                  { label: "Moradia", value: "35%" },
                  { label: "Alimentação", value: "22%" },
                  { label: "Transporte", value: "18%" },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {item.label}
                      </span>
                      <span className="text-gray-500">{item.value}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: item.value,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">
                Metas do mês
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Progresso das suas metas financeiras.
              </p>
              <div className="mt-6 space-y-5">
                {[
                  { label: "Reserva de emergência", value: "75%" },
                  { label: "Viagem", value: "40%" },
                  { label: "Cursos", value: "60%" },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {item.label}
                      </span>
                      <span className="text-gray-500">{item.value}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-secondary"
                        style={{
                          width: item.value,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <VariationChart
              title="Variação de entradas"
              subtitle="Últimos 6 meses"
              accentClassName="text-primary"
              data={incomeVariation}
            />
            <VariationChart
              title="Variação de saídas"
              subtitle="Últimos 6 meses"
              accentClassName="text-rose-500"
              data={expenseVariation}
            />
          </section>

          <TransactionsTable transactions={transactions} />
        </main>
      </div>
    </div>
  );
}
