import { insertTelemetry } from './telemetry-storage';
import { UserId } from '@/types/architecture';

export interface SystemHealthNotification {
  status: 'error' | 'fatal' | 'degraded';
  message: string;
  referenceId: string;
}

export async function withErrorWrapping<T>(
  operationName: string,
  userId: UserId | null,
  fn: () => Promise<T>
): Promise<{ data?: T; error?: SystemHealthNotification }> {
  try {
    const data = await fn();
    return { data };
  } catch (err: any) {
    const referenceId = `ERR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    console.error(`[Global Exception Filter] Operation: ${operationName} | Ref: ${referenceId}`, err);

    // Log the error to telemetry if a user context exists
    if (userId) {
      await insertTelemetry(userId, {
        scanner_type: `sys-fault:${operationName}`,
        execution_latency_us: 0,
        data_throughput_mb_s: 0,
        error_probability: 1.0,
        anomaly_score: 1.0,
      }).catch(e => console.error('Failed to log error to telemetry', e));
    }

    return {
      error: {
        status: 'error',
        message: 'A system fault occurred. Our engineering team has been notified via telemetry.',
        referenceId,
      }
    };
  }
}
