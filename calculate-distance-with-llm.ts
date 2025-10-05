'use server';

/**
 * @fileOverview An AI agent to calculate the driving distance between two postal codes.
 *
 * - calculateDistanceWithLLM - A function that calculates the distance.
 * - CalculateDistanceWithLLMInput - The input type for the calculateDistanceWithLLM function.
 * - CalculateDistanceWithLLMOutput - The return type for the calculateDistanceWithLLM function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateDistanceWithLLMInputSchema = z.object({
  startPostalCode: z
    .string()
    .describe('The starting postal code, e.g., "00-001".'),
  endPostalCode: z
    .string()
    .describe('The ending postal code, e.g., "30-079".'),
});
export type CalculateDistanceWithLLMInput = z.infer<
  typeof CalculateDistanceWithLLMInputSchema
>;

const CalculateDistanceWithLLMOutputSchema = z.object({
  distance: z
    .number()
    .describe('The estimated driving distance in kilometers.'),
});
export type CalculateDistanceWithLLMOutput = z.infer<
  typeof CalculateDistanceWithLLMOutputSchema
>;

export async function calculateDistanceWithLLM(
  input: CalculateDistanceWithLLMInput
): Promise<CalculateDistanceWithLLMOutput> {
  return calculateDistanceWithLLMFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateDistancePrompt',
  input: {schema: CalculateDistanceWithLLMInputSchema},
  output: {schema: CalculateDistanceWithLLMOutputSchema},
  prompt: `You are an expert in Polish logistics and mapping.

  Your task is to calculate the approximate driving distance in kilometers between two Polish postal codes.

  Start Postal Code: {{{startPostalCode}}}
  End Postal Code: {{{endPostalCode}}}

  Provide only the estimated distance in kilometers as a number. Ensure the output is a valid JSON object.`,
});

const calculateDistanceWithLLMFlow = ai.defineFlow(
  {
    name: 'calculateDistanceWithLLMFlow',
    inputSchema: CalculateDistanceWithLLMInputSchema,
    outputSchema: CalculateDistanceWithLLMOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
