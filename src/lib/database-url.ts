const encode = (value: string) => encodeURIComponent(value);

export function buildDatabaseUrlFromPgEnv() {
  const host = process.env.PGHOST;
  const database = process.env.PGDATABASE;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const sslMode = process.env.PGSSLMODE ?? (process.env.NODE_ENV === "production" ? "require" : "disable");
  const channelBinding = process.env.PGCHANNELBINDING ?? "prefer";

  if (!host || !database || !user || !password) {
    return undefined;
  }

  const query = new URLSearchParams({
    schema: "public",
    sslmode: sslMode,
    channel_binding: channelBinding,
  });

  return `postgresql://${encode(user)}:${encode(password)}@${host}/${database}?${query.toString()}`;
}

export function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? buildDatabaseUrlFromPgEnv();
}
