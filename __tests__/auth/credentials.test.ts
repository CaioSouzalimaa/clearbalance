import bcrypt from "bcryptjs";

import { validateCredentials } from "@/src/services/auth/credentials";
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
    findUnique: jest.Mock;
  };
};

const bcryptMock = bcrypt as unknown as {
  compare: jest.Mock;
};

describe("validateCredentials", () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    bcryptMock.compare.mockReset();
  });

  it("returns user data when credentials are valid", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      passwordHash: "hashed",
    });
    bcryptMock.compare.mockResolvedValue(true);

    const result = await validateCredentials({
      email: "test@example.com",
      password: "password123",
    });

    expect(result).toEqual({
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
    });
  });

  it("returns null when user is not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await validateCredentials({
      email: "missing@example.com",
      password: "password123",
    });

    expect(result).toBeNull();
  });

  it("returns null when password is invalid", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-2",
      name: "Test User",
      email: "test@example.com",
      passwordHash: "hashed",
    });
    bcryptMock.compare.mockResolvedValue(false);

    const result = await validateCredentials({
      email: "test@example.com",
      password: "password123",
    });

    expect(result).toBeNull();
  });
});
