"use client";

import React, { useMemo, useState } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "todos" | "pendente" | "liquidado"
  >("todos");
  const [typeFilter, setTypeFilter] = useState<"todos" | "entrada" | "saida">(
    "todos"
  );
  const [recurrenceFilter, setRecurrenceFilter] = useState<
    "todos" | "recorrente" | "nao_recorrente"
  >("todos");

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

  const formatBillingLabel = (
    transaction: Transaction,
    prefix = "• "
  ) => {
    if (transaction.recurrenceMode !== "recorrente" || !transaction.billingDay) {
      return "";
    }

    if (transaction.recurrenceFrequency === "semanal") {
      return `${prefix}${transaction.billingDay}`;
    }

    if (transaction.recurrenceFrequency === "anual") {
      return `${prefix}${transaction.billingDay}`;
    }

    return `${prefix}Dia ${transaction.billingDay}`;
  };

  const getBillingDayLabel = () => {
    if (formState.recurrenceFrequency === "semanal") {
      return "Dia da semana";
    }

    if (formState.recurrenceFrequency === "anual") {
      return "Data de cobrança";
    }

    return "Dia de cobrança";
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

  const handleToggleSettlement = (id: number) => {
    setRows((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const nextSettled = !item.isSettled;

        return {
          ...item,
          isSettled: nextSettled,
          paymentDate: nextSettled
            ? item.paymentDate || new Date().toISOString().split("T")[0]
            : "",
        };
      })
    );
  };

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return rows.filter((item) => {
      const matchesSearch = normalizedSearch
        ? `${item.description} ${item.category}`
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesStatus =
        statusFilter === "todos"
          ? true
          : statusFilter === "liquidado"
          ? item.isSettled
          : !item.isSettled;
      const matchesType =
        typeFilter === "todos" ? true : item.type === typeFilter;
      const matchesRecurrence =
        recurrenceFilter === "todos"
          ? true
          : item.recurrenceMode === recurrenceFilter;

      return matchesSearch && matchesStatus && matchesType && matchesRecurrence;
    });
  }, [recurrenceFilter, rows, searchTerm, statusFilter, typeFilter]);

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-6 py-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Lançamentos</h2>
            <p className="text-sm text-muted-foreground">
              Confira suas movimentações recentes.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {filteredRows.length} de {rows.length} itens
          </span>
        </div>
        <div className="border-b border-border bg-muted/20 px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                placeholder="Pesquisar por descrição ou categoria"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="sm:max-w-sm"
              />
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "todos" | "pendente" | "liquidado"
                  )
                }
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-44"
              >
                <option value="todos">Todos os status</option>
                <option value="pendente">Pendentes</option>
                <option value="liquidado">Liquidados</option>
              </select>
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value as "todos" | "entrada" | "saida"
                  )
                }
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-36"
              >
                <option value="todos">Todos os tipos</option>
                <option value="entrada">Entradas</option>
                <option value="saida">Saídas</option>
              </select>
            </div>
            <select
              value={recurrenceFilter}
              onChange={(event) =>
                setRecurrenceFilter(
                  event.target.value as
                    | "todos"
                    | "recorrente"
                    | "nao_recorrente"
                )
              }
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-52"
            >
              <option value="todos">Todas as recorrências</option>
              <option value="nao_recorrente">Não recorrentes</option>
              <option value="recorrente">Recorrentes</option>
            </select>
          </div>
        </div>
        {saveFeedback ? (
          <div className="border-b border-border bg-primary/5 px-6 py-3 text-sm font-medium text-primary">
            {saveFeedback}
          </div>
        ) : null}
        <div className="hidden overflow-x-auto md:block">
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
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-6 text-center text-sm text-muted-foreground"
                  >
                    Nenhum lançamento encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredRows.map((item) => (
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
                            {formatBillingLabel(item)}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
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
                        {item.isSettled && item.paymentDate ? (
                          <span className="text-xs text-muted-foreground">
                            Pago em {item.paymentDate}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleToggleSettlement(item.id)}
                          className="text-left text-xs font-medium text-primary transition hover:text-primary/80"
                        >
                          {item.isSettled
                            ? "Marcar como pendente"
                            : item.type === "entrada"
                            ? "Marcar como recebido"
                            : "Marcar como pago"}
                        </button>
                      </div>
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

        <div className="flex flex-col gap-4 border-t border-border px-6 py-4 md:hidden">
          {filteredRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum lançamento encontrado com os filtros atuais.
            </p>
          ) : (
            filteredRows.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      {item.categoryIcon ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-foreground">
                          <LucideIcon
                            icon={item.categoryIcon}
                            className="h-3.5 w-3.5"
                            aria-hidden
                          />
                        </span>
                      ) : null}
                      <span>{item.category}</span>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      item.type === "entrada"
                        ? "text-emerald-600"
                        : "text-rose-500"
                    }`}
                  >
                    {item.amount}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{item.date}</span>
                  <span>•</span>
                  <span>
                    {item.recurrenceMode === "recorrente"
                      ? item.recurrenceKind === "fixa"
                        ? "Recorrente fixa"
                        : "Recorrente variável"
                      : "Não recorrente"}
                  </span>
                  {item.recurrenceMode === "recorrente" &&
                  item.recurrenceFrequency ? (
                    <span>
                      ({item.recurrenceFrequency === "mensal"
                        ? "Mensal"
                        : item.recurrenceFrequency === "semanal"
                        ? "Semanal"
                        : "Anual"}
                      {formatBillingLabel(item, " ")}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
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
                  {item.isSettled && item.paymentDate ? (
                    <span className="text-xs text-muted-foreground">
                      Pago em {item.paymentDate}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-col gap-2 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => handleToggleSettlement(item.id)}
                    className="text-left text-primary transition hover:text-primary/80"
                  >
                    {item.isSettled
                      ? "Marcar como pendente"
                      : item.type === "entrada"
                      ? "Marcar como recebido"
                      : "Marcar como pago"}
                  </button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-border px-3 py-1 text-xs"
                      onClick={() => startEditing(item)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-border px-3 py-1 text-xs text-rose-500 hover:bg-rose-500/10"
                      onClick={() => handleDelete(item.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
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
                          billingDay: "",
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
                      {getBillingDayLabel()}
                    </label>
                    {formState.recurrenceFrequency === "semanal" ? (
                      <select
                        id="edit-billing-day"
                        name="billingDay"
                        value={formState.billingDay}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            billingDay: event.target.value,
                          }))
                        }
                        className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Selecione</option>
                        <option value="Segunda-feira">Segunda-feira</option>
                        <option value="Terça-feira">Terça-feira</option>
                        <option value="Quarta-feira">Quarta-feira</option>
                        <option value="Quinta-feira">Quinta-feira</option>
                        <option value="Sexta-feira">Sexta-feira</option>
                        <option value="Sábado">Sábado</option>
                        <option value="Domingo">Domingo</option>
                      </select>
                    ) : formState.recurrenceFrequency === "anual" ? (
                      <Input
                        id="edit-billing-day"
                        name="billingDay"
                        type="date"
                        value={formState.billingDay}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            billingDay: event.target.value,
                          }))
                        }
                      />
                    ) : (
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
                    )}
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
