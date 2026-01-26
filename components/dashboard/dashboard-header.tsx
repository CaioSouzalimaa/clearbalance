"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  TransactionModal,
  defaultTransactionFormState,
} from "@/components/dashboard/transaction-modal";

export const DashboardHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Bem-vinda de volta</p>
          <h1 className="text-2xl font-semibold text-foreground">
            Visão geral financeira
          </h1>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button
            variant="outline"
            className="w-full border-border text-foreground sm:w-auto"
          >
            Exportar
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
            Nova transação
          </Button>
        </div>
      </header>

      <TransactionModal
        isOpen={isModalOpen}
        dialogId="nova-transacao"
        title="Nova transação"
        subtitle="Adicione os detalhes da movimentação financeira."
        submitLabel="Salvar transação"
        initialState={defaultTransactionFormState}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => setIsModalOpen(false)}
      />
    </>
  );
};
