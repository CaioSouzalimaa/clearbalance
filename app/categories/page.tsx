"use client";

import { useEffect, useState } from "react";
import {
  Bookmark,
  Briefcase,
  Bus,
  Coffee,
  Gift,
  Home,
  Lightbulb,
  PiggyBank,
  ShoppingCart,
  Tag,
} from "lucide";

import { ConfirmModal } from "@/components/dashboard/confirm-modal";
import { LucideIcon } from "@/components/dashboard/sidebar";
import { SidebarShell } from "@/components/dashboard/sidebar-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const iconOptions = [
  { id: "home", label: "Casa", icon: Home },
  { id: "market", label: "Mercado", icon: ShoppingCart },
  { id: "work", label: "Trabalho", icon: Briefcase },
  { id: "transport", label: "Transporte", icon: Bus },
  { id: "coffee", label: "Café", icon: Coffee },
  { id: "energy", label: "Energia", icon: Lightbulb },
  { id: "gift", label: "Presentes", icon: Gift },
  { id: "savings", label: "Poupança", icon: PiggyBank },
  { id: "bookmark", label: "Extra", icon: Bookmark },
];

interface Category {
  id: string;
  name: string;
  iconId: string | null;
  transactionCount: number;
}

const resolveIcon = (iconId: string | null) =>
  iconOptions.find((o) => o.id === iconId)?.icon ?? Tag;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formIconId, setFormIconId] = useState(iconOptions[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormIconId(cat.iconId ?? iconOptions[0].id);
    setFormError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormName("");
    setFormIconId(iconOptions[0].id);
    setFormError("");
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3000);
  };

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
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, iconId: formIconId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError((data as { error?: string })?.error ?? "Erro ao salvar.");
        return;
      }
      const saved: Category = await res.json();
      if (editingId) {
        setCategories((prev) => prev.map((c) => (c.id === editingId ? saved : c)));
        showFeedback("Categoria atualizada com sucesso.");
      } else {
        setCategories((prev) => [...prev, saved]);
        showFeedback("Categoria criada com sucesso.");
      }
      cancelEdit();
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/${pendingDeleteId}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setCategories((prev) => prev.filter((c) => c.id !== pendingDeleteId));
        showFeedback("Categoria excluída.");
      } else {
        const data = await res.json().catch(() => ({}));
        showFeedback((data as { error?: string })?.error ?? "Erro ao excluir.");
      }
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
    }
  };

  const formTitle = editingId ? "Editar categoria" : "Criar nova categoria";
  const submitLabel = isSaving
    ? "Salvando…"
    : editingId
      ? "Salvar alterações"
      : "Salvar categoria";

  const pendingDeleteName =
    categories.find((c) => c.id === pendingDeleteId)?.name ?? "";

  return (
    <SidebarShell>
      <ConfirmModal
        isOpen={!!pendingDeleteId}
        title="Excluir categoria"
        message={`Tem certeza que deseja excluir "${pendingDeleteName}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Personalize sua organização
          </p>
          <h1 className="text-2xl font-semibold text-foreground">Categorias</h1>
        </div>
      </header>

      {feedback && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
          {feedback}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Suas categorias</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as categorias que aparecem nos lançamentos.
          </p>
          <div className="mt-6 space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma categoria. Crie a primeira!
              </p>
            ) : (
              categories.map((category) => {
                const Icon = resolveIcon(category.iconId);
                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                        <LucideIcon icon={Icon} className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {category.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {category.transactionCount} lançamento
                          {category.transactionCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-border px-3 py-1 text-xs"
                        onClick={() => startEdit(category)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-border px-3 py-1 text-xs text-rose-500 hover:bg-rose-500/10"
                        onClick={() => setPendingDeleteId(category.id)}
                        disabled={category.transactionCount > 0}
                        title={
                          category.transactionCount > 0
                            ? "Há lançamentos vinculados"
                            : undefined
                        }
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

        <form
          className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <h2 className="text-lg font-semibold text-foreground">{formTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Defina um nome e escolha um ícone para identificar seus gastos.
          </p>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="categoria-nome"
                className="text-sm font-medium text-foreground"
              >
                Nome da categoria
              </label>
              <Input
                id="categoria-nome"
                name="categoria-nome"
                placeholder="Ex.: Saúde, Educação"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  setFormError("");
                }}
              />
              {formError && <p className="text-xs text-rose-500">{formError}</p>}
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Ícone da categoria
              </span>
              <div className="grid grid-cols-3 gap-3">
                {iconOptions.map((option) => {
                  const isSelected = formIconId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFormIconId(option.id)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/60"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <LucideIcon icon={option.icon} className="h-4 w-4" aria-hidden />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              {editingId && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={isSaving}>
                {submitLabel}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </SidebarShell>
  );
}
