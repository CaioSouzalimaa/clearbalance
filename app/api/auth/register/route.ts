import { NextResponse } from "next/server";

import { EmailAlreadyExistsError } from "@/src/services/user";
import { registerSchema, registerUser } from "@/src/services/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos para cadastro." },
      { status: 400 }
    );
  }

  try {
    const user = await registerUser(parsed.data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof EmailAlreadyExistsError) {
      return NextResponse.json(
        { error: "Email já está em uso." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar conta." },
      { status: 500 }
    );
  }
}
