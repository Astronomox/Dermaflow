// Branded Types for Strict Structural Typing
export type Brand<K, T> = K & { __brand: T };

export type UserId = Brand<string, 'UserId'>;
export type TelemetryId = Brand<string, 'TelemetryId'>;

export interface TelemetryPayload {
  id: TelemetryId;
  user_id: UserId;
  scanner_type: string;
  execution_latency_us: number;
  data_throughput_mb_s: number;
  error_probability: number;
  anomaly_score: number;
  timestamp: Date;
}

export interface UserIdentity {
  id: UserId;
  firebase_uid: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface ScannerResult {
  assessment: string;
  confidence: number;
  heatmapOverlay?: string;
  refinedAssessment?: string;
  rationale?: string;
}

export interface PredictiveModel {
  user_id: UserId;
  forecasted_data_volume_mb: number;
  projected_capacity_need_date: Date;
  risk_growth_factor: number;
}
