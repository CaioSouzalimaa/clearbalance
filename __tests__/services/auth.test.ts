import bcrypt from "bcryptjs";

import { prisma } from "@/src/lib/db";
import { registerUser, verifyUserCredentials } from "@/src/services/auth";

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
  compare: jest.fn(),
}));

const prismaMock = prisma as jest.Mocked<typeof prisma>;
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe("auth services", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns user data when credentials are valid", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      name: "User",
      passwordHash: "hashed",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    bcryptMock.compare.mockResolvedValue(true);

    const result = await verifyUserCredentials({
      email: "user@example.com",
      password: "password123",
    });

    expect(result).toEqual({
      id: "user-1",
      email: "user@example.com",
      name: "User",
    });
  });

  it("returns null when password is invalid", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      name: "User",
      passwordHash: "hashed",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    bcryptMock.compare.mockResolvedValue(false);

    const result = await verifyUserCredentials({
      email: "user@example.com",
      password: "wrong",
    });

    expect(result).toBeNull();
  });

  it("registers a user with hashed password", async () => {
    bcryptMock.hash.mockResolvedValue("hashed-password");
    prismaMock.user.create.mockResolvedValue({
      id: "user-2",
      email: "new@example.com",
      name: "New User",
      passwordHash: "hashed-password",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await registerUser({
      email: "new@example.com",
      password: "password123",
      name: "New User",
    });

    expect(result).toEqual({
      id: "user-2",
      email: "new@example.com",
      name: "New User",
    });
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: "new@example.com",
        name: "New User",
        passwordHash: "hashed-password",
      },
    });
  });
});
