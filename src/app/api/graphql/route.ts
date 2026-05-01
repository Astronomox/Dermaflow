import { createSchema, createYoga } from 'graphql-yoga';
import { NextRequest } from 'next/server';
import { getUserIdentity } from '@/lib/user-storage';
import { getTelemetryForUser } from '@/lib/telemetry-storage';
import { getUserTelemetryStats, refreshMaterializedView } from '@/lib/materialized-view';
import { generatePredictiveModel } from '@/lib/predictive-modeling';
import { withErrorWrapping } from '@/lib/error-handler';
import { UserId } from '@/types/architecture';

const typeDefs = `
  type UserIdentity {
    id: ID!
    firebase_uid: String!
    email: String!
    created_at: String!
    updated_at: String!
  }

  type TelemetryPayload {
    id: ID!
    scanner_type: String!
    execution_latency_us: Int!
    data_throughput_mb_s: Float!
    error_probability: Float!
    anomaly_score: Float!
    timestamp: String!
  }

  type TelemetryStats {
    scanner_type: String!
    total_scans: Int!
    avg_latency: Float!
    avg_anomaly_score: Float!
    last_scan_time: String!
  }

  type PredictiveModel {
    forecasted_data_volume_mb: Float!
    projected_capacity_need_date: String!
    risk_growth_factor: Float!
  }

  type UserProfile {
    identity: UserIdentity
    telemetry: [TelemetryPayload!]!
    stats: [TelemetryStats!]!
    predictiveModel: PredictiveModel
  }

  type SystemHealthNotification {
    status: String!
    message: String!
    referenceId: String!
  }

  type UserProfileResponse {
    data: UserProfile
    error: SystemHealthNotification
  }

  type Query {
    userProfile(firebaseUid: String!): UserProfileResponse
    refreshStats: Boolean
  }
`;

const resolvers = {
  Query: {
    userProfile: async (_: any, { firebaseUid }: { firebaseUid: string }) => {
      const identity = await getUserIdentity(firebaseUid);
      if (!identity) {
        throw new Error('User not found');
      }

      return await withErrorWrapping('fetchUserProfile', identity.id as UserId, async () => {
        const telemetry = await getTelemetryForUser(identity.id);
        const stats = await getUserTelemetryStats(identity.id);
        const predictiveModel = await generatePredictiveModel(identity.id);

        return {
          identity,
          telemetry,
          stats,
          predictiveModel
        };
      });
    },
    refreshStats: async () => {
      await refreshMaterializedView();
      return true;
    }
  }
};

const schema = createSchema({
  typeDefs,
  resolvers,
});

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response }
});

export { handleRequest as GET, handleRequest as POST };
