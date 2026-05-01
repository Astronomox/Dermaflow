const { Pool } = require('pg');

const pool = new Pool({
  user: 'dermaflow',
  host: 'localhost',
  database: 'dermaflow_db',
  password: 'password',
  port: 5432,
});

async function verifyOrphanData() {
  const client = await pool.connect();
  console.log('Validating system integrity and searching for orphan data...');

  try {
    // Create an artificial orphan record
    await client.query(`
      INSERT INTO telemetry (
        scanner_type, execution_latency_us, data_throughput_mb_s, error_probability, anomaly_score
      ) VALUES ('orphan-test', 0, 0, 0, 0)
    `);

    // Execute Zero-Orphan Policy logic to flag it
    const archiveRes = await client.query(`
      UPDATE telemetry
      SET is_archived = TRUE
      WHERE is_archived = FALSE
      AND (
        user_id IS NULL OR
        user_id NOT IN (SELECT id FROM users)
      )
      RETURNING id;
    `);

    console.log(`[Zero-Orphan Policy] Archived ${archiveRes.rowCount} orphan telemetry records.`);

    // Check if there are any active (unarchived) telemetry records that are orphans
    const res = await client.query(`
      SELECT t.id
      FROM telemetry t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE u.id IS NULL AND t.is_archived = FALSE
    `);

    if (res.rows.length === 0) {
      console.log('Verification Success: Zero orphan data detected. All active graph components correspond accurately to backend storage metrics.');
    } else {
      console.error(`Verification Failed: Found ${res.rows.length} active orphan telemetry records!`);
    }

    // Verify materialized view counts match telemetry raw data
    const mvRes = await client.query(`SELECT SUM(total_scans) as total_mv FROM user_telemetry_stats`);
    const rawRes = await client.query(`SELECT COUNT(*) as total_raw FROM telemetry`);

    const mvCount = parseInt(mvRes.rows[0].total_mv || 0, 10);
    const rawCount = parseInt(rawRes.rows[0].total_raw || 0, 10);

    if (mvCount === rawCount) {
      console.log('Verification Success: Materialized View data matches raw telemetry data perfectly.');
    } else {
      console.log(`Verification Warning: Materialized View count (${mvCount}) does not match Raw count (${rawCount}). Did you run a concurrent refresh?`);
    }

  } catch (err) {
    console.error('Validation test failed!', err);
  } finally {
    client.release();
    pool.end();
  }
}

verifyOrphanData();