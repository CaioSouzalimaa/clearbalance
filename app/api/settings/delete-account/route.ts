import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const userId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const password: string | undefined = (body as { password?: string }).password;

  if (!password) {
    return NextResponse.json(
      { error: "Senha obrigatória" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 },
    );
  }

  if (!user.passwordHash) {
    return NextResponse.json(
      { error: "Não é possível verificar a senha desta conta" },
      { status: 400 },
    );
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const anonymousHash = crypto.randomBytes(8).toString("hex");
  const anonymousEmail = `deleted_${anonymousHash}@removed.invalid`;

  // Anonymize all data in a single transaction — nothing is deleted,
  // so financial history is preserved but cannot be attributed to anyone.
  await prisma.$transaction(async (tx) => {
    // Anonymize user record
    await tx.user.update({
      where: { id: userId },
      data: {
        name: "Usuário removido",
        email: anonymousEmail,
        passwordHash: null,
        image: null,
        emailVerified: null,
      },
    });

    // Invalidate all active sessions
    await tx.session.deleteMany({ where: { userId } });

    // Remove linked OAuth accounts
    await tx.account.deleteMany({ where: { userId } });

    // Anonymize transaction descriptions
    await tx.transaction.updateMany({
      where: { userId },
      data: { description: "Transação removida" },
    });

    // Anonymize goal names
    await tx.goal.updateMany({
      where: { userId },
      data: { name: "Meta removida" },
    });

    // Anonymize category names — append id fragment to avoid unique constraint violation
    const categories = await tx.category.findMany({
      where: { userId },
      select: { id: true },
    });
    await Promise.all(
      categories.map((c) =>
        tx.category.update({
          where: { id: c.id },
          data: { name: `Categoria removida ${c.id.slice(-6)}`, icon: null, color: null },
        }),
      ),
    );
  });

  return NextResponse.json({ ok: true });
}
