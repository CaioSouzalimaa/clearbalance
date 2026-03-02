import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { seedDefaultCategories } from "@/lib/categories";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validar dados com Zod
    const validatedData = registerSchema.parse(body);

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 },
      );
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
      },
    });

    // Criar categorias padrão (não bloqueia o registro em caso de falha)
    try {
      await seedDefaultCategories(user.id);
    } catch (seedError) {
      console.warn("[register] Falha ao criar categorias padrão:", seedError);
    }

    // Retornar sucesso (sem senha)
    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao criar conta. Tente novamente." },
      { status: 500 },
    );
  }
}
