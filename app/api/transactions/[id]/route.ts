import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { transactionFormSchema } from "@/lib/validations/transactions";
import {
  updateTransaction,
  deleteTransaction,
  toggleTransactionSettlement,
} from "@/lib/transactions";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = transactionFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const transaction = await updateTransaction(id, session.user.id, parsed.data);
    return NextResponse.json(transaction);
  } catch (error) {
    console.error(`[PUT /api/transactions/${id}]`, error);
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
    await deleteTransaction(id, session.user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[DELETE /api/transactions/${id}]`, error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

/** PATCH — toggle isSettled */
export async function PATCH(_req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const transaction = await toggleTransactionSettlement(id, session.user.id);
    return NextResponse.json(transaction);
  } catch (error) {
    console.error(`[PATCH /api/transactions/${id}]`, error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
