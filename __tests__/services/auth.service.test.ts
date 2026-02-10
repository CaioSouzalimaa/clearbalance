import bcrypt from "bcryptjs";

import { authenticateUser } from "@/src/services/auth";
import { prisma } from "@/src/lib/db";

jest.mock("@/src/lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

const mockedFindUnique = prisma.user.findUnique as jest.Mock;
const mockedCompare = bcrypt.compare as jest.Mock;

describe("authenticateUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna usuário seguro com credenciais válidas", async () => {
    mockedFindUnique.mockResolvedValue({
      id: "user_1",
      name: "Alice",
      email: "alice@example.com",
      passwordHash: "hash",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    });
    mockedCompare.mockResolvedValue(true);

    const result = await authenticateUser("alice@example.com", "password123");

    expect(result).toEqual({
      ok: true,
      user: {
        id: "user_1",
        name: "Alice",
        email: "alice@example.com",
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      },
    });
  });

  it("retorna erro para senha inválida", async () => {
    mockedFindUnique.mockResolvedValue({
      id: "user_1",
      name: "Alice",
      email: "alice@example.com",
      passwordHash: "hash",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    });
    mockedCompare.mockResolvedValue(false);

    const result = await authenticateUser("alice@example.com", "wrong");

    expect(result).toEqual({ ok: false, reason: "INVALID_CREDENTIALS" });
  });
});
