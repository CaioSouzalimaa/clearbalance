import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  iconId: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE", "BOTH"]).default("BOTH"),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
