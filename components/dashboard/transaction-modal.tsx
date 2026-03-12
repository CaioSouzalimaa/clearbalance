"use client";

import React, { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

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
  recurrenceEndDate: string;
  isSettled: boolean;
  paymentDate: string;
}

export const createDefaultTransactionFormState = (): TransactionFormState => ({
  description: "",
  category: "",
  date: new Date().toISOString().split("T")[0],
  amount: "",
  type: "entrada",
  recurrenceMode: "nao_recorrente",
  recurrenceKind: "fixa",
  recurrenceFrequency: "mensal",
  billingDay: "",
  recurrenceEndDate: "",
  isSettled: false,
  paymentDate: "",
});

// will be loaded from server when modal opens
interface CategoryOption {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE" | "BOTH";
}

interface TransactionModalProps {
  isOpen: boolean;
  dialogId: string;
  title: string;
  subtitle: string;
  submitLabel: string;
  isSubmitting?: boolean;
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
  isSubmitting = false,
  initialState,
  onClose,
  onSubmit,
}: TransactionModalProps) => {
  const [formState, setFormState] =
    useState<TransactionFormState>(initialState);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  // load categories when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setIsLoadingCategories(true);
    (async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) return;
        const data: CategoryOption[] = await res.json();
        if (cancelled) return;
        setCategories(data);
        // if creating new and no category selected, default to first matching
        if (!initialState.category) {
          const txType = initialState.type ?? "entrada";
          const filtered = data.filter((c) => {
            if (txType === "entrada")
              return c.type === "INCOME" || c.type === "BOTH";
            return c.type === "EXPENSE" || c.type === "BOTH";
          });
          if (filtered.length > 0) {
            setFormState((prev) => ({ ...prev, category: filtered[0].name }));
          }
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        if (!cancelled) setIsLoadingCategories(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, initialState.category]);

  useEffect(() => {
    if (isOpen) {
      setFormState(initialState);
      setSubmitted(false);
      setValidationError("");
    }
  }, [initialState, isOpen]);

  const formattedAmount = useMemo(() => formState.amount, [formState.amount]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (formState.type === "entrada")
        return c.type === "INCOME" || c.type === "BOTH";
      return c.type === "EXPENSE" || c.type === "BOTH";
    });
  }, [categories, formState.type]);

  const formatCurrencyBRL = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      return "";
    }

    const numberValue = Number(digits) / 100;

    return numberValue.toLocaleString("pt-BR", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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

  const isValid = useMemo(() => {
    const hasDescription = formState.description.trim().length > 0;
    const hasCategory = formState.category.trim().length > 0;
    const hasDate = /^\d{4}-\d{2}-\d{2}$/.test(formState.date);
    const amountDigits = formState.amount.replace(/\D/g, "");
    const hasAmount = amountDigits.length > 0 && Number(amountDigits) > 0;
    if (formState.isSettled && !formState.paymentDate) return false;
    return hasDescription && hasCategory && hasDate && hasAmount;
  }, [formState]);

  useEffect(() => {
    if (isValid) {
      setValidationError("");
    }
  }, [isValid]);

  if (!isOpen) {
    return null;
  }

  const titleId = `${dialogId}-title`;
  // const categoryListId no longer used (we use a select)

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
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl bg-background shadow-lg max-h-[90vh]">
        {/* close button fixed top-right */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          aria-label="Fechar modal"
        >
          ×
        </button>

        {/* scrolling wrapper containing header + body */}
        <div className="modal-scroll overflow-y-auto p-4 sm:p-6 max-h-[90vh]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id={titleId}
                className="text-lg font-semibold text-foreground"
              >
                {title}
              </h2>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>

          {/* body content */}
          <div className="relative sm:px-6 py-4 sm:py-5">
            {isSubmitting && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/80 backdrop-blur-sm">
                <Spinner className="h-8 w-8 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  Salvando transação…
                </p>
              </div>
            )}
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
                if (!isValid) {
                  setValidationError(
                    "Por favor, preencha todos os campos obrigatórios.",
                  );
                  return;
                }
                onSubmit(formState);
              }}
            >
              {validationError ? (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {validationError}
                </div>
              ) : null}
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
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className={
                    submitted && !formState.description.trim()
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
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
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                    value={formState.type}
                    onChange={(event) => {
                      const newType = event.target
                        .value as TransactionFormState["type"];
                      setFormState((prev) => {
                        // reset category if it doesn't match the new type
                        const matching = categories.filter((c) => {
                          if (newType === "entrada")
                            return c.type === "INCOME" || c.type === "BOTH";
                          return c.type === "EXPENSE" || c.type === "BOTH";
                        });
                        const currentStillValid = matching.some(
                          (c) => c.name === prev.category,
                        );
                        return {
                          ...prev,
                          type: newType,
                          category: currentStillValid
                            ? prev.category
                            : (matching[0]?.name ?? ""),
                        };
                      });
                    }}
                  >
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor={`${dialogId}-categoria`}
                    className="text-sm font-medium text-foreground"
                  >
                    Categoria
                    {isLoadingCategories && (
                      <Spinner className="ml-1.5 inline h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </label>
                  <select
                    id={`${dialogId}-categoria`}
                    name="categoria"
                    disabled={isLoadingCategories || isSubmitting}
                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none disabled:opacity-50 ${submitted && !formState.category.trim() ? "border-red-500" : "border-input"}`}
                    value={formState.category}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        category: event.target.value,
                      }))
                    }
                  >
                    {filteredCategories.length === 0 ? (
                      <option value="" disabled>
                        {isLoadingCategories
                          ? "Carregando categorias..."
                          : "Nenhuma categoria disponível"}
                      </option>
                    ) : (
                      filteredCategories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="min-w-0 space-y-2">
                  <label
                    htmlFor={`${dialogId}-valor`}
                    className="text-sm font-medium text-foreground"
                  >
                    Valor
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id={`${dialogId}-valor`}
                      name="valor"
                      inputMode="numeric"
                      placeholder="0,00"
                      value={formattedAmount}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          amount: formatCurrencyBRL(event.target.value),
                        }))
                      }
                      className={`pl-10 text-right${submitted && Number(formState.amount.replace(/\D/g, "")) === 0 ? " border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                  </div>
                </div>
                <div className="min-w-0 space-y-2">
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
                    disabled={isSubmitting}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        date: event.target.value,
                      }))
                    }
                    className={
                      `max-w-50 ` +
                      (submitted &&
                      !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(formState.date)
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "")
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
                        disabled={isSubmitting}
                        checked={formState.recurrenceMode === "nao_recorrente"}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            recurrenceMode: event.target
                              .value as TransactionFormState["recurrenceMode"],
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
                        disabled={isSubmitting}
                        checked={formState.recurrenceMode === "recorrente"}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            recurrenceMode: event.target
                              .value as TransactionFormState["recurrenceMode"],
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
                      disabled={isSubmitting}
                      value={formState.recurrenceKind}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          recurrenceKind: event.target
                            .value as TransactionFormState["recurrenceKind"],
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
                  <div className="min-w-0 space-y-2">
                    <label
                      htmlFor={`${dialogId}-recurrence-frequency`}
                      className="text-sm font-medium text-foreground"
                    >
                      Frequência
                    </label>
                    <select
                      id={`${dialogId}-recurrence-frequency`}
                      name="recurrenceFrequency"
                      disabled={isSubmitting}
                      value={formState.recurrenceFrequency}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          recurrenceFrequency: event.target
                            .value as TransactionFormState["recurrenceFrequency"],
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
                  <div className="min-w-0 space-y-2">
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
                        className="max-w-50"
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
                  {formState.recurrenceKind === "variavel" ? (
                    <div className="min-w-0 space-y-2 md:col-span-2">
                      <label
                        htmlFor={`${dialogId}-recurrence-end-date`}
                        className="text-sm font-medium text-foreground"
                      >
                        Data final da recorrência
                      </label>
                      <Input
                        id={`${dialogId}-recurrence-end-date`}
                        name="recurrenceEndDate"
                        type="date"
                        value={formState.recurrenceEndDate}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            recurrenceEndDate: event.target.value,
                          }))
                        }
                        className="max-w-50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Esta recorrência será gerada até a data especificada.
                      </p>
                    </div>
                  ) : null}
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
                        className={`h-8 min-w-0 w-full px-2 py-1 text-xs sm:max-w-[160px]${submitted && formState.isSettled && !formState.paymentDate ? " border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                    </label>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="h-4 w-4" />
                      Salvando…
                    </span>
                  ) : (
                    submitLabel
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
