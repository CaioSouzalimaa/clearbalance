import { NextResponse } from "next/server";
import { z } from "zod";

import { registerUser } from "@/src/services/auth";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados inválidos.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const user = await registerUser(parsed.data);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return NextResponse.json(
        { message: "Este email já está em uso." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Não foi possível registrar usuário." },
      { status: 500 },
    );
  }
}
