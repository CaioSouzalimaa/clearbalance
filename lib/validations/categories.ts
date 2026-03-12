import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  iconId: z.string().optional(),
  color: z.string().optional(),
  budget: z.number().positive().optional().nullable(),
  type: z.enum(["INCOME", "EXPENSE", "BOTH"]).default("BOTH"),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
