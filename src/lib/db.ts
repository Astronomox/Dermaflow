import { Pool } from 'pg';

// Using a standard Postgres pool for both relational and time-series data
// In a true enterprise environment, telemetry might point to a separate TimescaleDB URL
export const db = new Pool({
  user: process.env.DB_USER || 'dermaflow',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'dermaflow_db',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await db.query(text, params);
  const duration = Date.now() - start;
  // Deep Linking / Profiling: we can track the latency of all storage interactions
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DB] executed query`, { text, duration, rows: res.rowCount });
  }
  return res;
}
