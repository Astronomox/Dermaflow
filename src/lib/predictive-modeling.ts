import { query } from './db';
import { PredictiveModel, UserId } from '@/types/architecture';

/**
 * Materialized Intelligence:
 * Fetches pre-computed 'Intelligence Blocks' directly from the Materialized View layer.
 * NO RAW MATH is performed in this resolver.
 */
export async function generatePredictiveModel(userId: UserId): Promise<PredictiveModel | null> {
  try {
    const res = await query(
      `SELECT * FROM predictive_intelligence_blocks WHERE user_id = $1`,
      [userId]
    );

    if (res.rows.length === 0) {
      return null;
    }

    const row = res.rows[0];
    const riskGrowthFactor = parseFloat(row.risk_growth_factor) || 0.1;
    const forecastedDataVolumeMB = parseFloat(row.forecasted_data_volume_mb) || 0;

    // The date projection still requires instantiation based on the pre-computed risk factor
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + (100 / Math.max(0.1, riskGrowthFactor)));

    return {
      user_id: userId,
      forecasted_data_volume_mb: Number(forecastedDataVolumeMB.toFixed(2)),
      projected_capacity_need_date: projectedDate,
      risk_growth_factor: Number(riskGrowthFactor.toFixed(4))
    };
  } catch (err) {
    console.error('Failed to fetch predictive intelligence blocks', err);
    return null;
  }
}
