'use server';
/**
 * @fileOverview Summarizes a user's financial data in the context of a specific goal.
 *
 * - summarizeFinancialData - A function that summarizes financial data based on a user's goal.
 * - FinancialSummaryInput - The input type for the summarizeFinancialData function.
 * - FinancialSummaryOutput - The return type for the summarizeFinancialData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialSummaryInputSchema = z.object({
  financialData: z.string().describe('A JSON string containing the user\'s financial account data.'),
  goal: z.string().describe('The user\'s financial goal (e.g., retirement, buying a house).'),
  userPrompt: z.string().describe('The user prompt to the chat bot.'),
});
export type FinancialSummaryInput = z.infer<typeof FinancialSummaryInputSchema>;

const FinancialSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the user\'s financial data in the context of their goal.'),
});
export type FinancialSummaryOutput = z.infer<typeof FinancialSummaryOutputSchema>;

export async function summarizeFinancialData(input: FinancialSummaryInput): Promise<FinancialSummaryOutput> {
  return financialSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialSummaryPrompt',
  input: {schema: FinancialSummaryInputSchema},
  output: {schema: FinancialSummaryOutputSchema},
  prompt: `You are a financial advisor. You are provided with the user's financial data and their financial goal. Your job is to summarize the user's financial data in the context of their goal, also considering the prompt the user provided.

Financial Data: {{{financialData}}}
Goal: {{{goal}}}
User Prompt: {{{userPrompt}}}

Summary:`, //Ensure the AI model generates the summary at the end of the prompt
});

const financialSummaryFlow = ai.defineFlow(
  {
    name: 'financialSummaryFlow',
    inputSchema: FinancialSummaryInputSchema,
    outputSchema: FinancialSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
