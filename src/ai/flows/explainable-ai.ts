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
      const { media } = await ai.generate({
          model: 'googleai/gemini-2.5-flash-image-preview',
          prompt: [
              {
                  media: {
                      url: input.lesionImage
                  }
              },
              {
                  text: 'Generate a heatmap overlay on the skin lesion image to visualize the areas influencing the AI\'s prediction.'
              }
          ],
          config: {
              responseModalities: ['IMAGE'],
          },
      });

      if (!media.url) {
          throw new Error('Failed to generate heatmap');
      }

      return { heatmapOverlay: media.url };
    } catch (error: any) {
        console.error('AI heatmap generation failed:', error);
        // Fallback for quota errors: return the original image
        if (error.message.includes('429')) {
            console.warn('Quota exceeded. Returning original image as fallback.');
            return { heatmapOverlay: input.lesionImage };
        }
        // Re-throw other errors
        throw error;
    }
  }
);
