import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { categorize } from "@/lib/ofx-categorizer";
import { parseOFX } from "@/lib/ofx-parser";
import { TransactionType, RecurrenceMode } from "@prisma/client";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const userId = session.user.id;

  // Parse multipart form-data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Requisição inválida. Envie um arquivo OFX." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Nenhum arquivo enviado." },
      { status: 400 },
    );
  }

  // Basic MIME / extension check — do not rely solely on MIME as browsers may vary
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".ofx") && !fileName.endsWith(".qfx")) {
    return NextResponse.json(
      { error: "Somente arquivos .ofx ou .qfx são aceitos." },
      { status: 400 },
    );
  }

  // Limit file size to 5 MB
  const MAX_BYTES = 5 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "O arquivo excede o limite de 5 MB." },
      { status: 400 },
    );
  }

  const content = await file.text();

  // Parse OFX
  let parsed;
  try {
    parsed = parseOFX(content);
  } catch {
    return NextResponse.json(
      { error: "Não foi possível interpretar o arquivo OFX." },
      { status: 422 },
    );
  }

  if (parsed.length === 0) {
    return NextResponse.json(
      { error: "Nenhuma transação encontrada no arquivo." },
      { status: 422 },
    );
  }

  // Resolve or create categories for each unique name
  const categoryNames = [...new Set(parsed.map((t) => categorize(t.description)))];
  const categoryMap = new Map<string, string>(); // name → id

  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { userId_name: { userId, name } },
      create: { userId, name },
      update: {},
      select: { id: true },
    });
    categoryMap.set(name, cat.id);
  }

  // Build transaction rows
  const rows = parsed.map((t) => {
    const categoryName = categorize(t.description);
    const categoryId = categoryMap.get(categoryName)!;
    return {
      userId,
      categoryId,
      description: t.description,
      amount: new Prisma.Decimal(t.amount),
      type: t.type === "INCOME" ? TransactionType.INCOME : TransactionType.EXPENSE,
      date: new Date(t.date),
      isSettled: true,
      paymentDate: new Date(t.date),
      recurrenceMode: RecurrenceMode.NONE,
    };
  });

  const result = await prisma.transaction.createMany({
    data: rows,
    skipDuplicates: false,
  });

  return NextResponse.json({ imported: result.count });
}
