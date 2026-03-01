import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { categoryInputSchema } from "@/lib/validations/categories";
import { updateCategory, deleteCategory } from "@/lib/categories";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = categoryInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const category = await updateCategory(id, session.user.id, parsed.data);
    return NextResponse.json(category);
  } catch (error) {
    console.error(`[PUT /api/categories/${id}]`, error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await deleteCategory(id, session.user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[DELETE /api/categories/${id}]`, error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
