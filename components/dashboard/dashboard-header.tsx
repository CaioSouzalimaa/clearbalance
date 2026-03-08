"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  TransactionModal,
  TransactionFormState,
  createDefaultTransactionFormState,
} from "@/components/dashboard/transaction-modal";
import { useToast } from "@/components/ui/toast";

export const DashboardHeader = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFab, setShowFab] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowFab(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = async (state: TransactionFormState) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(
          (data as { error?: string })?.error ?? "Erro ao salvar transação.",
          "error",
        );
        return;
      }
      toast("Transação criada com sucesso.", "success");
      setIsModalOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Erro ao salvar transação:", err);
      toast("Erro ao salvar transação. Tente novamente.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Boas-vindas de volta{firstName ? `, ${firstName}` : ""}!
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            Visão geral financeira
          </h1>
        </div>
        <Button
          data-tour="new-transaction"
          className="shrink-0 gap-1.5 text-xs sm:text-sm"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nova transação
        </Button>
      </header>

      <TransactionModal
        isOpen={isModalOpen}
        dialogId="nova-transacao"
        title="Nova transação"
        subtitle="Adicione os detalhes da movimentação financeira."
        submitLabel={isSubmitting ? "Salvando…" : "Salvar transação"}
        isSubmitting={isSubmitting}
        initialState={createDefaultTransactionFormState()}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <button
        type="button"
        aria-label="Nova transação"
        onClick={() => setIsModalOpen(true)}
        className={`fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 md:bottom-8 md:right-8 md:h-14 md:w-14 ${
          showFab ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <Plus className="h-5 w-5 md:h-6 md:w-6" />
      </button>
    </>
  );
};
