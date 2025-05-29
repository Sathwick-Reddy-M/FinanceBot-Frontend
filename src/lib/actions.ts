
"use server";

import type { FinancialSummaryInput } from '@/ai/flows/financial-summary';
import { summarizeFinancialData } from '@/ai/flows/financial-summary';
import type { Account, ChatMessage } from '@/lib/types';

interface SubmitChatMessagePayload {
  userMessage: string;
  accounts: Account[]; // Full financial data
  chatHistory: ChatMessage[]; // For context, if needed by AI
}