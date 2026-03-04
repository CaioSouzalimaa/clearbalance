"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Apple,
  Archive,
  Baby,
  Banknote,
  BarChart2,
  Battery,
  Beer,
  Bell,
  Bike,
  Bluetooth,
  Bookmark,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Bus,
  BusFront,
  Calendar,
  Camera,
  Car,
  Carrot,
  ChefHat,
  Clipboard,
  Clock,
  Cloud,
  Coffee,
  Coins,
  Cpu,
  CreditCard,
  Dumbbell,
  FileText,
  Film,
  Flag,
  Flower2,
  Folder,
  Fuel,
  Gamepad2,
  Gift,
  Globe,
  GraduationCap,
  Hammer,
  HardDrive,
  Headphones,
  Heart,
  HeartPulse,
  Home,
  Key,
  Lamp,
  Laptop,
  Leaf,
  Lightbulb,
  Lock,
  Mail,
  MapPin,
  Medal,
  MessageSquare,
  Microscope,
  Monitor,
  Moon,
  Music,
  Navigation,
  Package,
  PartyPopper,
  PawPrint,
  Pencil,
  Percent,
  Phone,
  PiggyBank,
  Pill,
  Pizza,
  Plane,
  Plug,
  Printer,
  Receipt,
  Sandwich,
  School,
  Scissors,
  Ship,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sofa,
  Star,
  Stethoscope,
  Store,
  Sun,
  Tablet,
  Tag,
  Tags,
  Train,
  TrendingDown,
  TrendingUp,
  TreePine,
  Trophy,
  Truck,
  Tv,
  Umbrella,
  User,
  Users,
  Utensils,
  UtensilsCrossed,
  Wallet,
  Wifi,
  Wine,
  Wrench,
} from "lucide";

import { ConfirmModal } from "@/components/dashboard/confirm-modal";
import { LucideIcon } from "@/components/dashboard/sidebar";
import { SidebarShell } from "@/components/dashboard/sidebar-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const iconOptions = [
  // Finanças
  { id: "wallet", label: "Carteira", icon: Wallet },
  { id: "credit-card", label: "Cartão de crédito", icon: CreditCard },
  { id: "dollar-sign", label: "Dinheiro", icon: Banknote },
  { id: "coins", label: "Moedas", icon: Coins },
  { id: "receipt", label: "Recibo", icon: Receipt },
  { id: "piggy-bank", label: "Poupança", icon: PiggyBank },
  { id: "trending-up", label: "Crescimento", icon: TrendingUp },
  { id: "trending-down", label: "Queda", icon: TrendingDown },
  { id: "bar-chart", label: "Gráfico", icon: BarChart2 },
  { id: "percent", label: "Porcentagem", icon: Percent },
  { id: "tag", label: "Tag", icon: Tag },
  { id: "tags", label: "Tags", icon: Tags },
  // Compras
  { id: "shopping-cart", label: "Mercado", icon: ShoppingCart },
  { id: "shopping-bag", label: "Compras", icon: ShoppingBag },
  { id: "store", label: "Loja", icon: Store },
  { id: "gift", label: "Presente", icon: Gift },
  { id: "package", label: "Pacote", icon: Package },
  // Casa
  { id: "home", label: "Casa", icon: Home },
  { id: "building", label: "Prédio", icon: Building },
  { id: "building2", label: "Condomínio", icon: Building2 },
  { id: "sofa", label: "Móveis", icon: Sofa },
  { id: "lamp", label: "Iluminação", icon: Lamp },
  { id: "lightbulb", label: "Energia", icon: Lightbulb },
  { id: "plug", label: "Eletricidade", icon: Plug },
  { id: "wrench", label: "Manutenção", icon: Wrench },
  { id: "hammer", label: "Reforma", icon: Hammer },
  { id: "key", label: "Aluguel", icon: Key },
  { id: "lock", label: "Segurança", icon: Lock },
  { id: "scissors", label: "Serviços", icon: Scissors },
  // Alimentação
  { id: "utensils", label: "Alimentação", icon: Utensils },
  { id: "utensils-crossed", label: "Restaurante", icon: UtensilsCrossed },
  { id: "coffee", label: "Café", icon: Coffee },
  { id: "pizza", label: "Pizza", icon: Pizza },
  { id: "sandwich", label: "Lanche", icon: Sandwich },
  { id: "chef-hat", label: "Cozinha", icon: ChefHat },
  { id: "apple", label: "Frutas", icon: Apple },
  { id: "carrot", label: "Verduras", icon: Carrot },
  { id: "beer", label: "Cerveja", icon: Beer },
  { id: "wine", label: "Vinho", icon: Wine },
  // Transporte
  { id: "bus", label: "Ônibus", icon: Bus },
  { id: "bus-front", label: "Transporte público", icon: BusFront },
  { id: "car", label: "Carro", icon: Car },
  { id: "bike", label: "Bicicleta", icon: Bike },
  { id: "plane", label: "Avião", icon: Plane },
  { id: "train", label: "Trem", icon: Train },
  { id: "ship", label: "Navio", icon: Ship },
  { id: "truck", label: "Frete", icon: Truck },
  { id: "fuel", label: "Combustível", icon: Fuel },
  { id: "map-pin", label: "Localização", icon: MapPin },
  { id: "navigation", label: "Navegação", icon: Navigation },
  // Saúde
  { id: "heart", label: "Coração", icon: Heart },
  { id: "heart-pulse", label: "Saúde", icon: HeartPulse },
  { id: "activity", label: "Atividade", icon: Activity },
  { id: "stethoscope", label: "Médico", icon: Stethoscope },
  { id: "pill", label: "Remédio", icon: Pill },
  { id: "dumbbell", label: "Academia", icon: Dumbbell },
  // Trabalho
  { id: "briefcase", label: "Trabalho", icon: Briefcase },
  { id: "laptop", label: "Computador", icon: Laptop },
  { id: "monitor", label: "Monitor", icon: Monitor },
  { id: "printer", label: "Impressora", icon: Printer },
  { id: "phone", label: "Telefone", icon: Phone },
  { id: "mail", label: "E-mail", icon: Mail },
  { id: "message-square", label: "Mensagem", icon: MessageSquare },
  { id: "clipboard", label: "Relatório", icon: Clipboard },
  { id: "file-text", label: "Documento", icon: FileText },
  { id: "folder", label: "Pasta", icon: Folder },
  { id: "archive", label: "Arquivo", icon: Archive },
  { id: "calendar", label: "Agenda", icon: Calendar },
  { id: "clock", label: "Horas extras", icon: Clock },
  // Educação
  { id: "book-open", label: "Livro", icon: BookOpen },
  { id: "graduation-cap", label: "Educação", icon: GraduationCap },
  { id: "school", label: "Escola", icon: School },
  { id: "microscope", label: "Ciência", icon: Microscope },
  { id: "pencil", label: "Lápis", icon: Pencil },
  // Lazer & Entretenimento
  { id: "music", label: "Música", icon: Music },
  { id: "headphones", label: "Fones", icon: Headphones },
  { id: "tv", label: "TV / Streaming", icon: Tv },
  { id: "film", label: "Cinema", icon: Film },
  { id: "camera", label: "Fotografia", icon: Camera },
  { id: "gamepad2", label: "Games", icon: Gamepad2 },
  { id: "party-popper", label: "Festa", icon: PartyPopper },
  { id: "star", label: "Destaque", icon: Star },
  { id: "trophy", label: "Conquista", icon: Trophy },
  { id: "medal", label: "Medalha", icon: Medal },
  // Tecnologia
  { id: "smartphone", label: "Celular", icon: Smartphone },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "cpu", label: "Hardware", icon: Cpu },
  { id: "hard-drive", label: "Armazenamento", icon: HardDrive },
  { id: "wifi", label: "Internet", icon: Wifi },
  { id: "bluetooth", label: "Bluetooth", icon: Bluetooth },
  { id: "battery", label: "Bateria", icon: Battery },
  // Natureza
  { id: "sun", label: "Sol", icon: Sun },
  { id: "moon", label: "Lua", icon: Moon },
  { id: "cloud", label: "Nuvem", icon: Cloud },
  { id: "umbrella", label: "Chuva", icon: Umbrella },
  { id: "leaf", label: "Natureza", icon: Leaf },
  { id: "flower2", label: "Flores", icon: Flower2 },
  { id: "tree-pine", label: "Árvore", icon: TreePine },
  // Pessoas & Vida
  { id: "user", label: "Pessoa", icon: User },
  { id: "users", label: "Família", icon: Users },
  { id: "baby", label: "Bebê", icon: Baby },
  { id: "paw-print", label: "Pet", icon: PawPrint },
  // Outros
  { id: "globe", label: "Viagem", icon: Globe },
  { id: "flag", label: "Meta", icon: Flag },
  { id: "bell", label: "Alerta", icon: Bell },
  { id: "bookmark", label: "Marcador", icon: Bookmark },
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
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formIconId, setFormIconId] = useState(iconOptions[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [iconSearch, setIconSearch] = useState("");

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredIcons = useMemo(() => {
    const q = iconSearch.toLowerCase().trim();
    if (!q) return iconOptions;
    return iconOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [iconSearch]);

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

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormIconId(cat.iconId ?? iconOptions[0].id);
    setFormError("");
    setIconSearch("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormName("");
    setFormIconId(iconOptions[0].id);
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
        body: JSON.stringify({ name, iconId: formIconId }),
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
      cancelEdit();
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

  const formTitle = editingId ? "Editar categoria" : "Criar nova categoria";
  const submitLabel = isSaving
    ? "Salvando…"
    : editingId
      ? "Salvar alterações"
      : "Salvar categoria";

  const pendingDeleteName =
    categories.find((c) => c.id === pendingDeleteId)?.name ?? "";

  const selectedIconOption = iconOptions.find((o) => o.id === formIconId);

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
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Categorias</h1>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            Suas categorias
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as categorias que aparecem nos lançamentos.
          </p>
          <div className="mt-6 space-y-3">
            {isLoading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-border px-4 py-3"
                  >
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-7 w-14 rounded-md" />
                    <Skeleton className="h-7 w-14 rounded-md" />
                  </div>
                ))}
              </>
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
                        <LucideIcon
                          icon={Icon}
                          className="h-5 w-5"
                          aria-hidden
                        />
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

        <form
          className="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <h2 className="text-base sm:text-lg font-semibold text-foreground">{formTitle}</h2>
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
              {formError && (
                <p className="text-xs text-rose-500">{formError}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Ícone da categoria
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
                onChange={(e) => setIconSearch(e.target.value)}
                className="h-9 text-sm"
              />
              <div className="max-h-52 overflow-y-auto rounded-lg border border-border p-2">
                {filteredIcons.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    Nenhum ícone encontrado.
                  </p>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {filteredIcons.map((option) => {
                      const isSelected = formIconId === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          title={option.label}
                          onClick={() => setFormIconId(option.id)}
                          className={`flex h-9 w-full items-center justify-center rounded-lg border transition ${
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
