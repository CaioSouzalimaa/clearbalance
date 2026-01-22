"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const DashboardHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Bem-vinda de volta</p>
          <h1 className="text-2xl font-semibold text-foreground">
            Visão geral financeira
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-border text-foreground">
            Exportar
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>Nova transação</Button>
        </div>
      </header>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nova-transacao-title"
        >
          <div className="w-full max-w-lg rounded-xl bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="nova-transacao-title"
                  className="text-lg font-semibold text-foreground"
                >
                  Nova transação
                </h2>
                <p className="text-sm text-muted-foreground">
                  Adicione os detalhes da movimentação financeira.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full px-2 text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>

            <form className="mt-6 space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="descricao"
                  className="text-sm font-medium text-foreground"
                >
                  Descrição
                </label>
                <Input
                  id="descricao"
                  name="descricao"
                  placeholder="Ex.: Pagamento de cliente"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="valor"
                    className="text-sm font-medium text-foreground"
                  >
                    Valor
                  </label>
                  <Input
                    id="valor"
                    name="valor"
                    type="number"
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="categoria"
                    className="text-sm font-medium text-foreground"
                  >
                    Categoria
                  </label>
                  <select
                    id="categoria"
                    name="categoria"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue="receitas"
                  >
                    <option value="receitas">Receitas</option>
                    <option value="alimentacao">Alimentação</option>
                    <option value="moradia">Moradia</option>
                    <option value="transporte">Transporte</option>
                    <option value="lazer">Lazer</option>
                    <option value="investimentos">Investimentos</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="tipo"
                    className="text-sm font-medium text-foreground"
                  >
                    Tipo
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue="entrada"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="data"
                    className="text-sm font-medium text-foreground"
                  >
                    Data
                  </label>
                  <Input id="data" name="data" type="date" />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar transação</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};
