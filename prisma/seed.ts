import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Hash da senha de teste: "senha123"
  const passwordHash = await bcrypt.hash("senha123", 10);

  // Criar usuário de teste
  const testUser = await prisma.user.upsert({
    where: { email: "teste@clearbalance.com" },
    update: {},
    create: {
      email: "teste@clearbalance.com",
      name: "Usuário Teste",
      passwordHash,
    },
  });

  console.log(`✅ Usuário de teste criado: ${testUser.email}`);
  console.log(`   Email: teste@clearbalance.com`);
  console.log(`   Senha: senha123`);

  // Categorias padrão de despesas
  const expenseCategories = [
    { name: "Alimentação", icon: "🍔", color: "#FF6B6B" },
    { name: "Transporte", icon: "🚗", color: "#4ECDC4" },
    { name: "Moradia", icon: "🏠", color: "#45B7D1" },
    { name: "Saúde", icon: "⚕️", color: "#96CEB4" },
    { name: "Educação", icon: "📚", color: "#FFEAA7" },
    { name: "Lazer", icon: "🎮", color: "#DDA15E" },
    { name: "Compras", icon: "🛒", color: "#BC6C25" },
    { name: "Contas", icon: "📄", color: "#606C38" },
    { name: "Outros", icon: "💰", color: "#283618" },
  ];

  // Categorias padrão de receitas
  const incomeCategories = [
    { name: "Salário", icon: "💼", color: "#52B788" },
    { name: "Freelance", icon: "💻", color: "#74C69D" },
    { name: "Investimentos", icon: "📈", color: "#95D5B2" },
    { name: "Outros Ganhos", icon: "💵", color: "#B7E4C7" },
  ];

  const allCategories = [...expenseCategories, ...incomeCategories];

  for (const category of allCategories) {
    await prisma.category.upsert({
      where: {
        userId_name: {
          userId: testUser.id,
          name: category.name,
        },
      },
      update: {},
      create: {
        name: category.name,
        icon: category.icon,
        color: category.color,
        userId: testUser.id,
      },
    });
  }

  console.log(`✅ ${allCategories.length} categorias criadas`);

  // Criar algumas metas de exemplo
  const goals = [
    {
      name: "Fundo de Emergência",
      targetAmount: 10000,
      currentAmount: 2500,
      deadline: new Date("2026-12-31"),
    },
    {
      name: "Viagem de Férias",
      targetAmount: 5000,
      currentAmount: 1200,
      deadline: new Date("2026-07-01"),
    },
  ];

  for (const goal of goals) {
    await prisma.goal.upsert({
      where: {
        // Not using unique constraint, so we'll just create if doesn't exist
        id: "", // This won't match, forcing create
      },
      update: {},
      create: {
        ...goal,
        userId: testUser.id,
      },
    });
  }

  console.log(`✅ ${goals.length} metas criadas`);
  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erro ao executar seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
