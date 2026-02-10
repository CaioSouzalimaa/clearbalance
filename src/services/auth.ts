import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createUser, getUserByEmail } from "@/src/services/user";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().trim().min(1).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function validateUserCredentials(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);

  if (!validPassword) {
    return null;
  }

  return user;
}

export async function registerUser(input: z.infer<typeof registerSchema>) {
  const data = registerSchema.parse(input);
  const existingUser = await getUserByEmail(data.email);

  if (existingUser) {
    const error = new Error("E-mail já cadastrado.");
    (error as Error & { code?: number }).code = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  try {
    return await createUser({
      email: data.email,
      name: data.name,
      passwordHash,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const duplicateError = new Error("E-mail já cadastrado.");
      (duplicateError as Error & { code?: number }).code = 409;
      throw duplicateError;
    }

    throw error;
  }
}
