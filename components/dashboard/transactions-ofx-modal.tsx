"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide";

import { Button } from "@/components/ui/button";
import { LucideIcon } from "@/components/dashboard/sidebar";
import { useToast } from "@/components/ui/toast";

type PreviewRow = {
  date: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  suggestedCategory: string;
  categoryId: string | null;
};

type AvailableCategory = { id: string; name: string };

interface TransactionsOFXModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export function TransactionsOFXModal({
  isOpen,
  onClose,
  onImportSuccess,
}: TransactionsOFXModalProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [ofxFile, setOfxFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const ofxInputRef = React.useRef<HTMLInputElement>(null);

  const [ofxStep, setOfxStep] = useState<1 | 2>(1);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [availableCategories, setAvailableCategories] = useState<AvailableCategory[]>([]);
  const [categorySelections, setCategorySelections] = useState<Record<number, string>>({});

  function close() {
    setOfxFile(null);
    setOfxStep(1);
    setPreviewRows([]);
    setCategorySelections({});
    onClose();
  }

  const handleOfxPreview = async () => {
    if (!ofxFile) return;
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", ofxFile);
      const res = await fetch("/api/transactions/preview-ofx", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast((data as { error?: string }).error ?? "Erro ao processar arquivo.", "error");
        return;
      }
      const rows = (data as { transactions: PreviewRow[] }).transactions;
      if (rows.length === 0) {
        toast("Nenhuma transação encontrada no arquivo.", "error");
        return;
      }

      const catRes = await fetch("/api/categories");
      const catData = await catRes.json().catch(() => ({ categories: [] }));
      const cats: AvailableCategory[] = (
        catData as { categories?: AvailableCategory[] }
      ).categories ?? [];
      setAvailableCategories(cats);

      const defaults: Record<number, string> = {};
      rows.forEach((r, i) => {
        const matched = cats.find((c: AvailableCategory) =>
          r.categoryId ? c.id === r.categoryId : c.name === r.suggestedCategory,
        );
        defaults[i] = matched?.id ?? cats[0]?.id ?? "";
      });
      setCategorySelections(defaults);
      setPreviewRows(rows);
      setOfxStep(2);
    } catch {
      toast("Erro ao processar arquivo OFX.", "error");
    } finally {
      setIsImporting(false);
    }
  };

  const handleOfxImport = async () => {
    setIsImporting(true);
    try {
      const transactions = previewRows.map((r, i) => ({
        date: r.date,
        description: r.description,
        amount: r.amount,
        type: r.type,
        categoryId: categorySelections[i] ?? (availableCategories[0]?.id ?? ""),
      }));
      const res = await fetch("/api/transactions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast((data as { error?: string }).error ?? "Erro ao importar.", "error");
        return;
      }
      const count = (data as { imported?: number }).imported ?? 0;
      toast(
        `${count} lançamento${count !== 1 ? "s" : ""} importado${count !== 1 ? "s" : ""} com sucesso.`,
        "success",
      );
      close();
      onImportSuccess();
      router.refresh();
    } catch {
      toast("Erro ao importar lançamentos.", "error");
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ofx-modal-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
    >
      {/* Step 1 — file picker */}
      {ofxStep === 1 && (
        <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-lg">
          <h2
            id="ofx-modal-title"
            className="text-base sm:text-lg font-semibold text-foreground"
          >
            Importar extrato OFX
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Selecione um arquivo .ofx ou .qfx exportado pelo seu banco. Você
            poderá revisar e ajustar as categorias antes de importar.
          </p>

          <div
            className="mt-4 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 cursor-pointer hover:bg-muted/50 transition"
            onClick={() => ofxInputRef.current?.click()}
          >
            <LucideIcon
              icon={Upload}
              className="h-8 w-8 text-muted-foreground"
              aria-hidden
            />
            {ofxFile ? (
              <p className="text-sm font-medium text-foreground">
                {ofxFile.name}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Clique para selecionar um arquivo
              </p>
            )}
            <input
              ref={ofxInputRef}
              type="file"
              accept=".ofx,.qfx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setOfxFile(f);
                e.target.value = "";
              }}
            />
          </div>

          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 text-xs sm:text-sm"
              onClick={close}
              disabled={isImporting}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 text-xs sm:text-sm"
              onClick={handleOfxPreview}
              disabled={!ofxFile || isImporting}
            >
              {isImporting ? "Processando…" : "Próximo →"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — preview + category selects */}
      {ofxStep === 2 && (
        <div className="w-full max-w-3xl rounded-xl bg-background p-6 shadow-lg flex flex-col gap-4 max-h-[90vh]">
          <div>
            <h2
              id="ofx-modal-title"
              className="text-base sm:text-lg font-semibold text-foreground"
            >
              Revisar lançamentos ({previewRows.length})
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Ajuste as categorias antes de importar.
            </p>
          </div>

          <div className="overflow-y-auto flex-1 -mx-1 px-1">
            <table className="w-full text-xs sm:text-sm">
              <thead className="sticky top-0 bg-background z-10">
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="pb-2 font-medium pr-3">Data</th>
                  <th className="pb-2 font-medium pr-3">Descrição</th>
                  <th className="pb-2 font-medium text-right pr-3">Valor</th>
                  <th className="pb-2 font-medium">Categoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {previewRows.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="py-2 pr-3 whitespace-nowrap">{row.date}</td>
                    <td className="py-2 pr-3 max-w-50 truncate">
                      {row.description}
                    </td>
                    <td
                      className={`py-2 pr-3 text-right tabular-nums font-medium whitespace-nowrap ${
                        row.type === "INCOME"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {row.type === "INCOME" ? "+" : "-"} R${" "}
                      {row.amount.toFixed(2).replace(".", ",")}
                    </td>
                    <td className="py-2">
                      <select
                        value={categorySelections[i] ?? ""}
                        onChange={(e) =>
                          setCategorySelections((prev) => ({
                            ...prev,
                            [i]: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {availableCategories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 pt-2 border-t border-border">
            <Button
              variant="outline"
              className="flex-1 text-xs sm:text-sm"
              onClick={() => setOfxStep(1)}
              disabled={isImporting}
            >
              ← Voltar
            </Button>
            <Button
              className="flex-1 text-xs sm:text-sm"
              onClick={handleOfxImport}
              disabled={isImporting || previewRows.length === 0}
            >
              {isImporting
                ? "Importando…"
                : `Confirmar e importar ${previewRows.length} lançamento${previewRows.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
