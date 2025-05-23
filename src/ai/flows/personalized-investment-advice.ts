// src/ai/flows/personalized-investment-advice.ts
'use server';
/**
 * @fileOverview Provides personalized investment advice based on user's financial data and risk tolerance.
 *
 * - getPersonalizedInvestmentAdvice - A function that generates personalized investment advice.
 * - PersonalizedInvestmentAdviceInput - The input type for the getPersonalizedInvestmentAdvice function.
 * - PersonalizedInvestmentAdviceOutput - The return type for the getPersonalizedInvestmentAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedInvestmentAdviceInputSchema = z.object({
  financialData: z.string().describe('A JSON string containing the user\'s financial data, including account balances, assets, and liabilities.'),
  riskTolerance: z.string().describe('The user\'s risk tolerance level (e.g., low, medium, high).'),
  investmentGoals: z.string().describe('The user\'s investment goals (e.g., retirement, buying a home).'),
  userPrompt: z.string().describe('The user\'s prompt or question about their investments.'),
});
export type PersonalizedInvestmentAdviceInput = z.infer<typeof PersonalizedInvestmentAdviceInputSchema>;

const PersonalizedInvestmentAdviceOutputSchema = z.object({
  advice: z.string().describe('Personalized investment advice based on the user\'s financial data, risk tolerance, and investment goals.'),
  disclaimer: z.string().describe('A disclaimer stating that the advice is for informational purposes only and should not be considered financial advice.'),
});
export type PersonalizedInvestmentAdviceOutput = z.infer<typeof PersonalizedInvestmentAdviceOutputSchema>;

export async function getPersonalizedInvestmentAdvice(input: PersonalizedInvestmentAdviceInput): Promise<PersonalizedInvestmentAdviceOutput> {
  return personalizedInvestmentAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedInvestmentAdvicePrompt',
  input: {schema: PersonalizedInvestmentAdviceInputSchema},
  output: {schema: PersonalizedInvestmentAdviceOutputSchema},
  prompt: `You are a financial advisor providing personalized investment advice to users based on their financial data, risk tolerance, and investment goals.

  Here is the user's financial data:
  {{financialData}}

  Here is the user's risk tolerance:
  {{riskTolerance}}

  Here are the user's investment goals:
  {{investmentGoals}}

  Here is the user's prompt:
  {{userPrompt}}

  Based on this information, provide personalized investment advice to the user. Include a disclaimer that the advice is for informational purposes only and should not be considered financial advice.
  Be specific and tailor your advice to the data provided.  Provide at least 3 sentences of useful advice.
  Do not make assumptions about the data that is not explicitly provided.
  `,
});

const personalizedInvestmentAdviceFlow = ai.defineFlow(
  {
    name: 'personalizedInvestmentAdviceFlow',
    inputSchema: PersonalizedInvestmentAdviceInputSchema,
    outputSchema: PersonalizedInvestmentAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
