'use server';

/**
 * @fileOverview Generates a heatmap overlay on a skin lesion image to visualize
 * the areas influencing the AI's prediction.
 *
 * FIXES from original:
 * 1. No more silent fallback to "Analysis unavailable" with 0 confidence.
 *    Errors now throw with specific, actionable messages.
 * 2. Distinguishes between API key issues, rate limits, network errors, and
 *    invalid image inputs.
 * 3. Validates that the AI actually returned structured output before using it.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainableAIInputSchema = z.object({
  lesionImage: z
    .string()
    .describe(
      "A photo of a skin lesion, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExplainableAIInput = z.infer<typeof ExplainableAIInputSchema>;

const ExplainableAIOutputSchema = z.object({
  heatmapOverlay: z
    .string()
    .describe(
      "A heatmap overlay on the skin lesion image, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  assessment: z.string().describe('The initial AI assessment of the skin condition.'),
  confidence: z.number().describe('The confidence score of the assessment as a percentage.'),
});
export type ExplainableAIOutput = z.infer<typeof ExplainableAIOutputSchema>;

// ── Error classification ──
function classifyAndThrow(error: any): never {
  const msg = error?.message?.toLowerCase?.() || '';
  const code = error?.code || '';
  const status = error?.status || error?.httpStatus || 0;

  // API key issues
  if (msg.includes('api key') || msg.includes('api_key') || code === 'PERMISSION_DENIED' || status === 403) {
    throw new Error(
      'DERMAFLOW_API_ERROR: The Gemini API key is missing or invalid. ' +
      'Check that NEXT_PUBLIC_GEMINI_API_KEY is set in your .env.local file and is a valid key.'
    );
  }

  // Rate limiting
  if (msg.includes('rate limit') || msg.includes('quota') || msg.includes('resource exhausted') || status === 429) {
    throw new Error(
      'DERMAFLOW_RATE_LIMIT: The AI analysis service is temporarily overloaded. ' +
      'Please wait a moment and try again. If this persists, the API quota may be exceeded.'
    );
  }

  // Safety filters
  if (msg.includes('safety') || msg.includes('blocked') || msg.includes('harm')) {
    throw new Error(
      'DERMAFLOW_SAFETY_FILTER: The image was blocked by the AI safety filter. ' +
      'Please ensure you are uploading a clear photo of a skin lesion. ' +
      'Non-medical images may be rejected.'
    );
  }

  // Network / timeout
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('timeout') || msg.includes('econnrefused')) {
    throw new Error(
      'DERMAFLOW_NETWORK_ERROR: Could not connect to the AI analysis service. ' +
      'Check your internet connection and try again.'
    );
  }

  // Invalid input
  if (msg.includes('invalid') && (msg.includes('image') || msg.includes('base64') || msg.includes('media'))) {
    throw new Error(
      'DERMAFLOW_INVALID_INPUT: The uploaded image could not be processed. ' +
      'Please upload a clear JPEG or PNG photo of the skin lesion.'
    );
  }

  // Generic — still throw, never swallow
  throw new Error(
    `DERMAFLOW_AI_ERROR: Skin analysis failed unexpectedly. ` +
    `Details: ${error?.message || 'Unknown error'}. ` +
    `Please try again. If this keeps happening, the AI service may be down.`
  );
}

export async function generateExplainableAI(input: ExplainableAIInput): Promise<ExplainableAIOutput> {
  return explainableAIFlow(input);
}

const explainableAIFlow = ai.defineFlow(
  {
    name: 'explainableAIFlow',
    inputSchema: ExplainableAIInputSchema,
    outputSchema: ExplainableAIOutputSchema,
  },
  async (input) => {
    // Validate input before calling API
    if (!input.lesionImage || !input.lesionImage.startsWith('data:')) {
      throw new Error(
        'DERMAFLOW_INVALID_INPUT: No valid image provided. ' +
        'Please upload or capture a photo of the skin lesion.'
      );
    }

    let res;
    try {
      res = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: [
          {
            media: {
              url: input.lesionImage,
            },
          },
          {
            text: 'Analyze the skin lesion image. Provide a brief assessment of the skin condition (e.g., Benign Nevus, Melanoma, Basal Cell Carcinoma, etc) and a confidence score between 0 and 100. Also identify the main lesion and provide its bounding box in [ymin, xmin, ymax, xmax] format where values are between 0 and 1000.',
          },
        ],
        output: {
          schema: z.object({
            assessment: z.string(),
            confidence: z.number(),
            boundingBox: z
              .array(z.number())
              .describe('Bounding box of the lesion [ymin, xmin, ymax, xmax] from 0 to 1000')
              .optional(),
          }),
        },
      });
    } catch (error: any) {
      console.error('[DERMAFLOW] AI generate() call failed:', {
        errorType: error?.constructor?.name,
        code: error?.code,
        message: error?.message,
        status: error?.status || error?.httpStatus,
        timestamp: new Date().toISOString(),
      });
      classifyAndThrow(error);
    }

    // Validate that the AI actually returned structured output
    if (!res.output) {
      console.error('[DERMAFLOW] AI returned empty output — model may have refused or returned unstructured text');
      throw new Error(
        'DERMAFLOW_AI_ERROR: The AI model did not return a structured analysis. ' +
        'This can happen if the image is unclear or not a skin lesion. ' +
        'Please try with a clearer, well-lit photo.'
      );
    }

    const { assessment, confidence, boundingBox } = res.output;

    // Validate the output makes sense
    if (!assessment || assessment.trim().length === 0) {
      throw new Error(
        'DERMAFLOW_AI_ERROR: The AI could not identify a skin condition in this image. ' +
        'Please upload a clear, close-up photo of the skin lesion.'
      );
    }

    // Generate heatmap overlay
    let heatmapOverlay = input.lesionImage;

    if (boundingBox && boundingBox.length === 4) {
      const [ymin, xmin, ymax, xmax] = boundingBox;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
        <image href="${input.lesionImage}" x="0" y="0" width="1000" height="1000" preserveAspectRatio="none" />
        <rect x="${xmin}" y="${ymin}" width="${Math.max(10, xmax - xmin)}" height="${Math.max(10, ymax - ymin)}" fill="rgba(239, 68, 68, 0.4)" stroke="rgba(239, 68, 68, 0.8)" stroke-width="8" rx="20" />
        <defs>
          <filter id="blur">
            <feGaussianBlur stdDeviation="15" />
          </filter>
        </defs>
        <ellipse cx="${(xmin + xmax) / 2}" cy="${(ymin + ymax) / 2}" rx="${(xmax - xmin) / 2 + 30}" ry="${(ymax - ymin) / 2 + 30}" fill="rgba(239, 68, 68, 0.3)" filter="url(#blur)" pointer-events="none" />
      </svg>`;

      if (typeof window === 'undefined') {
        heatmapOverlay = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      } else {
        heatmapOverlay = `data:image/svg+xml;base64,${btoa(svg)}`;
      }
    }

    return {
      heatmapOverlay,
      assessment,
      confidence: Math.max(0, Math.min(100, confidence)),
    };
  }
);
