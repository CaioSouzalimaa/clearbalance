"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
        toast((data as { error?: string })?.error ?? "Erro ao salvar transação.", "error");
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Boas-vindas de volta{firstName ? `, ${firstName}` : ""}!
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            Visão geral financeira
          </h1>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button
            className="w-full sm:w-auto"
            onClick={() => setIsModalOpen(true)}
          >
            Nova transação
          </Button>
        </div>
      </header>

      <TransactionModal
        isOpen={isModalOpen}
        dialogId="nova-transacao"
        title="Nova transação"
        subtitle="Adicione os detalhes da movimentação financeira."
        submitLabel={isSubmitting ? "Salvando…" : "Salvar transação"}
        initialState={createDefaultTransactionFormState()}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};
