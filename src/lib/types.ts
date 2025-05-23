
export type AccountType = 'Investment' | 'Banking' | 'Loan' | 'CreditCard' | 'Other';

export interface AssetDistribution {
  id: string;
  name: string;
  percentage: number;
}

export interface BaseAccount {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string; // e.g., USD, EUR
}

export interface InvestmentAccount extends BaseAccount {
  type: 'Investment';
  holdings?: AssetDistribution[]; // For stocks, mutual funds etc.
  // Example: [{ name: "AAPL", percentage: 20 }, { name: "MSFT", percentage: 15 }]
}

export interface BankingAccount extends BaseAccount {
  type: 'Banking';
  accountNumber?: string; // last 4 digits
  bankName?: string;
}

export interface LoanAccount extends BaseAccount {
  type: 'Loan';
  interestRate?: number;
  originalAmount?: number;
}

export interface CreditCardAccount extends BaseAccount {
  type: 'CreditCard';
  cardNumber?: string; // last 4 digits
  creditLimit?: number;
  dueDate?: string; // ISO date string
}

export interface OtherAccount extends BaseAccount {
  type: 'Other';
  description?: string;
}

export type Account = InvestmentAccount | BankingAccount | LoanAccount | CreditCardAccount | OtherAccount;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number; // Unix timestamp
  isLoading?: boolean;
}

export const ACCOUNT_TYPES: AccountType[] = ['Investment', 'Banking', 'Loan', 'CreditCard', 'Other'];

export const ACCOUNT_TYPE_EMOJIS: Record<AccountType, string> = {
  Investment: "📈",
  Banking: "🏦",
  Loan: "💸",
  CreditCard: "💳",
  Other: "🧾",
};
