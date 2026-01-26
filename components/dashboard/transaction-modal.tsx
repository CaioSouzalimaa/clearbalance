"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DollarSign } from "lucide";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LucideIcon } from "@/components/dashboard/sidebar";

export type RecurrenceMode = "nao_recorrente" | "recorrente";
export type RecurrenceKind = "fixa" | "variavel";
export type RecurrenceFrequency = "mensal" | "semanal" | "anual";

export interface TransactionFormState {
  description: string;
  category: string;
  date: string;
  amount: string;
  type: "entrada" | "saida";
  recurrenceMode: RecurrenceMode;
  recurrenceKind: RecurrenceKind;
  recurrenceFrequency: RecurrenceFrequency;
  billingDay: string;
  isSettled: boolean;
  paymentDate: string;
}

export const defaultTransactionFormState: TransactionFormState = {
  description: "",
  category: "",
  date: "",
  amount: "",
  type: "entrada",
  recurrenceMode: "nao_recorrente",
  recurrenceKind: "fixa",
  recurrenceFrequency: "mensal",
  billingDay: "",
  isSettled: false,
  paymentDate: "",
};

const categoryOptions = [
  "Renda",
  "Moradia",
  "Alimentação",
  "Transporte",
  "Lazer",
  "Investimentos",
  "Serviços",
  "Outros",
];

interface TransactionModalProps {
  isOpen: boolean;
  dialogId: string;
  title: string;
  subtitle: string;
  submitLabel: string;
  initialState: TransactionFormState;
  onClose: () => void;
  onSubmit: (state: TransactionFormState) => void;
}

export const TransactionModal = ({
  isOpen,
  dialogId,
  title,
  subtitle,
  submitLabel,
  initialState,
  onClose,
  onSubmit,
}: TransactionModalProps) => {
  const [formState, setFormState] = useState<TransactionFormState>(initialState);

  useEffect(() => {
    if (isOpen) {
      setFormState(initialState);
    }
  }, [initialState, isOpen]);

  const formattedAmount = useMemo(() => formState.amount, [formState.amount]);

  const formatCurrencyBRL = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      return "";
    }

    const numberValue = Number(digits) / 100;

    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getBillingDayLabel = () => {
    if (formState.recurrenceFrequency === "semanal") {
      return "Dia da semana";
    }

    if (formState.recurrenceFrequency === "anual") {
      return "Data de cobrança";
    }

    return "Dia de cobrança";
  };

  if (!isOpen) {
    return null;
  }

  const titleId = `${dialogId}-title`;
  const categoryListId = `${dialogId}-categories`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-xl overflow-y-auto rounded-xl bg-background p-6 shadow-lg max-h-[90vh]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 text-lg text-muted-foreground transition hover:text-foreground"
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(formState);
          }}
        >
          <div className="space-y-2">
            <label
              htmlFor={`${dialogId}-descricao`}
              className="text-sm font-medium text-foreground"
            >
              Descrição
            </label>
            <Input
              id={`${dialogId}-descricao`}
              name="descricao"
              placeholder="Ex.: Pagamento de cliente"
              value={formState.description}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor={`${dialogId}-valor`}
                className="text-sm font-medium text-foreground"
              >
                Valor
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                  <LucideIcon icon={DollarSign} className="h-4 w-4" aria-hidden />
                </span>
                <Input
                  id={`${dialogId}-valor`}
                  name="valor"
                  inputMode="numeric"
                  placeholder="0,00"
                  value={formattedAmount}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      amount: formatCurrencyBRL(event.target.value),
                    }))
                  }
                  className="pl-9 text-right"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor={`${dialogId}-categoria`}
                className="text-sm font-medium text-foreground"
              >
                Categoria
              </label>
              <Input
                id={`${dialogId}-categoria`}
                name="categoria"
                list={categoryListId}
                placeholder="Ex.: Moradia"
                value={formState.category}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
              />
              <datalist id={categoryListId}>
                {categoryOptions.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor={`${dialogId}-tipo`}
                className="text-sm font-medium text-foreground"
              >
                Tipo
              </label>
              <select
                id={`${dialogId}-tipo`}
                name="tipo"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formState.type}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    type: event.target.value as TransactionFormState["type"],
                  }))
                }
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor={`${dialogId}-data`}
                className="text-sm font-medium text-foreground"
              >
                {formState.recurrenceMode === "recorrente"
                  ? "Data do primeiro lançamento"
                  : "Data do lançamento"}
              </label>
              <Input
                id={`${dialogId}-data`}
                name="data"
                type="date"
                value={formState.date}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    date: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Recorrência
              </label>
              <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name={`${dialogId}-recurrenceMode`}
                    value="nao_recorrente"
                    checked={formState.recurrenceMode === "nao_recorrente"}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        recurrenceMode:
                          event.target.value as TransactionFormState["recurrenceMode"],
                      }))
                    }
                    className="h-4 w-4 border-border text-primary"
                  />
                  Não recorrente
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name={`${dialogId}-recurrenceMode`}
                    value="recorrente"
                    checked={formState.recurrenceMode === "recorrente"}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        recurrenceMode:
                          event.target.value as TransactionFormState["recurrenceMode"],
                      }))
                    }
                    className="h-4 w-4 border-border text-primary"
                  />
                  Recorrente
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Usado para despesas ou receitas que se repetem.
              </p>
            </div>
            {formState.recurrenceMode === "recorrente" ? (
              <div className="space-y-2">
                <label
                  htmlFor={`${dialogId}-recurrence-type`}
                  className="text-sm font-medium text-foreground"
                >
                  Tipo
                </label>
                <select
                  id={`${dialogId}-recurrence-type`}
                  name="recurrenceKind"
                  value={formState.recurrenceKind}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      recurrenceKind:
                        event.target.value as TransactionFormState["recurrenceKind"],
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="fixa">Fixa</option>
                  <option value="variavel">Variável</option>
                </select>
              </div>
            ) : null}
          </div>

          {formState.recurrenceMode === "recorrente" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor={`${dialogId}-recurrence-frequency`}
                  className="text-sm font-medium text-foreground"
                >
                  Frequência
                </label>
                <select
                  id={`${dialogId}-recurrence-frequency`}
                  name="recurrenceFrequency"
                  value={formState.recurrenceFrequency}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      recurrenceFrequency:
                        event.target.value as TransactionFormState["recurrenceFrequency"],
                      billingDay: "",
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="mensal">Mensal</option>
                  <option value="semanal">Semanal</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor={`${dialogId}-billing-day`}
                  className="text-sm font-medium text-foreground"
                >
                  {getBillingDayLabel()}
                </label>
                {formState.recurrenceFrequency === "semanal" ? (
                  <select
                    id={`${dialogId}-billing-day`}
                    name="billingDay"
                    value={formState.billingDay}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        billingDay: event.target.value,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-offset-2"
                  >
                    <option value="">Selecione</option>
                    <option value="Segunda-feira">Segunda-feira</option>
                    <option value="Terça-feira">Terça-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Quinta-feira">Quinta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                ) : formState.recurrenceFrequency === "anual" ? (
                  <Input
                    id={`${dialogId}-billing-day`}
                    name="billingDay"
                    type="date"
                    value={formState.billingDay}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        billingDay: event.target.value,
                      }))
                    }
                  />
                ) : (
                  <Input
                    id={`${dialogId}-billing-day`}
                    name="billingDay"
                    type="number"
                    min={1}
                    max={31}
                    placeholder="Ex: 5"
                    value={formState.billingDay}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        billingDay: event.target.value,
                      }))
                    }
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground md:col-span-2">
                Lançamentos recorrentes são gerados automaticamente.
              </p>
            </div>
          ) : null}

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Status de pagamento
                </p>
                <p className="text-xs text-muted-foreground">
                  Use este status para controlar o que já foi liquidado.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formState.isSettled}
                onClick={() =>
                  setFormState((prev) => {
                    const nextValue = !prev.isSettled;
                    const nextPaymentDate = nextValue
                      ? prev.paymentDate ||
                        new Date().toISOString().split("T")[0]
                      : "";

                    return {
                      ...prev,
                      isSettled: nextValue,
                      paymentDate: nextPaymentDate,
                    };
                  })
                }
                className={`relative inline-flex h-8 w-16 items-center rounded-full border transition ${
                  formState.isSettled
                    ? "border-primary bg-primary"
                    : "border-border bg-muted"
                }`}
              >
                <span
                  className={`absolute left-1 flex h-6 w-6 items-center justify-center rounded-full bg-background shadow transition ${
                    formState.isSettled ? "translate-x-8" : "translate-x-0"
                  }`}
                />
                <span className="sr-only">Alternar status</span>
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>{formState.isSettled ? "Pago" : "Pendente"}</span>
              {formState.isSettled ? (
                <label
                  htmlFor={`${dialogId}-payment-date`}
                  className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center"
                >
                  <span>Data de pagamento</span>
                  <Input
                    id={`${dialogId}-payment-date`}
                    name="paymentDate"
                    type="date"
                    value={formState.paymentDate}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        paymentDate: event.target.value,
                      }))
                    }
                    className="h-8 w-full px-2 py-1 text-xs sm:w-auto"
                  />
                </label>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
