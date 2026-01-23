"use client";

import React, { useState } from "react";

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
  recurrenceType: "unica" | "parcelada" | "fixa";
  installments?: number;
  hasOtherRecurrences?: boolean;
  recurrenceCount?: number;
  isSettled: boolean;
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
  recurrenceType: Transaction["recurrenceType"];
  installments: string;
  hasOtherRecurrences: boolean;
  recurrenceCount: string;
  isSettled: boolean;
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
    recurrenceType: "unica",
    installments: "",
    hasOtherRecurrences: false,
    recurrenceCount: "",
    isSettled: false,
  });

  const startEditing = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormState({
      description: transaction.description,
      category: transaction.category,
      date: transaction.date,
      amount: transaction.amount,
      type: transaction.type,
      recurrenceType: transaction.recurrenceType,
      installments: transaction.installments
        ? `${transaction.installments}`
        : "",
      hasOtherRecurrences: transaction.hasOtherRecurrences ?? false,
      recurrenceCount: transaction.recurrenceCount
        ? `${transaction.recurrenceCount}`
        : "",
      isSettled: transaction.isSettled,
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
              amount: formState.amount,
              type: formState.type,
              recurrenceType: formState.recurrenceType,
              installments:
                formState.recurrenceType === "parcelada" &&
                formState.installments
                  ? Number(formState.installments)
                  : undefined,
              hasOtherRecurrences:
                formState.recurrenceType === "fixa"
                  ? formState.hasOtherRecurrences
                  : undefined,
              recurrenceCount:
                formState.recurrenceType === "fixa" &&
                formState.hasOtherRecurrences &&
                formState.recurrenceCount
                  ? Number(formState.recurrenceCount)
                  : undefined,
              isSettled: formState.isSettled,
            }
          : item
      )
    );
    setEditingTransaction(null);
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
                          {item.recurrenceType === "parcelada"
                            ? `${item.installments ?? 1}x`
                            : item.recurrenceType === "fixa"
                            ? "Fixa"
                            : "Única"}
                        </span>
                        {item.recurrenceType === "fixa" &&
                        item.hasOtherRecurrences &&
                        item.recurrenceCount ? (
                          <span className="text-xs text-muted-foreground">
                            + {item.recurrenceCount} recorrências
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

            <form className="mt-6 space-y-4" onSubmit={handleSave}>
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
                  <Input
                    id="edit-valor"
                    name="amount"
                    value={formState.amount}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        amount: event.target.value,
                      }))
                    }
                  />
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
                    Data
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
                  <label
                    htmlFor="edit-recurrence"
                    className="text-sm font-medium text-foreground"
                  >
                    Recorrência
                  </label>
                  <select
                    id="edit-recurrence"
                    name="recurrenceType"
                    value={formState.recurrenceType}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        recurrenceType:
                          event.target.value as TransactionFormState["recurrenceType"],
                        installments: "",
                        recurrenceCount: "",
                        hasOtherRecurrences: false,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="unica">Única</option>
                    <option value="parcelada">Parcelada</option>
                    <option value="fixa">Fixa</option>
                  </select>
                </div>
                {formState.recurrenceType === "parcelada" ? (
                  <div className="space-y-2">
                    <label
                      htmlFor="edit-installments"
                      className="text-sm font-medium text-foreground"
                    >
                      Quantidade de parcelas
                    </label>
                    <Input
                      id="edit-installments"
                      name="installments"
                      type="number"
                      min={1}
                      value={formState.installments}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          installments: event.target.value,
                        }))
                      }
                    />
                  </div>
                ) : null}
              </div>

              {formState.recurrenceType === "fixa" ? (
                <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={formState.hasOtherRecurrences}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          hasOtherRecurrences: event.target.checked,
                          recurrenceCount: event.target.checked
                            ? prev.recurrenceCount
                            : "",
                        }))
                      }
                      className="h-4 w-4 rounded border-border text-primary"
                    />
                    Possui outras recorrências?
                  </label>
                  {formState.hasOtherRecurrences ? (
                    <div className="space-y-2">
                      <label
                        htmlFor="edit-recurrence-count"
                        className="text-sm font-medium text-foreground"
                      >
                        Quantas recorrências adicionais?
                      </label>
                      <Input
                        id="edit-recurrence-count"
                        name="recurrenceCount"
                        type="number"
                        min={1}
                        value={formState.recurrenceCount}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            recurrenceCount: event.target.value,
                          }))
                        }
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Marque para informar outras entradas ou saídas fixas.
                    </p>
                  )}
                </div>
              ) : null}

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={formState.isSettled}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        isSettled: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-border text-primary"
                  />
                  Marcar como{" "}
                  {formState.type === "entrada" ? "recebido" : "pago"}
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Use este status para controlar o que já foi liquidado.
                </p>
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
