"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpZA, Plus, Search } from "lucide";

import { iconOptions, resolveIcon } from "@/lib/icon-options";
import { ConfirmModal } from "@/components/dashboard/confirm-modal";
import { LucideIcon } from "@/components/dashboard/sidebar";
import { SidebarShell } from "@/components/dashboard/sidebar-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";

type CategoryType = "INCOME" | "EXPENSE" | "BOTH";

interface Category {
  id: string;
  name: string;
  iconId: string | null;
  color: string | null;
  type: CategoryType;
  transactionCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  /* ── modal state ── */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formIconId, setFormIconId] = useState(iconOptions[0].id);
  const [formColor, setFormColor] = useState("#6366f1");
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [iconSearch, setIconSearch] = useState("");

  /* ── category search ── */
  const [categorySearch, setCategorySearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  /* ── FAB ── */
  const [showFab, setShowFab] = useState(false);

  /* ── delete ── */
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredIcons = useMemo(() => {
    const q = iconSearch.toLowerCase().trim();
    if (!q) return iconOptions;
    return iconOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [iconSearch]);

  const filteredCategories = useMemo(() => {
    const q = categorySearch.toLowerCase().trim();
    const base = q ? categories.filter((c) => c.name.toLowerCase().includes(q)) : categories;
    return [...base].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
      return sortAsc ? cmp : -cmp;
    });
  }, [categories, categorySearch, sortAsc]);

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        setCategories(await res.json());
      } else {
        toast("Erro ao carregar categorias.", "error");
      }
    } catch {
      toast("Erro ao carregar categorias.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const onScroll = () => setShowFab(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── open / close modal ── */
  const openCreate = () => {
    setEditingId(null);
    setFormName("");
    setFormIconId(iconOptions[0].id);
    setFormColor("#6366f1");
    setFormType("EXPENSE");
    setFormError("");
    setIconSearch("");
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormIconId(cat.iconId ?? iconOptions[0].id);
    setFormColor(cat.color ?? "#6366f1");
    setFormType(cat.type === "BOTH" ? "EXPENSE" : cat.type);
    setFormError("");
    setIconSearch("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormName("");
    setFormIconId(iconOptions[0].id);
    setFormColor("#6366f1");
    setFormType("EXPENSE");
    setFormError("");
    setIconSearch("");
  };

  const showFeedback = (msg: string, type: "success" | "error" = "success") =>
    toast(msg, type);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = formName.trim();
    if (!name) {
      setFormError("Informe um nome.");
      return;
    }
    setIsSaving(true);
    setFormError("");
    try {
      const url = editingId
        ? `/api/categories/${editingId}`
        : "/api/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, iconId: formIconId, color: formColor, type: formType }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError((data as { error?: string })?.error ?? "Erro ao salvar.");
        return;
      }
      const saved: Category = await res.json();
      if (editingId) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? saved : c)),
        );
        showFeedback("Categoria atualizada com sucesso.", "success");
      } else {
        setCategories((prev) => [...prev, saved]);
        showFeedback("Categoria criada com sucesso.", "success");
      }
      closeModal();
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/${pendingDeleteId}`, {
        method: "DELETE",
      });
      if (res.ok || res.status === 204) {
        setCategories((prev) => prev.filter((c) => c.id !== pendingDeleteId));
        showFeedback("Categoria excluída.", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        showFeedback(
          (data as { error?: string })?.error ?? "Erro ao excluir.",
          "error",
        );
      }
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
    }
  };

  const isGoalsCategory =
    editingId !== null &&
    categories.find((c) => c.id === editingId)?.name === "Metas";

  const pendingDeleteName =
    categories.find((c) => c.id === pendingDeleteId)?.name ?? "";

  const selectedIconOption = iconOptions.find((o) => o.id === formIconId);
  const modalTitle = editingId ? "Editar categoria" : "Nova categoria";
  const modalSubtitle = editingId
    ? "Altere o nome, tipo ou ícone da categoria."
    : "Defina um nome, tipo e escolha um ícone.";
  const submitLabel = isSaving
    ? "Salvando…"
    : editingId
      ? "Salvar alterações"
      : "Criar categoria";

  return (
    <SidebarShell>
      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!pendingDeleteId}
        title="Excluir categoria"
        message={`Tem certeza que deseja excluir "${pendingDeleteName}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />

      {/* ── Create/Edit Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-modal-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              closeModal();
            }
          }}
        >
          <div className="relative w-full max-w-lg overflow-hidden rounded-xl bg-background shadow-lg max-h-[90vh]">
            {/* close button */}
            <button
              type="button"
              onClick={closeModal}
              disabled={isSaving}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              aria-label="Fechar modal"
            >
              ×
            </button>

            <div className="modal-scroll overflow-y-auto p-4 sm:p-6 max-h-[90vh]">
              <div>
                <h2
                  id="category-modal-title"
                  className="text-base sm:text-lg font-semibold text-foreground"
                >
                  {modalTitle}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{modalSubtitle}</p>
              </div>

              <div className="relative py-4 sm:py-5">
                {isSaving && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/80 backdrop-blur-sm">
                    <Spinner className="h-8 w-8 text-primary" />
                    <p className="text-sm font-medium text-foreground">
                      Salvando categoria…
                    </p>
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {formError && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
                      {formError}
                    </div>
                  )}

                  {isGoalsCategory && (
                    <div className="flex items-start gap-2 rounded-lg border border-border px-3 py-2.5 text-xs text-muted-foreground">
                      <span className="mt-0.5 shrink-0">⚠️</span>
                      <p>
                        Esta é a <strong>categoria de metas</strong>. Ela é
                        gerenciada automaticamente pelo sistema — apenas o ícone
                        pode ser alterado.
                      </p>
                    </div>
                  )}

                  {/* Type toggle */}
                  {!isGoalsCategory && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-foreground">
                        Tipo
                      </span>
                      <div className="flex rounded-lg border border-border bg-muted/30 p-1">
                        <button
                          type="button"
                          onClick={() => setFormType("INCOME")}
                          className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                            formType === "INCOME"
                              ? "bg-emerald-500 text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Entrada
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormType("EXPENSE")}
                          className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                            formType === "EXPENSE"
                              ? "bg-rose-500 text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Saída
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Name */}
                  {!isGoalsCategory && (
                    <div className="space-y-2">
                      <label
                        htmlFor="categoria-nome"
                        className="text-xs sm:text-sm font-medium text-foreground"
                      >
                        Nome da categoria
                      </label>
                      <Input
                        id="categoria-nome"
                        name="categoria-nome"
                        placeholder="Ex.: Saúde, Educação"
                        value={formName}
                        disabled={isSaving}
                        onChange={(e) => {
                          setFormName(e.target.value);
                          setFormError("");
                        }}
                      />
                    </div>
                  )}

                  {/* Color */}
                  <div className="space-y-2">
                    <label
                      htmlFor="categoria-cor"
                      className="text-xs sm:text-sm font-medium text-foreground"
                    >
                      Cor
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="categoria-cor"
                        type="color"
                        value={formColor}
                        disabled={isSaving}
                        onChange={(e) => setFormColor(e.target.value)}
                        className="h-9 w-16 cursor-pointer rounded-md border border-border bg-background p-1 disabled:pointer-events-none disabled:opacity-50"
                        aria-label="Cor da categoria"
                      />
                      <span className="text-xs text-muted-foreground">{formColor}</span>
                    </div>
                  </div>

                  {/* Icon picker */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Ícone
                      </span>
                      {selectedIconOption && (
                        <span className="flex items-center gap-1.5 text-xs text-primary">
                          <LucideIcon
                            icon={selectedIconOption.icon}
                            className="h-3.5 w-3.5"
                            aria-hidden
                          />
                          {selectedIconOption.label}
                        </span>
                      )}
                    </div>
                    <Input
                      placeholder="Buscar ícone… (ex.: casa, saúde)"
                      value={iconSearch}
                      disabled={isSaving}
                      onChange={(e) => setIconSearch(e.target.value)}
                      className="h-9 text-xs sm:text-sm"
                    />
                    <div className="max-h-40 sm:max-h-48 overflow-y-auto rounded-lg border border-border p-2">
                      {filteredIcons.length === 0 ? (
                        <p className="py-4 text-center text-xs text-muted-foreground">
                          Nenhum ícone encontrado.
                        </p>
                      ) : (
                        <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                          {filteredIcons.map((option) => {
                            const isSelected = formIconId === option.id;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                title={option.label}
                                disabled={isSaving}
                                onClick={() => setFormIconId(option.id)}
                                className={`flex aspect-square w-full items-center justify-center rounded-lg border transition ${
                                  isSelected
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                                }`}
                                aria-pressed={isSelected}
                                aria-label={option.label}
                              >
                                <LucideIcon
                                  icon={option.icon}
                                  className="h-4 w-4"
                                  aria-hidden
                                />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 text-xs sm:text-sm"
                      onClick={closeModal}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1 text-xs sm:text-sm" disabled={isSaving}>
                      {submitLabel}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Content ── */}
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Personalize sua organização
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            Categorias
          </h1>
        </div>
        <Button onClick={openCreate} className="shrink-0 gap-1.5 text-xs sm:text-sm">
          <LucideIcon icon={Plus} className="h-4 w-4" aria-hidden />
          Nova categoria
        </Button>
      </header>

      <div className="rounded-xl sm:rounded-2xl border border-border bg-surface p-3 sm:p-6 shadow-sm">
        {/* Search + Sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              <LucideIcon icon={Search} className="h-4 w-4" aria-hidden />
            </span>
            <Input
              placeholder="Buscar categorias…"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="h-9 pl-9 text-xs sm:text-sm"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            aria-label={sortAsc ? "Ordem Z→A" : "Ordem A→Z"}
            onClick={() => setSortAsc((v) => !v)}
            className="h-9 w-9 shrink-0 px-0"
          >
            <LucideIcon
              icon={sortAsc ? ArrowDownAZ : ArrowUpZA}
              className="h-4 w-4"
              aria-hidden
            />
          </Button>
        </div>

        {/* Category list */}
        <div className="mt-4 space-y-2">
          {isLoading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 sm:px-4 sm:py-3"
                >
                  <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Skeleton className="h-4 w-24 sm:w-32" />
                    <Skeleton className="h-3 w-16 sm:w-20" />
                  </div>
                  <Skeleton className="h-7 w-14 rounded-md" />
                </div>
              ))}
            </>
          ) : filteredCategories.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {categorySearch
                ? "Nenhuma categoria encontrada."
                : "Nenhuma categoria. Crie a primeira!"}
            </p>
          ) : (
            filteredCategories.map((category) => {
              const Icon = resolveIcon(category.iconId);
              return (
                <div
                  key={category.id}
                  className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 sm:px-4 sm:py-3"
                >
                  {/* Icon */}
                  <span
                    className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: category.color ?? "var(--color-muted)" }}
                  >
                    <LucideIcon
                      icon={Icon}
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      aria-hidden
                    />
                  </span>

                  {/* Name + badge + count */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {category.name}
                      </p>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold leading-none ${
                          category.type === "INCOME"
                            ? "border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                            : category.type === "EXPENSE"
                              ? "border-rose-500 text-rose-600 dark:border-rose-400 dark:text-rose-400"
                              : "border-border text-muted-foreground"
                        }`}
                      >
                        {category.type === "INCOME"
                          ? "Entrada"
                          : category.type === "EXPENSE"
                            ? "Saída"
                            : "Ambos"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {category.transactionCount} lançamento
                      {category.transactionCount !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-border h-7 px-2.5 text-[10px]"
                      onClick={() => openEdit(category)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-border h-7 px-2.5 text-[10px] text-rose-500 hover:bg-rose-500/10"
                      onClick={() => {
                        if (category.transactionCount > 0) {
                          showFeedback(
                            `Não é possível excluir "${category.name}" pois ${category.transactionCount} lançamento${category.transactionCount !== 1 ? "s usam" : " usa"} esta categoria.`,
                            "error",
                          );
                          return;
                        }
                        setPendingDeleteId(category.id);
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating action button */}
      <button
        type="button"
        aria-label="Nova categoria"
        onClick={openCreate}
        className={`fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 md:bottom-8 md:right-8 md:h-14 md:w-14 ${
          showFab ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <LucideIcon icon={Plus} className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
      </button>
    </SidebarShell>
  );
}
