import { prisma } from "@/src/lib/db";

export type PublicUser = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

const toPublicUser = (user: {
  id: string;
  name: string | null;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}): PublicUser => {
  const { passwordHash, ...rest } = user;
  return rest;
};

export const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const createUser = async (data: {
  name?: string | null;
  email: string;
  passwordHash: string;
}) => {
  const user = await prisma.user.create({ data });
  return toPublicUser(user);
};
