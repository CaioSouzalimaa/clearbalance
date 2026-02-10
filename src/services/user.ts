import { prisma } from "@/src/lib/db";

export type UserSafe = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export const toSafeUser = (user: {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}): UserSafe => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const findUserByEmail = async (email: string) =>
  prisma.user.findUnique({ where: { email } });
