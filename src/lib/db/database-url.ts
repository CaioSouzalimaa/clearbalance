const toEncoded = (value?: string) => encodeURIComponent(value ?? "");

export const buildDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.PGHOST;
  const database = process.env.PGDATABASE;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;

  if (!host || !database || !user || !password) {
    throw new Error(
      "DATABASE_URL não definida e variáveis PGHOST/PGDATABASE/PGUSER/PGPASSWORD ausentes.",
    );
  }

  const sslmode = process.env.PGSSLMODE ?? "require";
  const channelBinding = process.env.PGCHANNELBINDING ?? "require";

  return `postgresql://${toEncoded(user)}:${toEncoded(password)}@${host}/${database}?sslmode=${sslmode}&channel_binding=${channelBinding}`;
};
