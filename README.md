# ClearBalance

Aplicação Next.js (App Router + TypeScript) com autenticação via NextAuth (Credentials), Prisma e Postgres.

## Requisitos

- Node.js 20+
- Docker + Docker Compose

## Variáveis de ambiente

Copie os exemplos para os arquivos reais:

```bash
cp .env.local.example .env.local
cp .env.example .env
```

### Variáveis suportadas

- `PGHOST`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `PGSSLMODE`
- `PGCHANNELBINDING`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

> A aplicação também consegue montar `DATABASE_URL` dinamicamente a partir das variáveis `PG*` em runtime (`src/lib/database-url.ts`). Para o Prisma CLI, mantenha `DATABASE_URL` definido no `.env`/`.env.local`.

## Subindo Postgres local (Docker)

```bash
docker compose up -d
```

O serviço sobe em `localhost:5432` com persistência em volume (`postgres_data`).

## Migrations (Prisma)

```bash
npm run prisma:migrate
npm run prisma:generate
```

## Rodando a aplicação

```bash
npm run dev
```

## Testes

```bash
npm test
npm run test:watch
npm run test:ci
```

Os testes unitários fazem mock de serviços/repos (sem Postgres real).

## Neon (produção)

Para produção na Neon, configure:

- `PGHOST` com host Neon
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `PGSSLMODE=require`
- `PGCHANNELBINDING=prefer` (ou `require`, conforme seu projeto)
- `DATABASE_URL` compatível com Prisma com `sslmode=require`

Exemplo:

```env
PGHOST=ep-xxx-xxx.us-east-2.aws.neon.tech
PGDATABASE=neondb
PGUSER=neondb_owner
PGPASSWORD=***
PGSSLMODE=require
PGCHANNELBINDING=prefer
DATABASE_URL=postgresql://neondb_owner:***@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?schema=public&sslmode=require&channel_binding=prefer
```

## Rotas privadas

As rotas privadas são protegidas por `middleware.ts`.

- Não autenticado em rota privada: redireciona para `/login`
- Autenticado tentando acessar `/login`: redireciona para `/dashboard`

Para adicionar novas rotas privadas, mantenha a rota fora da lista pública (`PUBLIC_ROUTES`) no middleware.
