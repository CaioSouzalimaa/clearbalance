"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Download } from "lucide";
import { useToast } from "@/components/ui/toast";
import { LucideIcon } from "@/components/dashboard/sidebar";
import { iconOptions } from "@/lib/icon-options";
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
  categoryIconId?: string | null;
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
  const { toast } = useToast();
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

  type SortKey = "description" | "category" | "date" | "amount";
  type SortDir = "asc" | "desc";
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

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
    const id = pendingDeleteId;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      setRows((prev) => prev.filter((item) => item.id !== id));
      toast("Transação excluída.", "success");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast("Erro ao excluir transação.", "error");
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
    }
  };

  const handleSave = async (formState: TransactionFormState) => {
    if (!editingTransaction) return;
    const id = editingTransaction.id;
    const previousRows = rows;

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

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      if (!res.ok) throw new Error("update failed");
      toast("Alterações salvas com sucesso.", "success");
      router.refresh();
    } catch (err) {
      console.error(err);
      setRows(previousRows);
      toast("Erro ao salvar alterações.", "error");
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

    const filtered = rows.filter((item) => {
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

    if (!sortKey) return filtered;

    const PT_MONTH_IDX: Record<string, number> = {
      Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
      Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11,
    };

    const parseDate = (d: string) => {
      const [day, mon, year] = d.split(" ");
      return new Date(Number(year), PT_MONTH_IDX[mon] ?? 0, Number(day)).getTime();
    };

    const parseAmount = (a: string) => {
      const cleaned = a.replace(/[^0-9,]/g, "").replace(",", ".");
      return parseFloat(cleaned) || 0;
    };

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "description") cmp = a.description.localeCompare(b.description, "pt-BR");
      else if (sortKey === "category") cmp = a.category.localeCompare(b.category, "pt-BR");
      else if (sortKey === "date") cmp = parseDate(a.date) - parseDate(b.date);
      else if (sortKey === "amount") cmp = parseAmount(a.amount) - parseAmount(b.amount);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [recurrenceFilter, rows, searchTerm, statusFilter, typeFilter, sortKey, sortDir]);

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
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Lançamentos
            </h2>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
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
        <div className="border-b border-border bg-muted/20 px-3 py-2 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid flex-1 grid-cols-2 gap-2 sm:gap-3 lg:flex lg:items-center">
              <Input
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="col-span-2 lg:max-w-sm"
              />
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "todos" | "pendente" | "liquidado",
                  )
                }
                className="flex h-8 sm:h-10 w-full rounded-md border border-border bg-background px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:w-44"
              >
                <option value="todos">Status</option>
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
                className="flex h-8 sm:h-10 w-full rounded-md border border-border bg-background px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:w-36"
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
              className="flex h-8 sm:h-10 w-full rounded-md border border-border bg-background px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-52"
            >
              <option value="todos">Recorrências</option>
              <option value="nao_recorrente">Não recorrentes</option>
              <option value="recorrente">Recorrentes</option>
            </select>
          </div>
        </div>
        <div className="block md:hidden">
          <div className="space-y-2 px-3 py-2 sm:space-y-4 sm:px-6 sm:py-4">
            {filteredRows.length === 0 ? (
              <p className="text-center text-xs sm:text-sm text-muted-foreground">
                Nenhum lançamento encontrado com os filtros atuais.
              </p>
            ) : (
              filteredRows.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border bg-background p-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.description}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        {(() => {
                          const iconEntry = item.categoryIconId
                            ? iconOptions.find((o) => o.id === item.categoryIconId)
                            : null;
                          return iconEntry ? (
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                              <LucideIcon icon={iconEntry.icon} className="h-2.5 w-2.5" aria-hidden />
                            </span>
                          ) : null;
                        })()}
                        <span className="truncate">{item.category}</span>
                        <span className="shrink-0 text-muted-foreground/50">·</span>
                        <span className="shrink-0">{item.date}</span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold ${
                        item.type === "entrada"
                          ? "text-emerald-600"
                          : "text-rose-500"
                      }`}
                    >
                      {item.amount}
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
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
                    {item.recurrenceMode === "recorrente" && (
                      <span className="text-[10px] text-muted-foreground">
                        {item.recurrenceKind === "fixa" ? "Rec. fixa" : "Rec. var."}
                        {item.recurrenceFrequency ? (
                          <>{" · "}{item.recurrenceFrequency === "mensal" ? "Mensal" : item.recurrenceFrequency === "semanal" ? "Semanal" : "Anual"}{formatBillingLabel(item)}</>
                        ) : null}
                      </span>
                    )}
                    {!item.isVirtual && (
                      <button
                        type="button"
                        onClick={() => handleToggleSettlement(item.id)}
                        className="ml-auto text-[10px] font-medium text-primary transition hover:text-primary/80"
                      >
                        {item.isSettled
                          ? "Marcar pendente"
                          : item.type === "entrada"
                            ? "Marcar recebido"
                            : "Marcar pago"}
                      </button>
                    )}
                  </div>

                  {item.isSettled && item.paymentDate ? (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Pago em {item.paymentDate}
                    </p>
                  ) : null}

                  <div className="mt-2 flex gap-2">
                    {!item.isVirtual && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7 flex-1 border-border text-[10px]"
                          onClick={() => startEditing(item)}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7 flex-1 border-border text-[10px] text-rose-500 hover:bg-rose-500/10"
                          onClick={() => handleDelete(item.id)}
                        >
                          Excluir
                        </Button>
                      </>
                    )}
                    {item.isVirtual && (
                      <span className="w-full text-center text-[10px] text-muted-foreground">
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
                <th className="px-6 py-3 font-semibold">
                  <button type="button" onClick={() => handleSort("description")} className="inline-flex items-center gap-1 hover:text-foreground transition">
                    Descrição
                    {sortKey === "description" ? (sortDir === "asc" ? <LucideIcon icon={ChevronUp} className="h-3.5 w-3.5" /> : <LucideIcon icon={ChevronDown} className="h-3.5 w-3.5" />) : <LucideIcon icon={ChevronUp} className="h-3.5 w-3.5 opacity-20" />}
                  </button>
                </th>
                <th className="px-6 py-3 font-semibold">
                  <button type="button" onClick={() => handleSort("category")} className="inline-flex items-center gap-1 hover:text-foreground transition">
                    Categoria
                    {sortKey === "category" ? (sortDir === "asc" ? <LucideIcon icon={ChevronUp} className="h-3.5 w-3.5" /> : <LucideIcon icon={ChevronDown} className="h-3.5 w-3.5" />) : <LucideIcon icon={ChevronUp} className="h-3.5 w-3.5 opacity-20" />}
                  </button>
                </th>
                <th className="px-6 py-3 font-semibold">
                  <button type="button" onClick={() => handleSort("date")} className="inline-flex items-center gap-1 hover:text-foreground transition">
                    Data
                    {sortKey === "date" ? (sortDir === "asc" ? <LucideIcon icon={ChevronUp} className="h-3.5 w-3.5" /> : <LucideIcon icon={ChevronDown} className="h-3.5 w-3.5" />) : <LucideIcon icon={ChevronUp} className="h-3.5 w-3.5 opacity-20" />}
                  </button>
                </th>
                <th className="px-6 py-3 font-semibold">Recorrência</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">
                  <button type="button" onClick={() => handleSort("amount")} className="inline-flex items-center gap-1 hover:text-foreground transition ml-auto">
                    Valor
                    {sortKey === "amount" ? (sortDir === "asc" ? <LucideIcon icon={ChevronUp} className="h-3.5 w-3.5" /> : <LucideIcon icon={ChevronDown} className="h-3.5 w-3.5" />) : <LucideIcon icon={ChevronUp} className="h-3.5 w-3.5 opacity-20" />}
                  </button>
                </th>
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
                        {(() => {
                          const iconEntry = item.categoryIconId
                            ? iconOptions.find((o) => o.id === item.categoryIconId)
                            : null;
                          return iconEntry ? (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground">
                              <LucideIcon icon={iconEntry.icon} className="h-4 w-4" aria-hidden />
                            </span>
                          ) : null;
                        })()}
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
