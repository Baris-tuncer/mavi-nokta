import { Pool } from "pg";

const globalForPool = globalThis as unknown as { _pgPool?: Pool };

export function getPool(): Pool {
  if (!globalForPool._pgPool) {
    const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
    if (!url) {
      throw new Error("DATABASE_URL veya DIRECT_URL .env'de yok");
    }
    globalForPool._pgPool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      // Pooler arkada zaten transaction-mode pgbouncer; bağlantıyı kısa tut
      max: 10,
      idleTimeoutMillis: 30_000,
    });
  }
  return globalForPool._pgPool;
}

export async function dbQuery<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number }> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
}
