import { z } from "zod";

export const goalInputSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  targetAmount: z.number().positive("O valor da meta deve ser positivo"),
  initialAmount: z
    .number()
    .nonnegative("O valor inicial não pode ser negativo")
    .optional(),
  deadline: z.string().optional(),
});

export const contributionInputSchema = z.object({
  amount: z.number().positive("O valor do aporte deve ser positivo"),
});

export type GoalInput = z.infer<typeof goalInputSchema>;
export type ContributionInput = z.infer<typeof contributionInputSchema>;
