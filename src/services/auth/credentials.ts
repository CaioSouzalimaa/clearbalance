import bcrypt from "bcryptjs";
import { z } from "zod";

import { getUserByEmail } from "@/src/services/user";

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const validateCredentials = async (input: unknown) => {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) {
    return null;
  }

  const { email, password } = parsed.data;
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
    name: user.name,
    email: user.email,
  };
};
