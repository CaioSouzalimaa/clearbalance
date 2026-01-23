"use client";

import React, { useState } from "react";
import { DollarSign } from "lucide";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LucideIcon, IconNode } from "@/components/dashboard/sidebar";

interface Transaction {
  id: number;
  description: string;
  category: string;
  categoryIcon?: IconNode;
  date: string;
  amount: string;
  type: "entrada" | "saida";
  recurrenceMode: "nao_recorrente" | "recorrente";
  recurrenceKind?: "fixa" | "variavel";
  recurrenceFrequency?: "mensal" | "semanal" | "anual";
  billingDay?: string;
  isSettled: boolean;
  paymentDate?: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

interface TransactionFormState {
  description: string;
  category: string;
  date: string;
  amount: string;
  type: "entrada" | "saida";
  recurrenceMode: Transaction["recurrenceMode"];
  recurrenceKind: Transaction["recurrenceKind"];
  recurrenceFrequency: Transaction["recurrenceFrequency"];
  billingDay: string;
  isSettled: boolean;
  paymentDate: string;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
}) => {
  const [rows, setRows] = useState<Transaction[]>(transactions);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [formState, setFormState] = useState<TransactionFormState>({
    description: "",
    category: "",
    date: "",
    amount: "",
    type: "entrada",
    recurrenceMode: "nao_recorrente",
    recurrenceKind: "fixa",
    recurrenceFrequency: "mensal",
    billingDay: "",
    isSettled: false,
    paymentDate: "",
  });
  const [saveFeedback, setSaveFeedback] = useState("");

  const formatCurrencyBRL = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      return "";
    }

    const numberValue = Number(digits) / 100;

    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatAmountWithType = (value: string, type: Transaction["type"]) => {
    const formatted = formatCurrencyBRL(value);

    if (!formatted) {
      return "";
    }

    return `${type === "entrada" ? "+" : "-"} ${formatted}`;
  };

  const startEditing = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormState({
      description: transaction.description,
      category: transaction.category,
      date: transaction.date,
      amount: formatCurrencyBRL(transaction.amount),
      type: transaction.type,
      recurrenceMode: transaction.recurrenceMode,
      recurrenceKind: transaction.recurrenceKind ?? "fixa",
      recurrenceFrequency: transaction.recurrenceFrequency ?? "mensal",
      billingDay: transaction.billingDay ?? "",
      isSettled: transaction.isSettled,
      paymentDate:
        transaction.paymentDate ??
        (transaction.isSettled ? new Date().toISOString().split("T")[0] : ""),
    });
  };

  const handleDelete = (id: number) => {
    setRows((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingTransaction) {
      return;
    }

    setRows((prev) =>
      prev.map((item) =>
        item.id === editingTransaction.id
          ? {
              ...item,
              description: formState.description,
              category: formState.category,
              date: formState.date,
              amount: formatAmountWithType(formState.amount, formState.type),
              type: formState.type,
              recurrenceMode: formState.recurrenceMode,
              recurrenceKind:
                formState.recurrenceMode === "recorrente"
                  ? formState.recurrenceKind
                  : undefined,
              recurrenceFrequency:
                formState.recurrenceMode === "recorrente"
                  ? formState.recurrenceFrequency
                  : undefined,
              billingDay:
                formState.recurrenceMode === "recorrente"
                  ? formState.billingDay
                  : undefined,
              isSettled: formState.isSettled,
              paymentDate: formState.isSettled ? formState.paymentDate : "",
            }
          : item
      )
    );
    setEditingTransaction(null);
    setSaveFeedback("Alterações salvas com sucesso.");
    window.setTimeout(() => setSaveFeedback(""), 3000);
  };

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Lançamentos</h2>
            <p className="text-sm text-muted-foreground">
              Confira suas movimentações recentes.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {transactions.length} itens
          </span>
        </div>
        {saveFeedback ? (
          <div className="border-b border-border bg-primary/5 px-6 py-3 text-sm font-medium text-primary">
            {saveFeedback}
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-background text-left text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-semibold">Descrição</th>
                <th className="px-6 py-3 font-semibold">Categoria</th>
                <th className="px-6 py-3 font-semibold">Data</th>
                <th className="px-6 py-3 font-semibold">Recorrência</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Valor</th>
                <th className="px-6 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-6 text-center text-sm text-muted-foreground"
                  >
                    Nenhum lançamento cadastrado.
                  </td>
                </tr>
              ) : (
                rows.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {item.categoryIcon ? (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground">
                            <LucideIcon
                              icon={item.categoryIcon}
                              className="h-4 w-4"
                              aria-hidden
                            />
                          </span>
                        ) : null}
                        <span>{item.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {item.recurrenceMode === "recorrente"
                            ? item.recurrenceKind === "fixa"
                              ? "Recorrente fixa"
                              : "Recorrente variável"
                            : "Não recorrente"}
                        </span>
                        {item.recurrenceMode === "recorrente" &&
                        item.recurrenceFrequency ? (
                          <span className="text-xs text-muted-foreground">
                            {item.recurrenceFrequency === "mensal"
                              ? "Mensal"
                              : item.recurrenceFrequency === "semanal"
                              ? "Semanal"
                              : "Anual"}
                            {item.billingDay
                              ? ` • Dia ${item.billingDay}`
                              : ""}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          item.isSettled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.isSettled
                          ? item.type === "entrada"
                            ? "Recebido"
                            : "Pago"
                          : "Pendente"}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-semibold ${
                        item.type === "entrada"
                          ? "text-emerald-600"
                          : "text-rose-500"
                      }`}
                    >
                      {item.amount}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-border px-3 py-1 text-xs"
                          onClick={() => startEditing(item)}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-border px-3 py-1 text-xs text-rose-500 hover:bg-rose-500/10"
                          onClick={() => handleDelete(item.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingTransaction ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="editar-lancamento-title"
        >
          <div className="w-full max-w-lg rounded-xl bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="editar-lancamento-title"
                  className="text-lg font-semibold text-foreground"
                >
                  Editar lançamento
                </h2>
                <p className="text-sm text-muted-foreground">
                  Ajuste as informações do lançamento selecionado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTransaction(null)}
                className="rounded-full px-2 text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={handleSave}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setEditingTransaction(null);
                }
              }}
            >
              <div className="space-y-2">
                <label
                  htmlFor="edit-descricao"
                  className="text-sm font-medium text-foreground"
                >
                  Descrição
                </label>
                <Input
                  id="edit-descricao"
                  name="description"
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="edit-valor"
                    className="text-sm font-medium text-foreground"
                  >
                    Valor
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                      <LucideIcon
                        icon={DollarSign}
                        className="h-4 w-4"
                        aria-hidden
                      />
                    </span>
                    <Input
                      id="edit-valor"
                      name="amount"
                      inputMode="numeric"
                      value={formState.amount}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          amount: formatCurrencyBRL(event.target.value),
                        }))
                      }
                      className="pl-9 text-right"
                      aria-describedby="edit-valor-helper"
                    />
                  </div>
                  <p
                    id="edit-valor-helper"
                    className="text-xs text-muted-foreground"
                  >
                    Informe o valor total do lançamento.
                  </p>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="edit-categoria"
                    className="text-sm font-medium text-foreground"
                  >
                    Categoria
                  </label>
                  <Input
                    id="edit-categoria"
                    name="category"
                    value={formState.category}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        category: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="edit-tipo"
                    className="text-sm font-medium text-foreground"
                  >
                    Tipo
                  </label>
                  <select
                    id="edit-tipo"
                    name="type"
                    value={formState.type}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        type: event.target.value as TransactionFormState["type"],
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="edit-data"
                    className="text-sm font-medium text-foreground"
                  >
                    {formState.recurrenceMode === "recorrente"
                      ? "Data do primeiro lançamento"
                      : "Data do lançamento"}
                  </label>
                  <Input
                    id="edit-data"
                    name="date"
                    value={formState.date}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        date: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Recorrência
                  </label>
                  <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="radio"
                        name="recurrenceMode"
                        value="nao_recorrente"
                        checked={formState.recurrenceMode === "nao_recorrente"}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            recurrenceMode:
                              event.target.value as TransactionFormState["recurrenceMode"],
                          }))
                        }
                        className="h-4 w-4 border-border text-primary"
                      />
                      Não recorrente
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="radio"
                        name="recurrenceMode"
                        value="recorrente"
                        checked={formState.recurrenceMode === "recorrente"}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            recurrenceMode:
                              event.target.value as TransactionFormState["recurrenceMode"],
                          }))
                        }
                        className="h-4 w-4 border-border text-primary"
                      />
                      Recorrente
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Usado para despesas ou receitas que se repetem.
                  </p>
                </div>
                {formState.recurrenceMode === "recorrente" ? (
                  <div className="space-y-2">
                    <label
                      htmlFor="edit-recurrence-type"
                      className="text-sm font-medium text-foreground"
                    >
                      Tipo
                    </label>
                    <select
                      id="edit-recurrence-type"
                      name="recurrenceKind"
                      value={formState.recurrenceKind ?? "fixa"}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          recurrenceKind:
                            event.target.value as TransactionFormState["recurrenceKind"],
                        }))
                      }
                      className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="fixa">Fixa</option>
                      <option value="variavel">Variável</option>
                    </select>
                  </div>
                ) : null}
              </div>

              {formState.recurrenceMode === "recorrente" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="edit-recurrence-frequency"
                      className="text-sm font-medium text-foreground"
                    >
                      Frequência
                    </label>
                    <select
                      id="edit-recurrence-frequency"
                      name="recurrenceFrequency"
                      value={formState.recurrenceFrequency ?? "mensal"}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          recurrenceFrequency:
                            event.target.value as TransactionFormState["recurrenceFrequency"],
                        }))
                      }
                      className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="mensal">Mensal</option>
                      <option value="semanal">Semanal</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="edit-billing-day"
                      className="text-sm font-medium text-foreground"
                    >
                      Dia de cobrança
                    </label>
                    <Input
                      id="edit-billing-day"
                      name="billingDay"
                      type="number"
                      min={1}
                      max={31}
                      placeholder="Ex: 5"
                      value={formState.billingDay}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          billingDay: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground md:col-span-2">
                    Lançamentos recorrentes são gerados automaticamente.
                  </p>
                </div>
              ) : null}

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Status de pagamento
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use este status para controlar o que já foi liquidado.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formState.isSettled}
                    onClick={() =>
                      setFormState((prev) => {
                        const nextValue = !prev.isSettled;
                        const nextPaymentDate = nextValue
                          ? prev.paymentDate ||
                            new Date().toISOString().split("T")[0]
                          : "";

                        return {
                          ...prev,
                          isSettled: nextValue,
                          paymentDate: nextPaymentDate,
                        };
                      })
                    }
                    className={`relative inline-flex h-8 w-16 items-center rounded-full border transition ${
                      formState.isSettled
                        ? "border-primary bg-primary"
                        : "border-border bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute left-1 flex h-6 w-6 items-center justify-center rounded-full bg-background shadow transition ${
                        formState.isSettled ? "translate-x-8" : "translate-x-0"
                      }`}
                    />
                    <span className="sr-only">Alternar status</span>
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formState.isSettled ? "Pago" : "Pendente"}</span>
                  {formState.isSettled ? (
                    <label
                      htmlFor="edit-payment-date"
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <span>Data de pagamento</span>
                      <Input
                        id="edit-payment-date"
                        name="paymentDate"
                        type="date"
                        value={formState.paymentDate}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            paymentDate: event.target.value,
                          }))
                        }
                        className="h-8 w-auto px-2 py-1 text-xs"
                      />
                    </label>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingTransaction(null)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar alterações</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};
