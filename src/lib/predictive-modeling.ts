import { getUserTelemetryStats } from './materialized-view';
import { PredictiveModel } from '@/types/architecture';

export async function generatePredictiveModel(userId: string): Promise<PredictiveModel | null> {
  const stats = await getUserTelemetryStats(userId);
  if (!stats || stats.length === 0) return null;

  let totalScans = 0;
  let avgLatency = 0;
  let maxAnomalyScore = 0;

  stats.forEach(stat => {
    totalScans += parseInt(stat.total_scans as any, 10);
    avgLatency += parseFloat(stat.avg_latency as any);
    if (stat.avg_anomaly_score > maxAnomalyScore) {
      maxAnomalyScore = parseFloat(stat.avg_anomaly_score as any);
    }
  });

  avgLatency = avgLatency / stats.length;

  // Simple Predictive Modeling Heuristic
  // Growth Factor based on usage volume and anomaly severity
  const riskGrowthFactor = (totalScans * 0.1) + (maxAnomalyScore * 5);

  // Forecasted volume for the next 30 days (mock assumption: 5MB per scan)
  const forecastedDataVolumeMB = (totalScans / 30) * 30 * 1.5 * 5;

  // Project when capacity might be needed (e.g. storage limit reached)
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + (100 / Math.max(0.1, riskGrowthFactor)));

  return {
    user_id: userId,
    forecasted_data_volume_mb: Number(forecastedDataVolumeMB.toFixed(2)),
    projected_capacity_need_date: projectedDate,
    risk_growth_factor: Number(riskGrowthFactor.toFixed(4))
  };
}
