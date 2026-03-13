import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TransactionType, RecurrenceMode } from "@prisma/client";
import { Prisma } from "@prisma/client";

interface ConfirmedTransaction {
  date: string; // "YYYY-MM-DD"
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  categoryId: string; // must be an existing category id owned by the user
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const userId = session.user.id;

  const contentType = req.headers.get("content-type") ?? "";

  // ── JSON path: confirmed transactions from the preview step ──────────────
  if (contentType.includes("application/json")) {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
    }

    if (
      !body ||
      typeof body !== "object" ||
      !Array.isArray((body as Record<string, unknown>).transactions)
    ) {
      return NextResponse.json(
        { error: 'Esperado { transactions: [...] }' },
        { status: 400 },
      );
    }

    const items = (body as { transactions: ConfirmedTransaction[] }).transactions;

    if (items.length === 0) {
      return NextResponse.json({ error: "Nenhuma transação enviada." }, { status: 400 });
    }

    // Validate that every categoryId belongs to the authenticated user
    const categoryIds = [...new Set(items.map((t) => t.categoryId))];
    const ownedCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds }, userId },
      select: { id: true },
    });
    const ownedIds = new Set(ownedCategories.map((c) => c.id));
    for (const id of categoryIds) {
      if (!ownedIds.has(id)) {
        return NextResponse.json(
          { error: "Categoria inválida ou não pertence ao usuário." },
          { status: 403 },
        );
      }
    }

    const rows = items.map((t) => ({
      userId,
      categoryId: t.categoryId,
      description: t.description,
      amount: new Prisma.Decimal(t.amount),
      type: t.type === "INCOME" ? TransactionType.INCOME : TransactionType.EXPENSE,
      date: new Date(t.date),
      isSettled: true,
      paymentDate: new Date(t.date),
      recurrenceMode: RecurrenceMode.NONE,
    }));

    const result = await prisma.transaction.createMany({ data: rows, skipDuplicates: false });
    return NextResponse.json({ imported: result.count });
  }

  // ── Legacy path kept for backward compatibility (should not be reached) ──
  return NextResponse.json(
    { error: "Use o fluxo de pré-visualização: envie para /api/transactions/preview-ofx primeiro." },
    { status: 400 },
  );
}
