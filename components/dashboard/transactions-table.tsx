"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide";
import { LucideIcon, IconNode } from "@/components/dashboard/sidebar";
import {
  TransactionModal,
  TransactionFormState,
  createDefaultTransactionFormState,
} from "@/components/dashboard/transaction-modal";
import { ConfirmModal } from "@/components/dashboard/confirm-modal";
import { MonthSelector } from "@/components/dashboard/month-selector";

interface Transaction {
  id: string;
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
  recurrenceEndDate?: string;
  isSettled: boolean;
  paymentDate?: string;
  isVirtual?: boolean;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  year: number;
  month: number; // 0-indexed
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  year,
  month,
}) => {
  const router = useRouter();
  const [rows, setRows] = useState<Transaction[]>(transactions);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [saveFeedback, setSaveFeedback] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync with server-rendered data after router.refresh()
  useEffect(() => {
    setRows(transactions);
  }, [transactions]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "todos" | "pendente" | "liquidado"
  >("todos");
  const [typeFilter, setTypeFilter] = useState<"todos" | "entrada" | "saida">(
    "todos",
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

  const PT_MONTHS = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  /** Convert UI date "05 Mar 2025" → "2025-03-05" for date inputs */
  const parseUiDateToIso = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split(" ");
    if (parts.length !== 3) return "";
    const day = parts[0].padStart(2, "0");
    const monthIndex = PT_MONTHS.indexOf(parts[1]);
    const year = parts[2];
    if (monthIndex === -1) return "";
    return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${day}`;
  };

  const formatAmountWithType = (value: string, type: Transaction["type"]) => {
    const formatted = formatCurrencyBRL(value);

    if (!formatted) {
      return "";
    }

    return `${type === "entrada" ? "+" : "-"} ${formatted}`;
  };

  const formatBillingLabel = (transaction: Transaction) => {
    if (
      transaction.recurrenceMode !== "recorrente" ||
      !transaction.billingDay
    ) {
      return "";
    }

    if (transaction.recurrenceFrequency === "semanal") {
      return `• ${transaction.billingDay}`;
    }

    if (transaction.recurrenceFrequency === "anual") {
      return `• ${transaction.billingDay}`;
    }

    return `• Dia ${transaction.billingDay}`;
  };

  const startEditing = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    // Optimistic removal
    setRows((prev) => prev.filter((item) => item.id !== pendingDeleteId));
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    setIsDeleting(false);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      router.refresh();
    } catch (err) {
      console.error(err);
      setRows(transactions);
    }
  };

  const handleSave = async (formState: TransactionFormState) => {
    if (!editingTransaction) return;
    const id = editingTransaction.id;

    // Optimistic update
    setRows((prev) =>
      prev.map((item) =>
        item.id === id
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
          : item,
      ),
    );
    setEditingTransaction(null);
    setSaveFeedback("Alterações salvas com sucesso.");
    window.setTimeout(() => setSaveFeedback(""), 3000);

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      if (!res.ok) throw new Error("update failed");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSettlement = async (id: string) => {
    // Optimistic toggle
    setRows((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextSettled = !item.isSettled;
        return {
          ...item,
          isSettled: nextSettled,
          paymentDate: nextSettled
            ? item.paymentDate || new Date().toISOString().split("T")[0]
            : "",
        };
      }),
    );

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("toggle failed");
      router.refresh();
    } catch (err) {
      console.error(err);
      // Revert on failure
      setRows(transactions);
    }
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

  const PT_MONTHS_NAMES = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  function exportToCsv() {
    const PT_MONTHS_MAP: Record<string, string> = {
      Jan: "01",
      Fev: "02",
      Mar: "03",
      Abr: "04",
      Mai: "05",
      Jun: "06",
      Jul: "07",
      Ago: "08",
      Set: "09",
      Out: "10",
      Nov: "11",
      Dez: "12",
    };
    const headers = [
      "Data",
      "Descrição",
      "Categoria",
      "Tipo",
      "Valor",
      "Status",
      "Data Pagamento",
      "Recorrência",
    ];
    const csvRows = filteredRows.map((tx) => {
      const parts = tx.date.split(" ");
      const isoDate =
        parts.length === 3
          ? `${parts[2]}-${PT_MONTHS_MAP[parts[1]] ?? "00"}-${parts[0].padStart(2, "0")}`
          : tx.date;
      const rawAmount = tx.amount
        .replace(/^[+\-]\s*/, "")
        .replace(/R\$\s*/, "")
        .trim();
      const tipo = tx.type === "entrada" ? "Entrada" : "Saída";
      const status = tx.isSettled ? "Liquidado" : "Pendente";
      const recorrencia =
        tx.recurrenceMode === "recorrente"
          ? `Recorrente (${tx.recurrenceKind === "fixa" ? "Fixa" : "Variável"})`
          : "Não recorrente";
      return [
        isoDate,
        `"${tx.description.replace(/"/g, '""')}"`,
        `"${tx.category.replace(/"/g, '""')}"`,
        tipo,
        rawAmount,
        status,
        tx.paymentDate ?? "",
        recorrencia,
      ].join(",");
    });
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lancamentos-${PT_MONTHS_NAMES[month]}-${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const editingFormState = useMemo<TransactionFormState>(() => {
    if (!editingTransaction) {
      return createDefaultTransactionFormState();
    }

    return {
      description: editingTransaction.description,
      category: editingTransaction.category,
      date: parseUiDateToIso(editingTransaction.date),
      amount: formatCurrencyBRL(editingTransaction.amount),
      type: editingTransaction.type,
      recurrenceMode: editingTransaction.recurrenceMode,
      recurrenceKind: editingTransaction.recurrenceKind ?? "fixa",
      recurrenceFrequency: editingTransaction.recurrenceFrequency ?? "mensal",
      billingDay: editingTransaction.billingDay ?? "",
      recurrenceEndDate: editingTransaction.recurrenceEndDate ?? "",
      isSettled: editingTransaction.isSettled,
      paymentDate:
        editingTransaction.paymentDate ??
        (editingTransaction.isSettled
          ? new Date().toISOString().split("T")[0]
          : ""),
    };
  }, [editingTransaction]);

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Lançamentos
            </h2>
            <p className="text-sm text-muted-foreground">
              Confira suas movimentações recentes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <MonthSelector year={year} month={month} />
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {filteredRows.length} de {rows.length} itens
            </span>
            <Button
              variant="outline"
              className="flex items-center gap-1.5 h-8 px-3 text-xs"
              onClick={exportToCsv}
              title="Exportar lançamentos filtrados como CSV"
            >
              <LucideIcon icon={Download} className="h-3.5 w-3.5" />
              Exportar CSV
            </Button>
          </div>
        </div>
        <div className="border-b border-border bg-muted/20 px-6 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:flex lg:items-center">
              <Input
                placeholder="Pesquisar por descrição ou categoria"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="sm:col-span-2 lg:max-w-sm"
              />
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "todos" | "pendente" | "liquidado",
                  )
                }
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:w-44"
              >
                <option value="todos">Todos os status</option>
                <option value="pendente">Pendentes</option>
                <option value="liquidado">Liquidados</option>
              </select>
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value as "todos" | "entrada" | "saida",
                  )
                }
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:w-36"
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
                    | "nao_recorrente",
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
        <div className="block md:hidden">
          <div className="space-y-4 px-6 py-4">
            {filteredRows.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                Nenhum lançamento encontrado com os filtros atuais.
              </p>
            ) : (
              filteredRows.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border bg-background p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        {item.categoryIcon ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-foreground">
                            <LucideIcon
                              icon={item.categoryIcon}
                              className="h-3 w-3"
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
                        {item.recurrenceFrequency === "mensal"
                          ? "Mensal"
                          : item.recurrenceFrequency === "semanal"
                            ? "Semanal"
                            : "Anual"}
                        {formatBillingLabel(item)}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
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
                    {!item.isVirtual && (
                      <button
                        type="button"
                        onClick={() => handleToggleSettlement(item.id)}
                        className="text-xs font-medium text-primary transition hover:text-primary/80"
                      >
                        {item.isSettled
                          ? "Marcar como pendente"
                          : item.type === "entrada"
                            ? "Marcar como recebido"
                            : "Marcar como pago"}
                      </button>
                    )}
                  </div>

                  {item.isSettled && item.paymentDate ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Pago em {item.paymentDate}
                    </p>
                  ) : null}

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {!item.isVirtual && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-border text-xs"
                          onClick={() => startEditing(item)}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-border text-xs text-rose-500 hover:bg-rose-500/10"
                          onClick={() => handleDelete(item.id)}
                        >
                          Excluir
                        </Button>
                      </>
                    )}
                    {item.isVirtual && (
                      <span className="col-span-2 text-center text-xs text-muted-foreground">
                        Recorrência projetada
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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
                          className={`text-left text-xs font-medium text-primary transition hover:text-primary/80 ${
                            item.isVirtual ? "hidden" : ""
                          }`}
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
                        {!item.isVirtual ? (
                          <>
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
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Projetada
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal
        isOpen={Boolean(editingTransaction)}
        dialogId="editar-lancamento"
        title="Editar lançamento"
        subtitle="Ajuste as informações do lançamento selecionado."
        submitLabel="Salvar alterações"
        initialState={editingFormState}
        onClose={() => setEditingTransaction(null)}
        onSubmit={handleSave}
      />

      <ConfirmModal
        isOpen={pendingDeleteId !== null}
        title="Excluir lançamento"
        message="Esta ação não pode ser desfeita. Tem certeza que deseja excluir este lançamento?"
        confirmLabel="Excluir"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </>
  );
};
