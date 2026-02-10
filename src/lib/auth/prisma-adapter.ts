import type { Adapter } from "next-auth/adapters";
import type { PrismaClient } from "@prisma/client";

export const PrismaAdapter = (prisma: PrismaClient): Adapter => ({
  createUser: (data) => prisma.user.create({ data }),
  getUser: (id) => prisma.user.findUnique({ where: { id } }),
  getUserByEmail: (email) => prisma.user.findUnique({ where: { email } }),
  async getUserByAccount({ provider, providerAccountId }) {
    const account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: { user: true },
    });

    return account?.user ?? null;
  },
  updateUser: ({ id, ...data }) =>
    prisma.user.update({ where: { id }, data }),
  deleteUser: (id) => prisma.user.delete({ where: { id } }),
  linkAccount: (data) => prisma.account.create({ data }) as never,
  unlinkAccount: ({ provider, providerAccountId }) =>
    prisma.account.delete({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
    }) as never,
  createSession: (data) => prisma.session.create({ data }),
  getSessionAndUser: async (sessionToken) => {
    const sessionAndUser = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!sessionAndUser) {
      return null;
    }

    const { user, ...session } = sessionAndUser;

    return { session, user };
  },
  updateSession: (data) =>
    prisma.session.update({ where: { sessionToken: data.sessionToken }, data }),
  deleteSession: (sessionToken) =>
    prisma.session.delete({ where: { sessionToken } }),
  createVerificationToken: (data) =>
    prisma.verificationToken.create({ data }),
  useVerificationToken: async ({ identifier, token }) => {
    try {
      return await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier,
            token,
          },
        },
      });
    } catch {
      return null;
    }
  },
});
