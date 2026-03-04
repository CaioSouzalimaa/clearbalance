"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Edit, Plus, Target, Trash2, TrendingUp } from "lucide";

import { ConfirmModal } from "@/components/dashboard/confirm-modal";
import { LucideIcon } from "@/components/dashboard/sidebar";
import { SidebarShell } from "@/components/dashboard/sidebar-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  progress: number;
}

interface GoalModalProps {
  isOpen: boolean;
  editingGoal: Goal | null;
  onClose: () => void;
  onSave: (goal: Goal) => void;
}

function formatBRL(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return (Number(digits) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parseBRL(formatted: string): number {
  return Number(formatted.replace(/\D/g, "")) / 100;
}

function GoalModal({ isOpen, editingGoal, onClose, onSave }: GoalModalProps) {
  const [formName, setFormName] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editingGoal) {
        setFormName(editingGoal.name);
        setFormTarget(
          formatBRL(String(Math.round(editingGoal.targetAmount * 100))),
        );
        setFormDeadline(editingGoal.deadline ?? "");
      } else {
        setFormName("");
        setFormTarget("");
        setFormDeadline("");
      }
      setFormError("");
    }
  }, [isOpen, editingGoal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formName.trim();
    const targetAmount = parseBRL(formTarget);

    if (!name) {
      setFormError("Informe o nome da meta.");
      return;
    }
    if (!formTarget || targetAmount <= 0) {
      setFormError("Informe um valor válido para a meta.");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const url = editingGoal ? `/api/goals/${editingGoal.id}` : "/api/goals";
      const method = editingGoal ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          targetAmount,
          deadline: formDeadline || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError((data as { error?: string })?.error ?? "Erro ao salvar.");
        return;
      }

      const saved: Goal = await res.json();
      onSave(saved);
      onClose();
    } catch {
      setFormError("Erro ao salvar a meta.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-surface p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-foreground">
          {editingGoal ? "Editar meta" : "Nova meta"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina um objetivo financeiro para acompanhar seu progresso.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {formError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="goal-name"
              className="text-sm font-medium text-foreground"
            >
              Nome da meta
            </label>
            <Input
              id="goal-name"
              placeholder="Ex.: Reserva de emergência"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="goal-target"
              className="text-sm font-medium text-foreground"
            >
              Valor da meta
            </label>
            <Input
              id="goal-target"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={formTarget}
              onChange={(e) => setFormTarget(formatBRL(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="goal-deadline"
              className="text-sm font-medium text-foreground"
            >
              Prazo (opcional)
            </label>
            <Input
              id="goal-deadline"
              type="date"
              value={formDeadline}
              onChange={(e) => setFormDeadline(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isSaving ? "Salvando…" : editingGoal ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contributions, setContributions] = useState<Record<string, string>>(
    {},
  );
  const [contributingId, setContributingId] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [feedback, setFeedback] = useState("");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3000);
  };

  const loadGoals = async () => {
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        setGoals(await res.json());
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const totals = useMemo(() => {
    const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const sortedByDeadline = [...goals]
      .filter((g) => g.deadline)
      .sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return dateA - dateB;
      });
    const nextDeadline = sortedByDeadline[0]?.deadline
      ? new Date(sortedByDeadline[0].deadline).toLocaleDateString("pt-BR", {
          month: "short",
          year: "numeric",
        })
      : "-";
    return { totalSaved, nextDeadline };
  }, [goals]);

  const highlights = [
    {
      id: 1,
      label: "Metas ativas",
      value: `${goals.length} meta${goals.length !== 1 ? "s" : ""}`,
      icon: Target,
    },
    {
      id: 2,
      label: "Valor acumulado",
      value: formatCurrency(totals.totalSaved),
      icon: TrendingUp,
    },
    {
      id: 3,
      label: "Próximo prazo",
      value: totals.nextDeadline,
      icon: CalendarDays,
    },
  ];

  const handleContributionChange = (goalId: string, value: string) => {
    setContributions((prev) => ({ ...prev, [goalId]: formatBRL(value) }));
  };

  const handleAddContribution = async (goalId: string) => {
    const rawValue = contributions[goalId]?.trim() ?? "";
    if (!rawValue) return;

    const amount = parseBRL(rawValue);
    if (amount <= 0) {
      showFeedback("Informe um valor válido.");
      return;
    }

    setContributingId(goalId);
    try {
      const res = await fetch(`/api/goals/${goalId}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showFeedback(
          (data as { error?: string })?.error ?? "Erro ao registrar aporte.",
        );
        return;
      }

      const updated: Goal = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
      setContributions((prev) => ({ ...prev, [goalId]: "" }));
      showFeedback("Aporte registrado com sucesso!");
    } catch {
      showFeedback("Erro ao registrar aporte.");
    } finally {
      setContributingId(null);
    }
  };

  const handleWithdrawal = async (goalId: string) => {
    const rawValue = contributions[goalId]?.trim() ?? "";
    if (!rawValue) return;

    const amount = parseBRL(rawValue);
    if (amount <= 0) {
      showFeedback("Informe um valor válido.");
      return;
    }

    const goal = goals.find((g) => g.id === goalId);
    if (goal && amount > goal.currentAmount) {
      showFeedback(
        "O valor da retirada não pode ser maior que o saldo da meta.",
      );
      return;
    }

    setWithdrawingId(goalId);
    try {
      const res = await fetch(`/api/goals/${goalId}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showFeedback(
          (data as { error?: string })?.error ?? "Erro ao registrar retirada.",
        );
        return;
      }

      const updated: Goal = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
      setContributions((prev) => ({ ...prev, [goalId]: "" }));
      showFeedback("Retirada registrada com sucesso!");
    } catch {
      showFeedback("Erro ao registrar retirada.");
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleSaveGoal = (saved: Goal) => {
    if (editingGoal) {
      setGoals((prev) => prev.map((g) => (g.id === saved.id ? saved : g)));
      showFeedback("Meta atualizada com sucesso!");
    } else {
      setGoals((prev) => [saved, ...prev]);
      showFeedback("Meta criada com sucesso!");
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/goals/${pendingDeleteId}`, {
        method: "DELETE",
      });
      if (res.ok || res.status === 204) {
        setGoals((prev) => prev.filter((g) => g.id !== pendingDeleteId));
        showFeedback("Meta excluída.");
      } else {
        const data = await res.json().catch(() => ({}));
        showFeedback(
          (data as { error?: string })?.error ?? "Erro ao excluir meta.",
        );
      }
    } catch {
      showFeedback("Erro ao excluir meta.");
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
    }
  };

  const pendingDeleteName =
    goals.find((g) => g.id === pendingDeleteId)?.name ?? "";

  return (
    <SidebarShell>
      <ConfirmModal
        isOpen={!!pendingDeleteId}
        title="Excluir meta"
        message={`Tem certeza que deseja excluir "${pendingDeleteName}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />

      <GoalModal
        isOpen={isModalOpen}
        editingGoal={editingGoal}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
      />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Acompanhe o progresso das suas metas
          </p>
          <h1 className="text-2xl font-semibold text-foreground">Metas</h1>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <LucideIcon icon={Plus} className="h-4 w-4" aria-hidden />
          Nova meta
        </Button>
      </header>

      {feedback && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
          {feedback}
        </div>
      )}

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

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Metas em andamento
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Visão geral dos objetivos que você está construindo.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border px-4 py-4 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="h-2.5 w-full rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </div>
              ))}
            </>
          ) : goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma meta criada ainda. Clique em "Nova meta" para começar!
            </p>
          ) : (
            goals.map((goal) => {
              const isContributing = contributingId === goal.id;
              return (
                <div
                  key={goal.id}
                  className="rounded-xl border border-border px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {goal.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {goal.deadline
                          ? `Prazo: ${new Date(goal.deadline).toLocaleDateString("pt-BR")}`
                          : "Sem prazo definido"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 px-2"
                        onClick={() => handleEditGoal(goal)}
                      >
                        <LucideIcon
                          icon={Edit}
                          className="h-3.5 w-3.5"
                          aria-hidden
                        />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 px-2 text-rose-500 hover:bg-rose-500/10"
                        onClick={() => setPendingDeleteId(goal.id)}
                      >
                        <LucideIcon
                          icon={Trash2}
                          className="h-3.5 w-3.5"
                          aria-hidden
                        />
                      </Button>
                    </div>
                    <div className="w-full text-right text-sm text-muted-foreground sm:w-auto">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(goal.currentAmount)}
                      </p>
                      <p>de {formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progresso</span>
                      <span
                        className={
                          goal.progress > 100
                            ? "font-semibold text-emerald-500"
                            : ""
                        }
                      >
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${goal.progress > 100 ? "bg-emerald-500" : "bg-primary"}`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      />
                    </div>
                    {goal.progress > 100 && (
                      <p className="mt-1 text-xs font-medium text-emerald-500">
                        ✔ Meta atingida!
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <label
                        htmlFor={`aporte-${goal.id}`}
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Registrar aporte ou retirada
                      </label>
                      <Input
                        id={`aporte-${goal.id}`}
                        name={`aporte-${goal.id}`}
                        inputMode="numeric"
                        placeholder="R$ 0,00"
                        value={contributions[goal.id] ?? ""}
                        onChange={(event) =>
                          handleContributionChange(goal.id, event.target.value)
                        }
                        disabled={isContributing || withdrawingId === goal.id}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-border"
                        onClick={() => handleAddContribution(goal.id)}
                        disabled={isContributing || withdrawingId === goal.id}
                      >
                        {isContributing ? "Registrando…" : "Aporte"}
                      </Button>
                      {goal.currentAmount > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-rose-300 text-rose-500 hover:bg-rose-500/10"
                          onClick={() => handleWithdrawal(goal.id)}
                          disabled={isContributing || withdrawingId === goal.id}
                        >
                          {withdrawingId === goal.id ? "Retirando…" : "Retirar"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </SidebarShell>
  );
}
