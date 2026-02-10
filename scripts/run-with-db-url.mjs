import { spawn } from "node:child_process";

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Uso: node scripts/run-with-db-url.mjs <command> [...args]");
  process.exit(1);
}

const env = { ...process.env };

if (!env.DATABASE_URL) {
  const required = ["PGHOST", "PGDATABASE", "PGUSER", "PGPASSWORD"];
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    console.error(`Variáveis ausentes para montar DATABASE_URL: ${missing.join(", ")}`);
    process.exit(1);
  }

  const sslmode = env.PGSSLMODE ?? "require";
  const channelBinding = env.PGCHANNELBINDING ?? "require";
  const user = encodeURIComponent(env.PGUSER);
  const pass = encodeURIComponent(env.PGPASSWORD);

  env.DATABASE_URL = `postgresql://${user}:${pass}@${env.PGHOST}/${env.PGDATABASE}?sslmode=${sslmode}&channel_binding=${channelBinding}`;
}

const child = spawn(command, args, {
  stdio: "inherit",
  shell: true,
  env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
