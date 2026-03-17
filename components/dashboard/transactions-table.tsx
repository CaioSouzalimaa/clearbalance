"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Download, Upload } from "lucide";
import { useToast } from "@/components/ui/toast";
import { LucideIcon } from "@/components/dashboard/sidebar";
import { formatBRLInputFromString, formatDecimalInputFromString } from "@/lib/formatting";
import { PT_MONTHS_SHORT, parseShortDateToIso } from "@/lib/date-utils";
import { EmptyState } from "@/components/ui/empty-state";
import { iconOptions } from "@/lib/icon-options";
import {
  TransactionModal,
  TransactionFormState,
  createDefaultTransactionFormState,
} from "@/components/dashboard/transaction-modal";
import { ConfirmModal } from "@/components/dashboard/confirm-modal";
import { MonthSelector } from "@/components/dashboard/month-selector";
import {
  TransactionsFilterBar,
  FilterState,
} from "@/components/dashboard/transactions-filter-bar";
import { TransactionsOFXModal } from "@/components/dashboard/transactions-ofx-modal";

interface Transaction {
  id: string;
  description: string;
  category: string;
  categoryIconId?: string | null;
  categoryColor?: string | null;
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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOfxModalOpen, setIsOfxModalOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "todos",
    type: "todos",
    recurrence: "todos",
  });

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

  useEffect(() => {
    setRows(transactions);
  }, [transactions]);

  const formatAmountWithType = (value: string, type: Transaction["type"]) => {
    const formatted = formatBRLInputFromString(value);
    if (!formatted) return "";
    return `${type === "entrada" ? "+" : "-"} ${formatted}`;
  };

  const formatBillingLabel = (transaction: Transaction) => {
    if (transaction.recurrenceMode !== "recorrente" || !transaction.billingDay) return "";
    if (transaction.recurrenceFrequency === "semanal" || transaction.recurrenceFrequency === "anual") {
      return `• ${transaction.billingDay}`;
    }
    return `• Dia ${transaction.billingDay}`;
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
              recurrenceKind: formState.recurrenceMode === "recorrente" ? formState.recurrenceKind : undefined,
              recurrenceFrequency: formState.recurrenceMode === "recorrente" ? formState.recurrenceFrequency : undefined,
              billingDay: formState.recurrenceMode === "recorrente" ? formState.billingDay : undefined,
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
    setRows((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextSettled = !item.isSettled;
        return {
          ...item,
          isSettled: nextSettled,
          paymentDate: nextSettled ? item.paymentDate || new Date().toISOString().split("T")[0] : "",
        };
      }),
    );
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("toggle failed");
      router.refresh();
    } catch (err) {
      console.error(err);
      setRows(transactions);
    }
  };

  const filteredRows = useMemo(() => {
    const { search, status, type, recurrence } = filters;
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = rows.filter((item) => {
      const matchesSearch = normalizedSearch
        ? `${item.description} ${item.category}`.toLowerCase().includes(normalizedSearch)
        : true;
      const matchesStatus =
        status === "todos" ? true : status === "liquidado" ? item.isSettled : !item.isSettled;
      const matchesType = type === "todos" ? true : item.type === type;
      const matchesRecurrence = recurrence === "todos" ? true : item.recurrenceMode === recurrence;
      return matchesSearch && matchesStatus && matchesType && matchesRecurrence;
    });
    if (!sortKey) return filtered;
    const PT_MONTH_IDX: Record<string, number> = {
      Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
      Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11,
    };
    const parseDate = (d: string) => {
      const [day, mon, yr] = d.split(" ");
      return new Date(Number(yr), PT_MONTH_IDX[mon] ?? 0, Number(day)).getTime();
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
  }, [filters, rows, sortKey, sortDir]);

  function exportToCsv() {
    const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor", "Status", "Data Pagamento", "Recorrência"];
    const csvRows = filteredRows.map((tx) => {
      const parts = tx.date.split(" ");
      const isoDate =
        parts.length === 3
          ? `${parts[2]}-${String(PT_MONTHS_SHORT.indexOf(parts[1]) + 1).padStart(2, "0")}-${parts[0].padStart(2, "0")}`
          : tx.date;
      const rawAmount = tx.amount.replace(/^[+\-]\s*/, "").replace(/R\$\s*/, "").trim();
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
        tipo, rawAmount, status, tx.paymentDate ?? "", recorrencia,
      ].join(",");
    });
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lancamentos-${PT_MONTHS_SHORT[month]}-${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const editingFormState = useMemo<TransactionFormState>(() => {
    if (!editingTransaction) return createDefaultTransactionFormState();
    return {
      description: editingTransaction.description,
      category: editingTransaction.category,
      date: parseShortDateToIso(editingTransaction.date),
      amount: formatDecimalInputFromString(editingTransaction.amount),
      type: editingTransaction.type,
      recurrenceMode: editingTransaction.recurrenceMode,
      recurrenceKind: editingTransaction.recurrenceKind ?? "fixa",
      recurrenceFrequency: editingTransaction.recurrenceFrequency ?? "mensal",
      billingDay: editingTransaction.billingDay ?? "",
      recurrenceEndDate: editingTransaction.recurrenceEndDate ?? "",
      isSettled: editingTransaction.isSettled,
      paymentDate:
        editingTransaction.paymentDate ??
        (editingTransaction.isSettled ? new Date().toISOString().split("T")[0] : ""),
    };
  }, [editingTransaction]);

  return (
    <>
      <TransactionsOFXModal
        isOpen={isOfxModalOpen}
        onClose={() => setIsOfxModalOpen(false)}
        onImportSuccess={() => router.refresh()}
      />

      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Lançamentos</h2>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Confira suas movimentações recentes.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <MonthSelector year={year} month={month} />
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {filteredRows.length} de {rows.length} itens
            </span>
            <Button variant="outline" className="flex items-center gap-1.5 h-8 px-3 text-xs" onClick={exportToCsv} title="Exportar lançamentos filtrados como CSV">
              <LucideIcon icon={Download} className="h-3.5 w-3.5" />
              Exportar CSV
            </Button>
            <Button variant="outline" className="flex items-center gap-1.5 h-8 px-3 text-xs" onClick={() => setIsOfxModalOpen(true)} title="Importar extrato bancário OFX">
              <LucideIcon icon={Upload} className="h-3.5 w-3.5" />
              Importar OFX
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <TransactionsFilterBar value={filters} onChange={setFilters} />

        {/* Mobile cards */}
        <div className="block md:hidden">
          <div className="space-y-2 px-3 py-2 sm:space-y-4 sm:px-6 sm:py-4">
            {filteredRows.length === 0 ? (
              <EmptyState message="Nenhum lançamento encontrado com os filtros atuais." />
            ) : (
              filteredRows.map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-background p-2.5 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">{item.description}</p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        {(() => {
                          const iconEntry = item.categoryIconId ? iconOptions.find((o) => o.id === item.categoryIconId) : null;
                          return iconEntry ? (
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${item.categoryColor ? "text-white" : "bg-muted text-foreground"}`} style={item.categoryColor ? { backgroundColor: item.categoryColor } : undefined}>
                              <LucideIcon icon={iconEntry.icon} className="h-2.5 w-2.5" aria-hidden />
                            </span>
                          ) : null;
                        })()}
                        <span className="truncate">{item.category}</span>
                        <span className="shrink-0 text-muted-foreground/50">·</span>
                        <span className="shrink-0">{item.date}</span>
                      </div>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold ${item.type === "entrada" ? "text-emerald-600" : "text-rose-500"}`}>
                      {item.amount}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.isSettled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.isSettled ? (item.type === "entrada" ? "Recebido" : "Pago") : "Pendente"}
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
                      <button type="button" onClick={() => handleToggleSettlement(item.id)} className="ml-auto text-[10px] font-medium text-primary transition hover:text-primary/80">
                        {item.isSettled ? "Marcar pendente" : item.type === "entrada" ? "Marcar recebido" : "Marcar pago"}
                      </button>
                    )}
                  </div>
                  {item.isSettled && item.paymentDate ? (
                    <p className="mt-1 text-[10px] text-muted-foreground">Pago em {item.paymentDate}</p>
                  ) : null}
                  <div className="mt-2 flex gap-2">
                    {!item.isVirtual ? (
                      <>
                        <Button type="button" variant="outline" className="h-7 flex-1 border-border text-[10px]" onClick={() => setEditingTransaction(item)}>Editar</Button>
                        <Button type="button" variant="outline" className="h-7 flex-1 border-border text-[10px] text-rose-500 hover:bg-rose-500/10" onClick={() => setPendingDeleteId(item.id)}>Excluir</Button>
                      </>
                    ) : (
                      <span className="w-full text-center text-[10px] text-muted-foreground">Recorrência projetada</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Desktop table */}
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
                  <td colSpan={7} className="px-6 py-2 text-center">
                    <EmptyState message="Nenhum lançamento encontrado com os filtros atuais." />
                  </td>
                </tr>
              ) : (
                filteredRows.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-6 py-4 font-medium text-foreground">{item.description}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const iconEntry = item.categoryIconId ? iconOptions.find((o) => o.id === item.categoryIconId) : null;
                          return iconEntry ? (
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${item.categoryColor ? "text-white" : "bg-muted text-foreground"}`} style={item.categoryColor ? { backgroundColor: item.categoryColor } : undefined}>
                              <LucideIcon icon={iconEntry.icon} className="h-4 w-4" aria-hidden />
                            </span>
                          ) : null;
                        })()}
                        <span>{item.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{item.date}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {item.recurrenceMode === "recorrente"
                            ? item.recurrenceKind === "fixa" ? "Recorrente fixa" : "Recorrente variável"
                            : "Não recorrente"}
                        </span>
                        {item.recurrenceMode === "recorrente" && item.recurrenceFrequency ? (
                          <span className="text-xs text-muted-foreground">
                            {item.recurrenceFrequency === "mensal" ? "Mensal" : item.recurrenceFrequency === "semanal" ? "Semanal" : "Anual"}
                            {formatBillingLabel(item)}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${item.isSettled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {item.isSettled ? (item.type === "entrada" ? "Recebido" : "Pago") : "Pendente"}
                        </span>
                        {item.isSettled && item.paymentDate ? (
                          <span className="text-xs text-muted-foreground">Pago em {item.paymentDate}</span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleToggleSettlement(item.id)}
                          className={`text-left text-xs font-medium text-primary transition hover:text-primary/80 ${item.isVirtual ? "hidden" : ""}`}
                        >
                          {item.isSettled ? "Marcar como pendente" : item.type === "entrada" ? "Marcar como recebido" : "Marcar como pago"}
                        </button>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${item.type === "entrada" ? "text-emerald-600" : "text-rose-500"}`}>
                      {item.amount}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {!item.isVirtual ? (
                          <>
                            <Button type="button" variant="outline" className="border-border px-3 py-1 text-xs" onClick={() => setEditingTransaction(item)}>Editar</Button>
                            <Button type="button" variant="outline" className="border-border px-3 py-1 text-xs text-rose-500 hover:bg-rose-500/10" onClick={() => setPendingDeleteId(item.id)}>Excluir</Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Projetada</span>
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