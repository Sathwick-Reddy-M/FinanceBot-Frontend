
"use server";

import type { FinancialSummaryInput } from '@/ai/flows/financial-summary';
import { summarizeFinancialData } from '@/ai/flows/financial-summary';
import type { Account, ChatMessage } from '@/lib/types';

interface SubmitChatMessagePayload {
  userMessage: string;
  accounts: Account[]; // Full financial data
  chatHistory: ChatMessage[]; // For context, if needed by AI
}

export async function submitChatMessageAction(
  payload: SubmitChatMessagePayload
): Promise<string> {
  const { userMessage, accounts } = payload;

  // Prepare financial data for AI. Could be specific parts or all of it.
  const financialDataSummary = accounts.map(acc => ({
    type: acc.type,
    name: acc.name,
    balance: acc.balance,
    currency: acc.currency,
    ...(acc.type === 'Investment' && acc.holdings && { holdings: acc.holdings.map(h => `${h.name}: ${h.percentage}%`).join(', ') }),
    ...(acc.type === 'Loan' && acc.interestRate && { interestRate: acc.interestRate }),
    ...(acc.type === 'CreditCard' && acc.creditLimit && { creditLimit: acc.creditLimit }),
  }));
  
  const financialDataString = JSON.stringify(financialDataSummary, null, 2);

  try {
    // Call the AI financial summarization flow
    const aiInput: FinancialSummaryInput = {
      financialData: financialDataString,
      goal: "General financial overview and advice related to user's query.", // This could be made more dynamic
      userPrompt: userMessage,
    };
    
    const aiResponse = await summarizeFinancialData(aiInput);
    
    // Simulate sending to "ABC/DEF" endpoint (logging for now)
    console.log("Simulating sending to ABC/DEF endpoint with data:", {
      userMessage,
      financialDataString,
      // chatHistory, // if ABC/DEF needs it
      aiSummary: aiResponse.summary,
    });

    return aiResponse.summary;
  } catch (error) {
    console.error("Error in AI summarization:", error);
    return "I encountered an error trying to process your request. Please try again.";
  }
}
