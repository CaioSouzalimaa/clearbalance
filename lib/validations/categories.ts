import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  iconId: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
