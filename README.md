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

## 🚀 Setup Local

### Pré-requisitos

- Node.js 20+ e npm
- Docker e Docker Compose
- Git

### Passo a Passo

1. **Clone o repositório**

   ```bash
   git clone https://github.com/seu-usuario/clearbalance.git
   cd clearbalance
   ```

2. **Configure as variáveis de ambiente**

   ```bash
   cp .env.example .env.local
   ```

   O arquivo `.env.local` já vem configurado para uso local com Docker.

3. **Inicie o banco de dados PostgreSQL**

   ```bash
   docker-compose up -d
   ```

   Isso criará um container PostgreSQL rodando na porta 5432.

4. **Instale as dependências**

   ```bash
   npm install
   ```

   O comando `postinstall` automaticamente gerará o Prisma Client.

5. **Execute as migrations**

   ```bash
   npm run db:migrate:dev
   ```

   Isso criará todas as tabelas no banco de dados.

6. **Popule o banco com dados iniciais (opcional)**

   ```bash
   npm run db:seed
   ```

   Isso criará um usuário de teste e categorias padrão.

7. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000)

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento Next.js
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run db:studio` - Abre o Prisma Studio para visualizar/editar dados
- `npm run db:push` - Push do schema sem criar migration (dev rápido)
- `npm run db:migrate:dev` - Cria e aplica nova migration
- `npm run db:migrate:deploy` - Aplica migrations pendentes (produção)
- `npm run db:seed` - Popula banco com dados iniciais

---

## 🌐 Deploy na Vercel

### 1. Configurar Banco de Dados no Neon

1. Crie uma conta em [Neon](https://neon.tech)
2. Crie um novo projeto PostgreSQL
3. Copie a connection string (formato: `postgresql://user:password@ep-xxxxx.region.aws.neon.tech/database?sslmode=require`)

### 2. Deploy na Vercel

1. Faça push do código para GitHub
2. Conecte o repositório na [Vercel](https://vercel.com)
3. Configure as **variáveis de ambiente** no painel da Vercel:

   ```bash
   DATABASE_URL=postgresql://user:password@ep-xxxxx.region.aws.neon.tech/database?sslmode=require
   NEXTAUTH_SECRET=<gere com: openssl rand -base64 32>
   NEXTAUTH_URL=https://seu-projeto.vercel.app
   ```

4. Faça o deploy

### 3. Aplicar Migrations no Neon

Após o primeiro deploy, execute as migrations no banco de produção:

```bash
# Localmente, com DATABASE_URL apontando para Neon
DATABASE_URL="sua-connection-string-do-neon" npm run db:migrate:deploy
```

Ou configure um build command customizado na Vercel:

```bash
prisma migrate deploy && next build
```

### ⚠️ Importante

- **Nunca** commite arquivos `.env` ou `.env.local` no Git
- Use `.env.example` como template
- O `postinstall` script garante que o Prisma Client seja gerado automaticamente no build da Vercel
- Migrations devem ser aplicadas antes de usar a aplicação em produção

---

## 🗄️ Tecnologias

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Banco de Dados:** PostgreSQL (Docker local / Neon em produção)
- **Autenticação:** NextAuth.js
- **Gráficos:** Chart.js, react-chartjs-2
- **Deployment:** Vercel
