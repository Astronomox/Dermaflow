'use server';

/**
 * @fileOverview A medical question answering AI agent.
 *
 * - medicalQuestionAnswering - A function that handles medical question answering related to skin conditions.
 * - MedicalQuestionAnsweringInput - The input type for the medicalQuestionAnswering function.
 * - MedicalQuestionAnsweringOutput - The return type for the medicalQuestionAnswering function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicalQuestionAnsweringInputSchema = z.object({
  question: z.string().describe('The medical question related to the skin condition.'),
});
export type MedicalQuestionAnsweringInput = z.infer<typeof MedicalQuestionAnsweringInputSchema>;

const MedicalQuestionAnsweringOutputSchema = z.object({
  answer: z.string().describe('The medically verified answer to the question, with citations to medical guidelines.'),
  recommendation: z.string().describe('A recommendation on whether to seek in-person consultation.'),
});
export type MedicalQuestionAnsweringOutput = z.infer<typeof MedicalQuestionAnsweringOutputSchema>;

export async function medicalQuestionAnswering(input: MedicalQuestionAnsweringInput): Promise<MedicalQuestionAnsweringOutput> {
  return medicalQuestionAnsweringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicalQuestionAnsweringPrompt',
  input: {schema: MedicalQuestionAnsweringInputSchema},
  output: {schema: MedicalQuestionAnsweringOutputSchema},
  prompt: `You are a medical expert specializing in dermatology. Provide medically verified answers to questions related to skin conditions, with citations to medical guidelines. Always suggest users seek in-person consultation if uncertain.

Question: {{{question}}}
`,
});

const medicalQuestionAnsweringFlow = ai.defineFlow(
  {
    name: 'medicalQuestionAnsweringFlow',
    inputSchema: MedicalQuestionAnsweringInputSchema,
    outputSchema: MedicalQuestionAnsweringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
