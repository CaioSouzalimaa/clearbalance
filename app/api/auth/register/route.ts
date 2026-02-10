import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { registerUser } from "@/src/services/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await registerUser(body);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos.", issues: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof Error && (error as Error & { code?: number }).code === 409) {
      return NextResponse.json({ message: "E-mail já cadastrado." }, { status: 409 });
    }

    return NextResponse.json({ message: "Erro interno ao registrar usuário." }, { status: 500 });
  }
}
