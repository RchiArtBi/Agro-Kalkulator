'use server';

/**
 * @fileOverview A transport cost calculation AI agent that uses an LLM to estimate costs.
 *
 * - calculateTransportCostWithLLM - A function that calculates the transport cost.
 * - CalculateTransportCostWithLLMInput - The input type for the calculateTransportCostWithLLM function.
 * - CalculateTransportCostWithLLMOutput - The return type for the calculateTransportCostWithLLM function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateTransportCostWithLLMInputSchema = z.object({
  distance: z.number().describe('The distance of the transport in kilometers.'),
  machineWeight: z.number().describe('The weight of the machine in kilograms.'),
  dimensions: z
    .string()
    .describe(
      'The dimensions of the machine, including length, width, and height in meters, separated by commas (e.g., 10,2.5,3).' // Corrected the example
    ),
  destination: z.string().describe('The destination of the transport.'),
  marketConditions: z
    .string()
    .optional()
    .describe('Current market conditions, such as fuel prices and tolls.'),
});
export type CalculateTransportCostWithLLMInput = z.infer<
  typeof CalculateTransportCostWithLLMInputSchema
>;

const CalculateTransportCostWithLLMOutputSchema = z.object({
  estimatedCost: z
    .number()
    .describe('The estimated transport cost in the destination currency.'),
  costBreakdown: z
    .string()
    .describe('A detailed breakdown of the cost, including base fare, surcharges, and taxes.'),
  currency: z.string().describe('The currency of the estimated cost.'),
});
export type CalculateTransportCostWithLLMOutput = z.infer<
  typeof CalculateTransportCostWithLLMOutputSchema
>;

export async function calculateTransportCostWithLLM(
  input: CalculateTransportCostWithLLMInput
): Promise<CalculateTransportCostWithLLMOutput> {
  return calculateTransportCostWithLLMFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateTransportCostWithLLMPrompt',
  input: {schema: CalculateTransportCostWithLLMInputSchema},
  output: {schema: CalculateTransportCostWithLLMOutputSchema},
  prompt: `You are an expert in transport cost estimation for agricultural machinery, specifically CLAAS machines.

  Based on the following information, estimate the transport cost. Take into account current market conditions to provide a realistic estimate.

  Distance: {{{distance}}} km
  Machine Weight: {{{machineWeight}}} kg
  Dimensions (L,W,H): {{{dimensions}}} meters
  Destination: {{{destination}}}
  Market Conditions: {{{marketConditions}}}

  Provide a detailed cost breakdown, including base fare, surcharges, and taxes.
  Specify the currency for the estimated cost.

  Ensure the output is a valid JSON object.`, // Ensuring JSON output
});

const calculateTransportCostWithLLMFlow = ai.defineFlow(
  {
    name: 'calculateTransportCostWithLLMFlow',
    inputSchema: CalculateTransportCostWithLLMInputSchema,
    outputSchema: CalculateTransportCostWithLLMOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
