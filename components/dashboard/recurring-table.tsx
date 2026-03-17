"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X as XIcon } from "lucide";
import { useToast } from "@/components/ui/toast";
import { LucideIcon } from "@/components/dashboard/sidebar";
import { iconOptions } from "@/lib/icon-options";
import { ConfirmModal } from "@/components/dashboard/confirm-modal";
import type { RecurringRule } from "@/lib/transactions";
import { fmtDateShort } from "@/lib/date-utils";
import { EmptyState } from "@/components/ui/empty-state";

interface RecurringTableProps {
  rules: RecurringRule[];
}

const freqLabel: Record<RecurringRule["recurrenceFrequency"], string> = {
  mensal: "Mensal",
  semanal: "Semanal",
  anual: "Anual",
};

const freqColor: Record<RecurringRule["recurrenceFrequency"], string> = {
  mensal: "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400",
  semanal: "border-violet-500 text-violet-600 dark:border-violet-400 dark:text-violet-400",
  anual: "border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400",
};


export function RecurringTable({ rules }: RecurringTableProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function handleCancel() {
    if (!confirmId) return;
    setCancellingId(confirmId);
    setConfirmId(null);

    try {
      const res = await fetch(`/api/transactions/${confirmId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast("Recorrência cancelada.", "success");
      router.refresh();
    } catch {
      toast("Erro ao cancelar recorrência.", "error");
    } finally {
      setCancellingId(null);
    }
  }

  if (rules.length === 0) {
    return (
      <EmptyState
        message="Nenhuma transação recorrente encontrada."
        className="py-16"
      />
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-left">
              <th className="pb-3 font-medium pl-2 pr-4">Categoria</th>
              <th className="pb-3 font-medium pr-4">Descrição</th>
              <th className="pb-3 font-medium text-right pr-6">Valor</th>
              <th className="pb-3 font-medium pr-4">Frequência</th>
              <th className="pb-3 font-medium pr-4">Próxima</th>
              <th className="pb-3 font-medium pr-4">Término</th>
              <th className="pb-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rules.map((rule) => {
              const iconNode = iconOptions.find((o) => o.id === rule.categoryIconId)?.icon ?? null;
              return (
                <tr
                  key={rule.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  {/* Category */}
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: rule.categoryColor ?? "#6b7280" }}
                      >
                        {iconNode ? (
                          <LucideIcon
                            icon={iconNode}
                            className="h-3.5 w-3.5 text-white"
                          />
                        ) : null}
                      </span>
                      <span className="font-medium truncate max-w-30">{rule.category}</span>
                    </div>
                  </td>
                  {/* Description */}
                  <td className="py-3">
                    <span className="truncate max-w-45 block">{rule.description}</span>
                    <span className="text-xs text-muted-foreground">
                      {rule.recurrenceKind === "fixa" ? "Fixa" : "Variável"}
                      {rule.billingDay ? ` • dia ${rule.billingDay}` : ""}
                    </span>
                  </td>
                  {/* Amount + Type */}
                  <td className="py-3 text-right pr-6">
                    <span className={`font-semibold tabular-nums ${
                      rule.type === "entrada" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}>
                      {rule.type === "entrada" ? "+" : "−"} {rule.amount}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {rule.type === "entrada" ? "Entrada" : "Saída"}
                    </span>
                  </td>
                  {/* Frequency */}
                  <td className="py-3 pr-4">
                    <span className={`inline-block shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold leading-none ${freqColor[rule.recurrenceFrequency]}`}>
                      {freqLabel[rule.recurrenceFrequency]}
                    </span>
                  </td>
                  {/* Next */}
                  <td className="py-3 text-sm pr-4 whitespace-nowrap">{rule.nextOccurrence}</td>
                  {/* End */}
                  <td className="py-3 text-sm pr-4 text-muted-foreground whitespace-nowrap">
                    {rule.recurrenceEndDate ? fmtDateShort(rule.recurrenceEndDate) : "—"}
                  </td>
                  {/* Cancel */}
                  <td className="py-3 text-right pr-2">
                    <button
                      onClick={() => setConfirmId(rule.id)}
                      disabled={cancellingId === rule.id}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50"
                    >
                      <LucideIcon icon={XIcon} className="h-3.5 w-3.5" />
                      Cancelar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {rules.map((rule) => {
          const iconNode = iconOptions.find((o) => o.id === rule.categoryIconId)?.icon ?? null;
          return (
            <div
              key={rule.id}
              className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: rule.categoryColor ?? "#6b7280" }}
                  >
                    {iconNode ? (
                      <LucideIcon icon={iconNode} className="h-3.5 w-3.5 text-white" />
                    ) : null}
                  </span>
                  <span className="font-medium text-sm">{rule.category}</span>
                </div>
                <span
                  className={`font-semibold text-sm tabular-nums ${
                    rule.type === "entrada"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {rule.type === "entrada" ? "+" : "-"} {rule.amount}
                </span>
              </div>

              <p className="text-sm">{rule.description}</p>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className={`inline-block shrink-0 rounded-full border px-2 py-0.5 font-semibold leading-none ${freqColor[rule.recurrenceFrequency]}`}>
                  {freqLabel[rule.recurrenceFrequency]}
                </span>
                <span className={`inline-block rounded-full px-2 py-0.5 font-medium ${
                  rule.type === "entrada"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                }`}>
                  {rule.type === "entrada" ? "Entrada" : "Saída"}
                </span>
                <span>Próxima: {rule.nextOccurrence}</span>
                {rule.recurrenceEndDate && <span>Término: {rule.recurrenceEndDate}</span>}
              </div>

              <button
                onClick={() => setConfirmId(rule.id)}
                disabled={cancellingId === rule.id}
                className="mt-1 self-start inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50"
              >
                <LucideIcon icon={XIcon} className="h-3.5 w-3.5" />
                Cancelar recorrência
              </button>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={!!confirmId}
        title="Cancelar recorrência?"
        message="A transação será excluída e não gerará mais lançamentos futuros. Esta ação não pode ser desfeita."
        confirmLabel="Cancelar recorrência"
        isLoading={cancellingId !== null}
        onConfirm={handleCancel}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}
