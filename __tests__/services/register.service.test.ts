import bcrypt from "bcryptjs";

import { registerUser } from "@/src/services/auth";
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
  hash: jest.fn(),
}));

const mockedFindUnique = prisma.user.findUnique as jest.Mock;
const mockedCreate = prisma.user.create as jest.Mock;
const mockedHash = bcrypt.hash as jest.Mock;

describe("registerUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("cria usuário com sucesso", async () => {
    mockedFindUnique.mockResolvedValue(null);
    mockedHash.mockResolvedValue("hashed-password");
    mockedCreate.mockResolvedValue({
      id: "user_2",
      name: "Bob",
      email: "bob@example.com",
      passwordHash: "hashed-password",
      createdAt: new Date("2025-01-02"),
      updatedAt: new Date("2025-01-02"),
    });

    const result = await registerUser({
      email: "bob@example.com",
      password: "password123",
      name: "Bob",
    });

    expect(mockedHash).toHaveBeenCalledWith("password123", 12);
    expect(result).toEqual({
      id: "user_2",
      name: "Bob",
      email: "bob@example.com",
      createdAt: new Date("2025-01-02"),
      updatedAt: new Date("2025-01-02"),
    });
  });

  it("falha quando email já existe", async () => {
    mockedFindUnique.mockResolvedValue({
      id: "user_1",
      email: "bob@example.com",
      passwordHash: "hash",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    });

    await expect(
      registerUser({ email: "bob@example.com", password: "password123" }),
    ).rejects.toThrow("EMAIL_ALREADY_EXISTS");

    expect(mockedCreate).not.toHaveBeenCalled();
  });
});
