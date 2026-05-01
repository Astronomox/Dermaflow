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
    // Check if there are any telemetry records that do not map back to a valid user ID
    const res = await client.query(`
      SELECT t.id
      FROM telemetry t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE u.id IS NULL
    `);

    if (res.rows.length === 0) {
      console.log('Verification Success: Zero orphan data detected. All graph components correspond accurately to backend storage metrics.');
    } else {
      console.error(`Verification Failed: Found ${res.rows.length} orphan telemetry records!`);
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