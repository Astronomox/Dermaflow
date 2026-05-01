'use server';
/**
 * @fileOverview Implements a Genkit flow to refine skin lesion risk assessment using a questionnaire.
 *
 * refineRiskAssessment - An async function that takes lesion characteristics and refines the initial risk assessment.
 * RefineRiskAssessmentInput - The input type for refineRiskAssessment, including lesion characteristics.
 * RefineRiskAssessmentOutput - The output type, providing a refined risk assessment and rationale.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { insertTelemetry, insertDeepTraceLog } from '@/lib/telemetry-storage';
import { UserId } from '@/types/architecture';
import path from 'path';

const RefineRiskAssessmentInputSchema = z.object({
  initialAssessment: z
    .string()
    .describe('The initial risk assessment provided by the AI.'),
  duration: z.string().describe('How long has the lesion been present?'),
  bleeding: z.string().describe('Does the lesion bleed? (yes/no)'),
  itching: z.string().describe('Does the lesion itch? (yes/no)'),
  size: z.string().describe('What is the approximate size of the lesion?'),
  colorChange: z
    .string()
    .describe('Has the color of the lesion changed recently? (yes/no)'),
});
export type RefineRiskAssessmentInput = z.infer<typeof RefineRiskAssessmentInputSchema>;

const RefineRiskAssessmentOutputSchema = z.object({
  refinedAssessment: z
    .string()
    .describe('The refined risk assessment based on the questionnaire.'),
  rationale: z
    .string()
    .describe(
      'Explanation of how the questionnaire responses influenced the risk assessment.'
    ),
});
export type RefineRiskAssessmentOutput = z.infer<typeof RefineRiskAssessmentOutputSchema>;

// Simulate Piscina import since it might need specific handling in Next.js Edge/Server
let Piscina: any;
try {
  Piscina = require('piscina');
} catch (e) {
  // Mock fallback if running in environments where Piscina isn't available
}

export async function refineRiskAssessment(input: RefineRiskAssessmentInput, userId?: UserId): Promise<RefineRiskAssessmentOutput> {
  const result = await refineRiskAssessmentFlow(input);

  if (userId) {
    try {
      let telemetryData;
      if (Piscina && typeof window === 'undefined') {
        const pool = new Piscina({
          filename: path.resolve(process.cwd(), 'src/ai/workers/scanner-worker.js')
        });
        telemetryData = await pool.run(JSON.stringify(input));
      } else {
        // Fallback synchronous calculation if worker fails or on client
        const start = process.hrtime.bigint();
        for (let i = 0; i < 1e6; i++) Math.random(); // light mock
        const end = process.hrtime.bigint();
        telemetryData = {
          execution_latency_us: Number(end - start) / 1000,
          data_throughput_mb_s: 0.5,
          error_probability: 0.005,
          anomaly_score: 0.01
        };
      }

      const insertedTelemetry = await insertTelemetry(userId, {
        scanner_type: 'refine-risk-assessment',
        ...telemetryData
      });

      // Heuristic Feedback Loop
      if (insertedTelemetry && insertedTelemetry.anomaly_score > 0.08) {
        await insertDeepTraceLog(userId, insertedTelemetry.id, {
          input_size_kb: JSON.stringify(input).length / 1024,
          detected_anomaly: insertedTelemetry.anomaly_score,
          refined_assessment: result.refinedAssessment,
          timestamp: new Date().toISOString()
        });
      }

    } catch (err) {
      console.error('Failed to run scanner worker for telemetry', err);
    }
  }

  return result;
}

const prompt = ai.definePrompt({
  name: 'refineRiskAssessmentPrompt',
  input: {schema: RefineRiskAssessmentInputSchema},
  output: {schema: RefineRiskAssessmentOutputSchema},
  prompt: `You are a dermatology expert refining an initial risk assessment of a skin lesion based on additional information provided through a questionnaire.

  Initial Assessment: {{{initialAssessment}}}

  Questionnaire Responses:
  - Duration: {{{duration}}}
  - Bleeding: {{{bleeding}}}
  - Itching: {{{itching}}}
  - Size: {{{size}}}
  - Color Change: {{{colorChange}}}

  Based on the initial assessment and the questionnaire responses, provide a refined risk assessment and explain how the responses influenced your assessment.  Consider factors like the duration, presence of bleeding or itching, size changes, and color changes in relation to the initial assessment.

  Refined Assessment:  (Provide a concise refined assessment here)
  Rationale: (Explain how the questionnaire responses led to the refined assessment.)`,
});

const refineRiskAssessmentFlow = ai.defineFlow(
  {
    name: 'refineRiskAssessmentFlow',
    inputSchema: RefineRiskAssessmentInputSchema,
    outputSchema: RefineRiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
