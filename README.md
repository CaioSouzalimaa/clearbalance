# ClearBalance

Aplicação Next.js (App Router) com autenticação via **NextAuth + Credentials**, persistência em **Postgres/Prisma** e testes unitários com **Jest**.

## Requisitos

- Node.js 20+
- Docker + Docker Compose

## Variáveis de ambiente

1. Copie o arquivo de exemplo local:

```bash
cp .env.local.example .env.local
```

2. Ajuste os valores conforme seu ambiente.

### Variáveis obrigatórias

- `DATABASE_URL` (montada a partir de `PG*`)
- `PGHOST`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `PGSSLMODE`
- `PGCHANNELBINDING`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Postgres local com Docker

Suba o banco local:

```bash
docker compose up -d
```

## Migrations Prisma

Com o banco rodando e `.env.local` configurado:

```bash
npm run prisma:migrate:dev
npm run prisma:generate
```

## Rodar o projeto

```bash
npm run dev
```

## Rodar testes

```bash
npm test
npm run test:watch
npm run test:ci
```

> Os testes unitários de serviços usam **mock do Prisma**, sem conexão com Postgres real.

## Produção com Neon

Configure no ambiente de produção:

- `PGHOST`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `PGSSLMODE=require`
- `PGCHANNELBINDING=require`

A `DATABASE_URL` deve ser formada dinamicamente a partir das variáveis acima. Exemplo:

```env
DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}"
```

## Rotas privadas

As rotas privadas são controladas em `middleware.ts` no array `privateRoutes`.

Para proteger novas rotas, adicione o prefixo desejado no array, por exemplo:

```ts
const privateRoutes = ["/dashboard", "/goals", "/categories", "/settings", "/reports"];
```

## Checklist operacional

Comandos principais:

- `docker compose up -d`
- `npm run prisma:migrate:dev`
- `npm run dev`
- `npm test`
