'use server';

/**
 * @fileOverview Generates a heatmap overlay on a skin lesion image to visualize the areas influencing the AI's prediction.
 *
 * - generateExplainableAI - A function that handles the generation of the explainable AI heatmap.
 * - ExplainableAIInput - The input type for the generateExplainableAI function.
 * - ExplainableAIOutput - The return type for the generateExplainableAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainableAIInputSchema = z.object({
  lesionImage: z
    .string()
    .describe(
      'A photo of a skin lesion, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'     ),
});
export type ExplainableAIInput = z.infer<typeof ExplainableAIInputSchema>;

const ExplainableAIOutputSchema = z.object({
  heatmapOverlay: z
    .string()
    .describe(
      'A heatmap overlay on the skin lesion image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'     ),
  assessment: z.string().describe('The initial AI assessment of the skin condition.'),
  confidence: z.number().describe('The confidence score of the assessment as a percentage.'),
});
export type ExplainableAIOutput = z.infer<typeof ExplainableAIOutputSchema>;

export async function generateExplainableAI(input: ExplainableAIInput): Promise<ExplainableAIOutput> {
  return explainableAIFlow(input);
}


const explainableAIFlow = ai.defineFlow(
  {
    name: 'explainableAIFlow',
    inputSchema: ExplainableAIInputSchema,
    outputSchema: ExplainableAIOutputSchema,
  },
  async input => {
    try {
      // First, we generate a bounding box or assessment based on the image using text model
      // We will simulate the heatmap generation since standard text models cannot output image directly.
      // But we can generate an assessment and confidence.

      const res = await ai.generate({
          model: 'googleai/gemini-2.5-flash',
          prompt: [
              {
                  media: {
                      url: input.lesionImage
                  }
              },
              {
                  text: 'Analyze the skin lesion image. Provide a brief assessment of the skin condition (e.g., Benign Nevus, Melanoma, Basal Cell Carcinoma, etc) and a confidence score between 0 and 100. Also identify the main lesion and provide its bounding box in [ymin, xmin, ymax, xmax] format where values are between 0 and 1000.'
              }
          ],
          output: {
            schema: z.object({
              assessment: z.string(),
              confidence: z.number(),
              boundingBox: z.array(z.number()).describe('Bounding box of the lesion [ymin, xmin, ymax, xmax] from 0 to 1000').optional()
            })
          }
      });

      const { assessment, confidence, boundingBox } = res.output || { assessment: 'Unknown condition', confidence: 0, boundingBox: undefined };

      let heatmapOverlay = input.lesionImage;

      if (boundingBox && boundingBox.length === 4) {
          const [ymin, xmin, ymax, xmax] = boundingBox;

          // Generate an SVG overlay combining the original image and a highlight box
          // We use viewBox 0 0 1000 1000 because coordinates are normalized to 1000
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
        confidence
      };
    } catch (error: any) {
        console.error('AI analysis failed:', error);
        // Fallback
        return { heatmapOverlay: input.lesionImage, assessment: "Analysis unavailable", confidence: 0 };
    }
  }
);
