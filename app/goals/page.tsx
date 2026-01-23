import { CalendarDays, Plus, Target, TrendingUp } from "lucide";

import { LucideIcon } from "@/components/dashboard/sidebar";
import { SidebarShell } from "@/components/dashboard/sidebar-shell";
import { Button } from "@/components/ui/button";

const goals = [
  {
    id: 1,
    name: "Reserva de emergência",
    category: "Segurança",
    target: "R$ 12.000",
    saved: "R$ 7.450",
    progress: 62,
    deadline: "Dez 2024",
  },
  {
    id: 2,
    name: "Viagem para Portugal",
    category: "Lazer",
    target: "R$ 8.500",
    saved: "R$ 3.980",
    progress: 46,
    deadline: "Mar 2025",
  },
  {
    id: 3,
    name: "Entrada do carro",
    category: "Mobilidade",
    target: "R$ 20.000",
    saved: "R$ 12.700",
    progress: 64,
    deadline: "Ago 2025",
  },
];

const highlights = [
  {
    id: 1,
    label: "Metas ativas",
    value: "3 metas",
    icon: Target,
  },
  {
    id: 2,
    label: "Valor acumulado",
    value: "R$ 24.130",
    icon: TrendingUp,
  },
  {
    id: 3,
    label: "Próximo prazo",
    value: "Dezembro 2024",
    icon: CalendarDays,
  },
];

const nextSteps = [
  {
    id: 1,
    title: "Agendar aporte mensal",
    description: "Automatize transferências para manter o ritmo das metas.",
  },
  {
    id: 2,
    title: "Revisar gastos variáveis",
    description: "Encontre oportunidades para acelerar a viagem.",
  },
  {
    id: 3,
    title: "Simular rentabilidade",
    description: "Veja quanto renderia investir as metas em renda fixa.",
  },
];

export default function GoalsPage() {
  return (
    <SidebarShell>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Acompanhe o progresso das suas metas
          </p>
          <h1 className="text-2xl font-semibold text-foreground">Metas</h1>
        </div>
        <Button className="gap-2">
          <LucideIcon icon={Plus} className="h-4 w-4" aria-hidden />
          Nova meta
        </Button>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {highlights.map((highlight) => (
          <div
            key={highlight.id}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {highlight.label}
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <LucideIcon
                  icon={highlight.icon}
                  className="h-4 w-4"
                  aria-hidden
                />
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-foreground">
              {highlight.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Metas em andamento
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Visão geral dos objetivos que você está construindo.
              </p>
            </div>
            <Button variant="outline" className="border-border">
              Ver histórico
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="rounded-xl border border-border px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {goal.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {goal.category} • Prazo: {goal.deadline}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">
                      {goal.saved}
                    </p>
                    <p>de {goal.target}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progresso</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">
              Próximas ações
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Mantenha o foco com pequenos passos.
            </p>

            <div className="mt-6 space-y-4">
              {nextSteps.map((step) => (
                <div
                  key={step.id}
                  className="rounded-xl border border-border bg-background px-4 py-3"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">
              Status do mês
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Você já alcançou 72% da meta mensal de aportes.
            </p>

            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Aportes planejados</span>
                <span className="font-semibold text-foreground">R$ 2.400</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Aportes realizados</span>
                <span className="font-semibold text-foreground">R$ 1.720</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Faltam</span>
                <span className="font-semibold text-primary">R$ 680</span>
              </div>
            </div>

            <Button variant="outline" className="mt-6 w-full border-border">
              Ajustar planejamento
            </Button>
          </div>
        </div>
      </section>
    </SidebarShell>
  );
}
