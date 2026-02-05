import { Prisma } from "@prisma/client";

import { prisma } from "@/src/lib/db";

export class EmailAlreadyExistsError extends Error {
  constructor(message = "Email already exists") {
    super(message);
    this.name = "EmailAlreadyExistsError";
  }
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

type CreateUserInput = {
  email: string;
  name?: string | null;
  passwordHash: string;
};

export async function createUser({ email, name, passwordHash }: CreateUserInput) {
  try {
    return await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new EmailAlreadyExistsError();
    }

    throw error;
  }
}
