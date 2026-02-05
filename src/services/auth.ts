import bcrypt from "bcryptjs";
import { z } from "zod";

import { createUser, getUserByEmail } from "@/src/services/user";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().trim().min(1).optional(),
});

type RegisterInput = z.infer<typeof registerSchema>;

export async function registerUser({ email, password, name }: RegisterInput) {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({
    email,
    name: name ?? null,
    passwordHash,
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

type CredentialsInput = {
  email: string;
  password: string;
};

export async function verifyUserCredentials({ email, password }: CredentialsInput) {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}
