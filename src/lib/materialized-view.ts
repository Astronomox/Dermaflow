import { query } from './db';

export interface UserTelemetryStats {
  user_id: string;
  scanner_type: string;
  total_scans: number;
  avg_latency: number;
  avg_anomaly_score: number;
  last_scan_time: Date;
}

export async function refreshMaterializedView() {
  try {
    await query('REFRESH MATERIALIZED VIEW CONCURRENTLY user_telemetry_stats;');
  } catch (err) {
    console.error('Failed to refresh materialized view', err);
    // Fallback if concurrently fails (e.g., if index isn't used properly)
    await query('REFRESH MATERIALIZED VIEW user_telemetry_stats;');
  }
}

export async function getUserTelemetryStats(userId: string): Promise<UserTelemetryStats[]> {
  try {
    const res = await query(
      `SELECT * FROM user_telemetry_stats WHERE user_id = $1`,
      [userId]
    );
    return res.rows as UserTelemetryStats[];
  } catch (err) {
    console.error('Failed to fetch materialized view data', err);
    return [];
  }
}
