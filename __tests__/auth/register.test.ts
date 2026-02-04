import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import { registerUser, DuplicateEmailError } from "@/src/services/auth/register";
import { prisma } from "@/src/lib/db";

jest.mock("@/src/lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const prismaMock = prisma as unknown as {
  user: {
    create: jest.Mock;
  };
};

const bcryptMock = bcrypt as unknown as {
  hash: jest.Mock;
};

describe("registerUser", () => {
  beforeEach(() => {
    prismaMock.user.create.mockReset();
    bcryptMock.hash.mockReset();
  });

  it("creates a new user when data is valid", async () => {
    bcryptMock.hash.mockResolvedValue("hashed-password");
    prismaMock.user.create.mockResolvedValue({
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      passwordHash: "hashed-password",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-02"),
    });

    const result = await registerUser({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    expect(result).toEqual({
      success: true,
      data: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-02"),
      },
    });
  });

  it("throws DuplicateEmailError when email already exists", async () => {
    bcryptMock.hash.mockResolvedValue("hashed-password");
    prismaMock.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Duplicate", {
        code: "P2002",
        clientVersion: "test",
      })
    );

    await expect(
      registerUser({
        email: "test@example.com",
        password: "password123",
      })
    ).rejects.toBeInstanceOf(DuplicateEmailError);
  });
});
