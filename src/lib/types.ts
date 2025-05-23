
// Keep existing AssetDistribution for UI simplicity in forms and cards
export interface AssetDistribution {
  id: string; // UUID
  name: string; // e.g., Ticker symbol or fund name
  percentage: number; // Percentage of total holdings for this asset
}

// New supporting types from Python models
export interface BillingCycleTransaction {
  id: string; // Added for list key
  date: string; // ISO Date string
  description: string;
  amount: number;
  category: string;
}

export interface CheckingOrSavingsAccountFee {
  noMinimumBalanceFee?: number;
  monthlyFee?: number;
  atmFee?: number;
  overdraftFee?: number;
}

export interface LoanFee {
  lateFee?: number;
  prepaymentPenalty?: number;
  originationFee?: number;
  otherFees?: number;
}

// Base for all accounts
export interface BaseAccount {
  id: string; // UUID
  name:string;
  type: AccountType; // This will be the expanded list
  balance: number; // Standardized balance figure for display
  currency: string; // e.g., USD, EUR
  description?: string; // General description, moved to base
}

// Specific Account Types based on Python models
export interface TSInvestmentAccount extends BaseAccount {
  type: 'Investment';
  uninvestedAmount?: number; // This will be primary value for 'balance'
  holdings?: AssetDistribution[];
}

export interface TSHSAAccount extends BaseAccount {
  type: 'HSA';
  averageMonthlyContribution?: number;
  uninvestedAmount?: number; // This will be primary value for 'balance'
  holdings?: AssetDistribution[];
}

export interface TSTraditionalIRAAccount extends BaseAccount {
  type: 'Traditional IRA';
  uninvestedAmount?: number; // This will be primary value for 'balance'
  averageMonthlyContribution?: number;
  holdings?: AssetDistribution[];
}

export interface TSRothIRAAccount extends BaseAccount {
  type: 'Roth IRA';
  uninvestedAmount?: number; // This will be primary value for 'balance'
  averageMonthlyContribution?: number;
  holdings?: AssetDistribution[];
}

export interface TSRetirement401kAccount extends BaseAccount {
  type: 'Retirement 401k';
  averageMonthlyContribution?: number;
  uninvestedAmount?: number; // This will be primary value for 'balance'
  holdings?: AssetDistribution[];
  employerMatch?: string; // e.g., "50% up to 6%"
}

export interface TSRoth401kAccount extends BaseAccount {
  type: 'Roth 401k';
  averageMonthlyContribution?: number;
  uninvestedAmount?: number; // This will be primary value for 'balance'
  holdings?: AssetDistribution[];
  employerMatch?: string;
}

export interface TSCreditCardAccount extends BaseAccount {
  type: 'Credit Card';
  totalLimit?: number;
  availableCredit?: number; // Calculated as totalLimit - outstandingDebt
  rewardsSummary?: string;
  interestRate?: number;
  outstandingDebt?: number; // This will be primary value for 'balance' (negative)
  // currentBillingCycleTransactions?: BillingCycleTransaction[]; // Simplified for now
  transactionsSummary?: string; // Placeholder for complex transaction list
  annualFee?: number;
  dueDate?: string; // ISO date string
  cardNumberLast4?: string;
}

export interface TSCheckingOrSavingsAccount extends BaseAccount {
  type: 'Checking/Savings';
  // currentAmount is 'balance'
  rewardsSummary?: string;
  interestRate?: number;
  overdraftProtection?: string; // e.g., "Enabled", "Disabled", "Linked Account"
  minimumBalanceRequirement?: number;
  fees?: CheckingOrSavingsAccountFee;
  // currentBillingCycleTransactions?: BillingCycleTransaction[]; // Simplified for now
  transactionsSummary?: string; // Placeholder
  accountNumberLast4?: string;
  bankName?: string;
}

export interface TSLoanAccount extends BaseAccount {
  type: 'Loan';
  // principalLeft or outstandingBalance is 'balance' (negative)
  interestRate?: number;
  monthlyContribution?: number;
  loanTerm?: string; // e.g., "30 years", "60 months"
  loanStartDate?: string; // ISO Date
  loanEndDate?: string; // ISO Date
  totalPaidToDate?: number;
  nextPaymentDueDate?: string; // ISO Date
  // paymentHistory?: Array<Record<string, any>>; // Simplified for now
  paymentHistorySummary?: string; // Placeholder
  loanType?: string; // e.g., "Mortgage", "Auto", "Student"
  collateral?: string;
  currentOutstandingFees?: LoanFee;
  originalAmount?: number;
}

export interface TSPayrollAccount extends BaseAccount {
  type: 'Payroll';
  // netIncome for last period is 'balance'
  annualIncome?: number;
  federalTaxesWithheld?: number;
  stateOfWork?: string;
  stateTaxesWithheld?: number;
  socialSecurityWithheld?: number;
  medicareWithheld?: number;
  otherDeductions?: number;
  payPeriodStartDate?: string; // ISO Date
  payPeriodEndDate?: string; // ISO Date
  payFrequency?: string; // e.g., "Bi-weekly", "Monthly"
  benefitsSummary?: string;
  bonusIncome?: number;
  yearToDateIncome?: number;
  employerName?: string;
}

export interface TSOtherAccount extends BaseAccount {
  type: 'Other';
  // totalIncome - totalDebt could be 'balance'
  totalAssetValue?: number; // Changed from totalIncome
  totalLiabilityValue?: number; // Changed from totalDebt
}

// Union of all specific account types
export type Account =
  | TSInvestmentAccount
  | TSHSAAccount
  | TSTraditionalIRAAccount
  | TSRothIRAAccount
  | TSRetirement401kAccount
  | TSRoth401kAccount
  | TSCreditCardAccount
  | TSCheckingOrSavingsAccount
  | TSLoanAccount
  | TSPayrollAccount
  | TSOtherAccount;

// Literal type for AccountType strings
export const ACCOUNT_TYPES_ENUM = [
  'Investment', // Generic Investment
  'HSA',
  'Traditional IRA',
  'Roth IRA',
  'Retirement 401k',
  'Roth 401k',
  'Credit Card',
  'Checking/Savings',
  'Loan',
  'Payroll',
  'Other',
] as const;

export type AccountType = (typeof ACCOUNT_TYPES_ENUM)[number];

// Make sure ACCOUNT_TYPES array matches AccountType
export const ACCOUNT_TYPES: AccountType[] = [...ACCOUNT_TYPES_ENUM];

export const ACCOUNT_TYPE_EMOJIS: Record<AccountType, string> = {
  'Investment': "📈",
  'HSA': "🏥",
  'Traditional IRA': "👴",
  'Roth IRA': "🌅",
  'Retirement 401k': "🏢",
  'Roth 401k': "🏦",
  'Credit Card': "💳",
  'Checking/Savings': "💵",
  'Loan': "📄",
  'Payroll': "💼",
  'Other': "🧾",
};

// Ensure ChatMessage type is still here
export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number; // Unix timestamp
  isLoading?: boolean;
}
