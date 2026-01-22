import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SummaryCard } from "@/components/dashboard/summary-card";
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
      <div className="grid min-h-screen grid-cols-[260px_1fr]">
        <Sidebar />
        <main className="flex flex-col gap-8 bg-background px-8 py-10">
          <DashboardHeader />

          <section className="grid gap-6 md:grid-cols-3">
            {summaryCards.map((card) => (
              <SummaryCard key={card.title} {...card} />
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">
                Distribuição por categoria
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
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
                      <span className="text-muted-foreground">
                        {item.value}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
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

            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">
                Metas do mês
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
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
                      <span className="text-muted-foreground">
                        {item.value}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
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

          <TransactionsCalendar transactions={transactions} />

          <TransactionsTable transactions={transactions} />
        </main>
      </div>
    </div>
  );
}
