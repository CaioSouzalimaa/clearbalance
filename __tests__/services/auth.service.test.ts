import bcrypt from "bcryptjs";
import { registerUser, validateUserCredentials } from "@/src/services/auth";
import { createUser, getUserByEmail } from "@/src/services/user";

jest.mock("@/src/services/user", () => ({
  createUser: jest.fn(),
  getUserByEmail: jest.fn(),
}));

describe("auth service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve autenticar usuário com credenciais válidas", async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    (getUserByEmail as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "john@example.com",
      name: "John",
      passwordHash,
    });

    const user = await validateUserCredentials("john@example.com", "password123");

    expect(user).not.toBeNull();
    expect(user?.email).toBe("john@example.com");
  });

  it("deve falhar autenticação com senha inválida", async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    (getUserByEmail as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "john@example.com",
      name: "John",
      passwordHash,
    });

    const user = await validateUserCredentials("john@example.com", "wrong-pass");

    expect(user).toBeNull();
  });

  it("deve registrar usuário com sucesso", async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue(null);
    (createUser as jest.Mock).mockImplementation(async ({ email, name, passwordHash }) => ({
      id: "user-2",
      email,
      name,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const user = await registerUser({
      email: "new@example.com",
      password: "password123",
      name: "New",
    });

    expect(user.email).toBe("new@example.com");
    expect(createUser).toHaveBeenCalledTimes(1);
    expect((createUser as jest.Mock).mock.calls[0][0].passwordHash).not.toBe("password123");
  });

  it("deve retornar erro 409 ao registrar email duplicado", async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue({ id: "user-1", email: "john@example.com" });

    await expect(
      registerUser({
        email: "john@example.com",
        password: "password123",
      }),
    ).rejects.toMatchObject({ code: 409 });
  });
});
