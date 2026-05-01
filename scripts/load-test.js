const { Pool } = require('pg');

const pool = new Pool({
  user: 'dermaflow',
  host: 'localhost',
  database: 'dermaflow_db',
  password: 'password',
  port: 5432,
});

async function runLoadTest() {
  const client = await pool.connect();
  console.log('Starting stress test on scanner-to-storage pipeline (10x volume)');

  try {
    // 1. Setup a test user
    const userRes = await client.query(`
      INSERT INTO users (firebase_uid, email)
      VALUES ('stress_test_uid', 'stress@test.com')
      ON CONFLICT (firebase_uid) DO UPDATE SET email = EXCLUDED.email
      RETURNING id;
    `);
    const userId = userRes.rows[0].id;

    const testVolume = 1000; // Simulating 10x the standard concurrent payload
    console.log(`Generating ${testVolume} concurrent telemetry payloads...`);

    const start = Date.now();
    const promises = [];

    for (let i = 0; i < testVolume; i++) {
      const p = client.query(`
        INSERT INTO telemetry (
          user_id, scanner_type, execution_latency_us, data_throughput_mb_s, error_probability, anomaly_score
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        userId,
        i % 2 === 0 ? 'explainable-ai' : 'refine-risk-assessment',
        Math.floor(Math.random() * 50000) + 10000,
        (Math.random() * 5).toFixed(2),
        (Math.random() * 0.05).toFixed(4),
        (Math.random() * 0.1).toFixed(4)
      ]);
      promises.push(p);
    }

    await Promise.all(promises);
    const end = Date.now();
    console.log(`Successfully ingested ${testVolume} records in ${end - start}ms.`);

    // Refresh materialized view to test ingestion to graph pipeline performance
    console.log('Refreshing materialized view...');
    const refreshStart = Date.now();
    await client.query('REFRESH MATERIALIZED VIEW user_telemetry_stats;');
    console.log(`Materialized view refreshed in ${Date.now() - refreshStart}ms.`);

  } catch (err) {
    console.error('Load test failed!', err);
  } finally {
    client.release();
    pool.end();
  }
}

runLoadTest();
