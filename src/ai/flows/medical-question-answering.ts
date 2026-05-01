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

const MessageSchema = z.object({
  role: z.enum(['user', 'ai']),
  text: z.string()
});

const MedicalQuestionAnsweringInputSchema = z.object({
  question: z.string().describe('The medical question related to the skin condition.'),
  history: z.array(MessageSchema).optional().describe('The conversation history.'),
  language: z.string().optional().describe('The language the answer should be provided in.'),
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

const medicalQuestionAnsweringFlow = ai.defineFlow(
  {
    name: 'medicalQuestionAnsweringFlow',
    inputSchema: MedicalQuestionAnsweringInputSchema,
    outputSchema: MedicalQuestionAnsweringOutputSchema,
  },
  async input => {
    // We will build the chat history manually to inject into a standard ai.generate call
    // because definePrompt with a simple template doesn't easily iterate over the dynamic history array
    // without custom partials or formatting.

    let historyText = "";
    if (input.history && input.history.length > 0) {
      historyText = "Conversation History:\n" + input.history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join("\n") + "\n\n";
    }

    const res = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `You are a highly qualified medical expert specializing in dermatology.
Provide medically verified answers to questions related to skin conditions, with citations to medical guidelines if applicable.
Always suggest users seek in-person consultation for a proper diagnosis or if uncertain.

Please respond in the following language: ${input.language || 'English'} (default to English if not specified).

${historyText}
User Question: ${input.question}
`,
      output: {
        schema: MedicalQuestionAnsweringOutputSchema
      }
    });

    return res.output || { answer: "I could not generate an answer.", recommendation: "Consult a professional." };
  }
);
