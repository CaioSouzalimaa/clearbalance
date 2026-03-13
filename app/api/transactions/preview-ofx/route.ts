import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { categorize } from "@/lib/ofx-categorizer";
import { parseOFX } from "@/lib/ofx-parser";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const userId = session.user.id;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".ofx") && !fileName.endsWith(".qfx")) {
    return NextResponse.json(
      { error: "Somente arquivos .ofx ou .qfx são aceitos." },
      { status: 400 },
    );
  }

  const MAX_BYTES = 5 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "O arquivo excede o limite de 5 MB." }, { status: 400 });
  }

  const content = await file.text();

  let parsed;
  try {
    parsed = parseOFX(content);
  } catch {
    return NextResponse.json({ error: "Não foi possível interpretar o arquivo OFX." }, { status: 422 });
  }

  if (parsed.length === 0) {
    return NextResponse.json({ error: "Nenhuma transação encontrada no arquivo." }, { status: 422 });
  }

  // Fetch user's existing categories to try to match suggestions
  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true },
  });
  const categoryByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));

  const transactions = parsed.map((t) => {
    const suggestedName = categorize(t.description);
    const categoryId = categoryByName.get(suggestedName.toLowerCase()) ?? null;
    return {
      date: t.date,
      description: t.description,
      amount: t.amount,
      type: t.type,
      suggestedCategory: suggestedName,
      categoryId,
    };
  });

  return NextResponse.json({ transactions });
}
