import { z } from "zod";

export const transactionFormSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
  amount: z.string().min(1, "Valor é obrigatório"),
  type: z.enum(["entrada", "saida"]),
  recurrenceMode: z.enum(["nao_recorrente", "recorrente"]),
  recurrenceKind: z.enum(["fixa", "variavel"]),
  recurrenceFrequency: z.enum(["mensal", "semanal", "anual"]),
  billingDay: z.string(),
  recurrenceEndDate: z.string().optional(),
  isSettled: z.boolean(),
  paymentDate: z.string(),
});

export type TransactionFormData = z.infer<typeof transactionFormSchema>;
