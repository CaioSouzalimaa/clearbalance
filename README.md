# ClearBalance

**ClearBalance** é uma aplicação web moderna e confiável, projetada para ajudar os usuários a **gerenciar suas finanças pessoais** e participar de uma comunidade voltada para **o mercado financeiro**.

---

## 📝 Visão Geral

ClearBalance é uma **plataforma de controle de despesas pessoais** que permite aos usuários:

- Monitorar e controlar seus gastos através de **gráficos e dashboards claros**.
- Participar de uma **área de comunidade** para discussão sobre o mercado financeiro.

---

## 💻 Funcionalidades

- **Dashboard de Despesas:** Visualize receitas e gastos com gráficos intuitivos.
- **Fórum da Comunidade:** Compartilhe insights e aprenda com outros investidores.
- **Categorias Personalizáveis:** Organize despesas por categorias.
- **Design Responsivo:** Funciona perfeitamente em desktop e dispositivos móveis.

---

## ⚙️ Configuração rápida (Auth + DB)

1. Crie o arquivo `.env` baseado no exemplo:
   ```bash
   cp .env.example .env
   ```
2. Aplique as migrations:
   ```bash
   prisma migrate dev
   ```
3. Rode o projeto:
   ```bash
   npm run dev
   ```

## 🧪 Testes

```bash
npm test
```

## 🔒 Rotas privadas

As rotas privadas são definidas no `middleware.ts`. Para adicionar novas rotas protegidas, inclua os caminhos no array `protectedPaths` e no `matcher` para garantir que o middleware execute nessas URLs.
