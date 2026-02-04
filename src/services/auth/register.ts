import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { createUser } from "@/src/services/user";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export class DuplicateEmailError extends Error {
  constructor(message = "Email already in use") {
    super(message);
    this.name = "DuplicateEmailError";
  }
}

export const registerUser = async (input: unknown) => {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error } as const;
  }

  const { email, password, name } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await createUser({
      email,
      name: name ?? null,
      passwordHash,
    });

    return { success: true, data: user } as const;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new DuplicateEmailError();
    }
    throw error;
  }
};
