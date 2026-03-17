"use client";

import { useState } from "react";
import { Bookmark, X } from "lucide";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LucideIcon } from "@/components/dashboard/sidebar";

export interface FilterState {
  search: string;
  status: "todos" | "pendente" | "liquidado";
  type: "todos" | "entrada" | "saida";
  recurrence: "todos" | "recorrente" | "nao_recorrente";
}

type SavedFilter = FilterState & { name: string };
const STORAGE_KEY = "clearbalance_saved_filters";

interface TransactionsFilterBarProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
}

export function TransactionsFilterBar({ value, onChange }: TransactionsFilterBarProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  });
  const [savingFilterName, setSavingFilterName] = useState("");
  const [isSavingFilter, setIsSavingFilter] = useState(false);

  const persistFilters = (next: SavedFilter[]) => {
    setSavedFilters(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const applyFilter = (f: SavedFilter) => {
    onChange({ search: f.search, status: f.status, type: f.type, recurrence: f.recurrence });
  };

  const saveCurrentFilter = () => {
    const name = savingFilterName.trim();
    if (!name) return;
    const f: SavedFilter = { name, ...value };
    persistFilters([...savedFilters.filter((s) => s.name !== name), f]);
    setSavingFilterName("");
    setIsSavingFilter(false);
  };

  const deleteFilter = (name: string) =>
    persistFilters(savedFilters.filter((s) => s.name !== name));

  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="border-b border-border bg-muted/20 px-3 py-2 sm:px-6 sm:py-4">
      {/* Saved filter chips */}
      {savedFilters.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {savedFilters.map((f) => (
            <div
              key={f.name}
              className="flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm"
            >
              <button
                type="button"
                onClick={() => applyFilter(f)}
                className="hover:text-primary transition-colors"
              >
                <LucideIcon
                  icon={Bookmark}
                  className="mr-1 inline h-3 w-3 text-primary"
                  aria-hidden
                />
                {f.name}
              </button>
              <button
                type="button"
                aria-label={`Remover filtro ${f.name}`}
                onClick={() => deleteFilter(f.name)}
                className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/20 transition-colors"
              >
                <LucideIcon icon={X} className="h-2.5 w-2.5" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid flex-1 grid-cols-2 gap-2 sm:gap-3 lg:flex lg:items-center">
          <Input
            placeholder="Pesquisar..."
            value={value.search}
            onChange={(e) => set("search", e.target.value)}
            className="col-span-2 lg:max-w-sm"
          />
          <select
            value={value.status}
            onChange={(e) =>
              set("status", e.target.value as FilterState["status"])
            }
            className="flex h-8 sm:h-10 w-full rounded-md border border-border bg-background px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:w-44"
          >
            <option value="todos">Status</option>
            <option value="pendente">Pendentes</option>
            <option value="liquidado">Liquidados</option>
          </select>
          <select
            value={value.type}
            onChange={(e) =>
              set("type", e.target.value as FilterState["type"])
            }
            className="flex h-8 sm:h-10 w-full rounded-md border border-border bg-background px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:w-36"
          >
            <option value="todos">Todos os tipos</option>
            <option value="entrada">Entradas</option>
            <option value="saida">Saídas</option>
          </select>
        </div>
        <select
          value={value.recurrence}
          onChange={(e) =>
            set("recurrence", e.target.value as FilterState["recurrence"])
          }
          className="flex h-8 sm:h-10 w-full rounded-md border border-border bg-background px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-52"
        >
          <option value="todos">Recorrências</option>
          <option value="nao_recorrente">Não recorrentes</option>
          <option value="recorrente">Recorrentes</option>
        </select>

        {/* Save filter */}
        {isSavingFilter ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <Input
              autoFocus
              placeholder="Nome do filtro…"
              value={savingFilterName}
              onChange={(e) => setSavingFilterName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveCurrentFilter();
                if (e.key === "Escape") {
                  setIsSavingFilter(false);
                  setSavingFilterName("");
                }
              }}
              className="h-8 w-36 text-xs"
            />
            <Button
              type="button"
              className="h-8 px-3 text-xs"
              onClick={saveCurrentFilter}
              disabled={!savingFilterName.trim()}
            >
              Salvar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-8 px-2 text-xs"
              onClick={() => {
                setIsSavingFilter(false);
                setSavingFilterName("");
              }}
            >
              <LucideIcon icon={X} className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="shrink-0 flex items-center gap-1.5 h-8 px-3 text-xs"
            onClick={() => setIsSavingFilter(true)}
            title="Salvar filtro atual"
          >
            <LucideIcon icon={Bookmark} className="h-3.5 w-3.5" aria-hidden />
            Salvar filtro
          </Button>
        )}
      </div>
    </div>
  );
}
