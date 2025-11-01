'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a medication dashboard from a scanned prescription using AI.
 *
 * The flow takes the scanned prescription data as input and returns a structured JSON object representing the dashboard.
 * The dashboard includes medication names, dosage, timings, and status.
 *
 * @interface GenerateAiDashboardInput - The input type for the generateAiDashboard function.
 * @interface GenerateAiDashboardOutput - The output type for the generateAiDashboard function.
 * @function generateAiDashboard - A function that generates the medication dashboard.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiDashboardInputSchema = z.object({
  prescriptionText: z
    .string()
    .describe('The text extracted from the scanned prescription.'),
});
export type GenerateAiDashboardInput = z.infer<typeof GenerateAiDashboardInputSchema>;

const GenerateAiDashboardOutputSchema = z.object({
  dashboardData: z
    .string()
    .describe(
      'A JSON string representing the medication dashboard with medication names, dosage, timings, and status.'
    ),
});
export type GenerateAiDashboardOutput = z.infer<typeof GenerateAiDashboardOutputSchema>;

export async function generateAiDashboard(input: GenerateAiDashboardInput): Promise<GenerateAiDashboardOutput> {
  return generateAiDashboardFlow(input);
}

const generateAiDashboardPrompt = ai.definePrompt({
  name: 'generateAiDashboardPrompt',
  input: {schema: GenerateAiDashboardInputSchema},
  output: {schema: GenerateAiDashboardOutputSchema},
  prompt: `You are an AI assistant that generates a medication dashboard from a scanned prescription.
  The dashboard should be returned as a JSON string with the following structure:

  {
    "medications": [
      {
        "name": "Medication Name",
        "dosage": "Dosage",
        "timings": ["Timing1", "Timing2"],
        "status": "Taken | Snoozed | Missed"
      }
    ]
  }

  Here is the prescription text: {{{prescriptionText}}}
  Ensure that the JSON is valid and can be parsed without errors.
  `,
});

const generateAiDashboardFlow = ai.defineFlow(
  {
    name: 'generateAiDashboardFlow',
    inputSchema: GenerateAiDashboardInputSchema,
    outputSchema: GenerateAiDashboardOutputSchema,
  },
  async input => {
    const {output} = await generateAiDashboardPrompt(input);
    return output!;
  }
);
