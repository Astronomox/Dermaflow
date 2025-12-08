'use server';

/**
 * @fileOverview A flow that converts text to speech using a generative model.
 *
 * - textToSpeech - A function that handles the text-to-speech conversion.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
  language: z.string().describe('The language of the text (e.g., "en", "yo").'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioUrl: z
    .string()
    .describe(
      'A data URI of the generated audio in WAV format. Format: \'data:audio/wav;base64,<encoded_data>\'.'
    ),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

// Simple mapping from language code to a voice name.
// This can be expanded with more voices.
const languageToVoice: Record<string, string> = {
    en: 'Algenib', // English
    yo: 'Achernar', // Yoruba - using a different voice for variety
    sw: 'Algenib', // Swahili
    ha: 'Achernar', // Hausa
    ig: 'Algenib', // Igbo
    zu: 'Achernar', // Zulu
}


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text, language }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: languageToVoice[language] || 'Algenib' },
          },
        },
      },
      prompt: text,
    });

    if (!media?.url) {
      throw new Error('No audio media returned from the AI model.');
    }
    
    // The returned audio is PCM in a data URI, we need to convert it to WAV
    const pcmBase64 = media.url.substring(media.url.indexOf(',') + 1);
    const audioBuffer = Buffer.from(pcmBase64, 'base64');
    
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioUrl: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
