export interface TelemetryPayload {
  id: string;
  user_id: string;
  scanner_type: string;
  execution_latency_us: number;
  data_throughput_mb_s: number;
  error_probability: number;
  anomaly_score: number;
  timestamp: Date;
}

export interface UserIdentity {
  id: string;
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
  user_id: string;
  forecasted_data_volume_mb: number;
  projected_capacity_need_date: Date;
  risk_growth_factor: number;
}
