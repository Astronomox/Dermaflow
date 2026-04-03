'use server';

/**
 * @fileOverview A flow that generates personalized hygiene tips based on skin condition analysis.
 *
 * - personalizedHygieneTips - A function that generates personalized hygiene tips.
 * - PersonalizedHygieneTipsInput - The input type for the personalizedHygieneTips function.
 * - PersonalizedHygieneTipsOutput - The return type for the personalizedHygieneTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedHygieneTipsInputSchema = z.object({
  skinCondition: z
    .string()
    .describe('The skin condition of the user, e.g., oily, dry, sensitive, acne-prone.'),
  age: z.number().describe('The age of the user.'),
  lifestyle: z.string().describe('The lifestyle of the user, e.g., active, sedentary.'),
  climate: z
    .string()
    .describe('The climate the user lives in, e.g., humid, dry, cold, hot.'),
  concerns: z
    .string()
    .describe('The user concerns related to their skin, e.g., anti-aging, wrinkles, dark spots.'),
  analysisResult: z.string().optional().describe('The recent AI skin analysis assessment to tailor the advice.'),
  language: z.string().optional().describe('The language the answer should be provided in.'),
});
export type PersonalizedHygieneTipsInput = z.infer<typeof PersonalizedHygieneTipsInputSchema>;

const PersonalizedHygieneTipsOutputSchema = z.object({
  hygieneTips: z.string().describe('Personalized hygiene tips based on the skin condition.'),
});
export type PersonalizedHygieneTipsOutput = z.infer<typeof PersonalizedHygieneTipsOutputSchema>;

export async function personalizedHygieneTips(input: PersonalizedHygieneTipsInput): Promise<PersonalizedHygieneTipsOutput> {
  return personalizedHygieneTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedHygieneTipsPrompt',
  input: {schema: PersonalizedHygieneTipsInputSchema},
  output: {schema: PersonalizedHygieneTipsOutputSchema},
  prompt: `You are a helpful AI that provides personalized skincare and hygiene tips based on the user's profile.
Please provide clear, actionable steps for a morning and evening routine, along with general advice.
Respond in the following language: {{language}} (default to English if not specified).

Skin Condition: {{{skinCondition}}}
Age: {{{age}}}
Lifestyle: {{{lifestyle}}}
Climate: {{{climate}}}
Concerns: {{{concerns}}}
Recent Skin Analysis Assessment: {{{analysisResult}}}

Provide personalized hygiene tips:`,
});

const personalizedHygieneTipsFlow = ai.defineFlow(
  {
    name: 'personalizedHygieneTipsFlow',
    inputSchema: PersonalizedHygieneTipsInputSchema,
    outputSchema: PersonalizedHygieneTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
