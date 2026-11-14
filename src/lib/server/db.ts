import pg from "pg";

/** One pool per server instance. Neon's pooled URL and a local Postgres both work. */
const g = globalThis as unknown as { __pool?: pg.Pool };

export function pool(): pg.Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  g.__pool ??= new pg.Pool({ connectionString: url, max: 5, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 4_000 });
  return g.__pool;
}

export const hasDb = () => Boolean(process.env.DATABASE_URL);

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(text: string, params: unknown[] = []): Promise<pg.QueryResult<T>> {
  return pool().query<T>(text, params);
}
