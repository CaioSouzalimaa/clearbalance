import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TransactionType } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  // Verify the category belongs to this user
  const category = await prisma.category.findUnique({
    where: { id },
    select: { userId: true, name: true },
  });
  if (!category || category.userId !== session.user.id) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
  }

  // Compute average monthly expense for this category over the last 3 full months
  const now = new Date();
  const threeMonthsAgo = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 3, 1));
  const thisMonthStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));

  const total = await prisma.transaction.aggregate({
    where: {
      userId: session.user.id,
      categoryId: id,
      type: TransactionType.EXPENSE,
      date: { gte: threeMonthsAgo, lt: thisMonthStart },
    },
    _sum: { amount: true },
  });

  const sum = total._sum.amount?.toNumber() ?? 0;
  const suggestion = sum > 0 ? parseFloat((sum / 3).toFixed(2)) : null;

  return NextResponse.json({ suggestion });
}
