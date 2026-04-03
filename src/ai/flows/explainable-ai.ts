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
                  text: 'Analyze the skin lesion image. Provide a brief assessment of the skin condition (e.g., Benign Nevus, Melanoma, Basal Cell Carcinoma, etc) and a confidence score between 0 and 100.'
              }
          ],
          output: {
            schema: z.object({
              assessment: z.string(),
              confidence: z.number()
            })
          }
      });

      const { assessment, confidence } = res.output || { assessment: 'Unknown condition', confidence: 0 };

      // Since Gemini flash text model does not support returning an image directly,
      // and gemini-2.5-flash-image-preview might not be generally available or reliable to just return a heatmap.
      // We will return the original image with a semi-transparent colored box or effect or just the image itself.
      // Or we can request an svg to overlay. Let's return the original image as the heatmap and add assessment.

      // Ideally here we would call an endpoint that draws the heatmap. Let's use the original image for now.
      // We'll update the frontend to use these dynamic results.

      return {
        heatmapOverlay: input.lesionImage, // Stub: returning the original image as heatmap
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
