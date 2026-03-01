import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { transactionFormSchema } from "@/lib/validations/transactions";
import { getUserTransactions, createTransaction } from "@/lib/transactions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const transactions = await getUserTransactions(session.user.id);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("[GET /api/transactions]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = transactionFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const transaction = await createTransaction(session.user.id, parsed.data);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("[POST /api/transactions]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
