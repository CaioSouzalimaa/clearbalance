import { POST } from "@/app/api/auth/register/route";
import { registerUser } from "@/src/services/auth";
import { EmailAlreadyExistsError } from "@/src/services/user";

jest.mock("@/src/services/auth", () => {
  const actual = jest.requireActual("@/src/services/auth");
  return {
    ...actual,
    registerUser: jest.fn(),
  };
});

const registerUserMock = registerUser as jest.MockedFunction<typeof registerUser>;

describe("register route", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns 400 for invalid payload", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "invalid", password: "short" }),
      })
    );

    expect(response.status).toBe(400);
  });

  it("returns 201 on successful registration", async () => {
    registerUserMock.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      name: "User",
    });

    const response = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "user@example.com",
          password: "password123",
          name: "User",
        }),
      })
    );

    expect(response.status).toBe(201);
  });

  it("returns 409 when email already exists", async () => {
    registerUserMock.mockRejectedValue(new EmailAlreadyExistsError());

    const response = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "user@example.com",
          password: "password123",
          name: "User",
        }),
      })
    );

    expect(response.status).toBe(409);
  });
});
