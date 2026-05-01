import { query } from './db';
import { TelemetryPayload, UserId, TelemetryId } from '@/types/architecture';

export async function insertTelemetry(
  userId: UserId,
  telemetry: Omit<TelemetryPayload, 'id' | 'timestamp' | 'user_id'>
): Promise<TelemetryPayload | null> {
  try {
    const res = await query(
      `INSERT INTO telemetry (
        user_id, scanner_type, execution_latency_us, data_throughput_mb_s, error_probability, anomaly_score
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        userId,
        telemetry.scanner_type,
        telemetry.execution_latency_us,
        telemetry.data_throughput_mb_s,
        telemetry.error_probability,
        telemetry.anomaly_score
      ]
    );
    return res.rows[0] as TelemetryPayload;
  } catch (err) {
    console.error('Failed to insert telemetry', err);
    return null;
  }
}

export async function insertDeepTraceLog(
  userId: UserId,
  telemetryId: TelemetryId,
  payload: any
): Promise<void> {
  try {
    await query(
      `INSERT INTO deep_trace_logs (user_id, telemetry_id, trace_payload) VALUES ($1, $2, $3)`,
      [userId, telemetryId, JSON.stringify(payload)]
    );
  } catch (err) {
    console.error('Failed to insert deep trace log', err);
  }
}

export async function getTelemetryForUser(userId: UserId): Promise<TelemetryPayload[]> {
  try {
    const res = await query(`SELECT * FROM telemetry WHERE user_id = $1 AND is_archived = FALSE ORDER BY timestamp DESC`, [userId]);
    return res.rows as TelemetryPayload[];
  } catch (err) {
    console.error('Failed to fetch telemetry', err);
    return [];
  }
}
