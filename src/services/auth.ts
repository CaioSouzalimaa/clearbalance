import bcrypt from "bcryptjs";

import { prisma } from "@/src/lib/db";
import { findUserByEmail, toSafeUser, type UserSafe } from "@/src/services/user";

export type AuthResult =
  | { ok: true; user: UserSafe }
  | { ok: false; reason: "INVALID_CREDENTIALS" };

export const authenticateUser = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  const user = await findUserByEmail(email);

  if (!user) {
    return { ok: false, reason: "INVALID_CREDENTIALS" };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return { ok: false, reason: "INVALID_CREDENTIALS" };
  }

  return { ok: true, user: toSafeUser(user) };
};

export const registerUser = async (input: {
  email: string;
  password: string;
  name?: string;
}): Promise<UserSafe> => {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const createdUser = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
    },
  });

  return toSafeUser(createdUser);
};
