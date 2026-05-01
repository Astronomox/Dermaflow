const { Pool } = require('pg');

const pool = new Pool({
  user: 'dermaflow',
  host: 'localhost',
  database: 'dermaflow_db',
  password: 'password',
  port: 5432,
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Dual-Layer Storage: ACID-compliant user identity data
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firebase_uid VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Dual-Layer Storage: High-velocity scanner telemetry (simulating TimescaleDB locally)
    await client.query(`
      CREATE TABLE IF NOT EXISTS telemetry (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        scanner_type VARCHAR(50) NOT NULL,
        execution_latency_us INTEGER NOT NULL,
        data_throughput_mb_s NUMERIC(10, 2) NOT NULL,
        error_probability NUMERIC(5, 4) NOT NULL,
        anomaly_score NUMERIC(5, 4) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create an index on timestamp for time-series querying
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry(timestamp);
    `);

    // Create a materialized view for data-to-graph pipeline
    await client.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS user_telemetry_stats AS
      SELECT
        user_id,
        scanner_type,
        COUNT(*) as total_scans,
        AVG(execution_latency_us) as avg_latency,
        AVG(anomaly_score) as avg_anomaly_score,
        MAX(timestamp) as last_scan_time
      FROM telemetry
      GROUP BY user_id, scanner_type;
    `);

    // Create a unique index to allow refreshing concurrently
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_telemetry_stats ON user_telemetry_stats(user_id, scanner_type);
    `);

    await client.query('COMMIT');
    console.log('Database initialized successfully.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error initializing database', e);
  } finally {
    client.release();
    pool.end();
  }
}

initDB();