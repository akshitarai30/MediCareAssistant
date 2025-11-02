'use server';
/**
 * @fileOverview A diet recommender AI agent.
 *
 * - recommendDiet - A function that handles the diet recommendation process.
 * - DietRecommenderInput - The input type for the recommendDiet function.
 * - DietRecommenderOutput - The return type for the recommendDiet function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DietRecommenderInputSchema = z.object({
  healthQuery: z.string().describe('The user query about their health issues and dietary needs.'),
});
export type DietRecommenderInput = z.infer<typeof DietRecommenderInputSchema>;

const DietRecommenderOutputSchema = z.object({
  recommendation: z.string().describe('The diet recommendation provided by the AI.'),
});
export type DietRecommenderOutput = z.infer<typeof DietRecommenderOutputSchema>;

export async function recommendDiet(input: DietRecommenderInput): Promise<DietRecommenderOutput> {
  return dietRecommenderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dietRecommenderPrompt',
  input: { schema: DietRecommenderInputSchema },
  output: { schema: DietRecommenderOutputSchema },
  prompt: `You are an expert nutritionist. A user is asking for diet recommendations based on their health issues. 
  
  Provide a helpful and safe diet recommendation based on the following health query. 
  
  IMPORTANT: Include a disclaimer that this is not medical advice and they should consult a doctor.

  User's Health Query: {{{healthQuery}}}`,
});

const dietRecommenderFlow = ai.defineFlow(
  {
    name: 'dietRecommenderFlow',
    inputSchema: DietRecommenderInputSchema,
    outputSchema: DietRecommenderOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
