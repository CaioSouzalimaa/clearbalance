"use client";

import { useState } from "react";
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

const initialCategories = [
  { id: 1, name: "Moradia", iconId: "home" },
  { id: 2, name: "Alimentação", iconId: "market" },
  { id: 3, name: "Transporte", iconId: "transport" },
  { id: 4, name: "Serviços", iconId: "energy" },
  { id: 5, name: "Investimentos", iconId: "savings" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [categoryName, setCategoryName] = useState("");
  const [selectedIconId, setSelectedIconId] = useState(iconOptions[0].id);

  const handleAddCategory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      return;
    }

    setCategories((prev) => [
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map((item) => item.id)) + 1 : 1,
        name: trimmedName,
        iconId: selectedIconId,
      },
    ]);
    setCategoryName("");
  };

  const resolveIcon = (iconId: string) =>
    iconOptions.find((option) => option.id === iconId)?.icon ?? Tag;

  return (
    <SidebarShell>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Personalize sua organização
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            Categorias
          </h1>
        </div>
        <Button variant="outline" className="border-border text-foreground">
          Exportar categorias
        </Button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            Suas categorias
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as categorias que aparecem nos lançamentos.
          </p>
          <div className="mt-6 space-y-3">
            {categories.map((category) => {
              const Icon = resolveIcon(category.iconId);
              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
                      <LucideIcon icon={Icon} className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {category.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ícone selecionado
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border px-3 py-1 text-xs"
                  >
                    Editar
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <form
          className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
          onSubmit={handleAddCategory}
        >
          <h2 className="text-lg font-semibold text-foreground">
            Criar nova categoria
          </h2>
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
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Ícone da categoria
              </span>
              <div className="grid grid-cols-3 gap-3">
                {iconOptions.map((option) => {
                  const isSelected = selectedIconId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedIconId(option.id)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/60"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <LucideIcon
                        icon={option.icon}
                        className="h-4 w-4"
                        aria-hidden
                      />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="submit">Salvar categoria</Button>
            </div>
          </div>
        </form>
      </section>
    </SidebarShell>
  );
}
