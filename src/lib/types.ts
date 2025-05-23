
// Client-side representation of Python's AssetDistribution, with an added ID for React keys
export interface AssetDistribution {
  id: string; // Client-side generated UUID for React keys
  ticker: string;
  quantity: number;
  average_cost_basis: number;
}

export interface BillingCycleTransaction {
  id: string; // Added for list key, though source Python doesn't have it. Assuming client-side need.
  // Python model only has amount, category. Date, description can be added if needed for UI.
  // For now, let's assume we only store what Python has for the list, and summarize.
  amount: number;
  category: string;
}

export interface CheckingOrSavingsAccountFee {
  no_minimum_balance_fee: number;
  monthly_fee: number;
  atm_fee: number; // Python uses ATM_fee, will keep camelCase for TS consistency: atmFee
  overdraft_fee: number;
}

export interface LoanFee {
  late_fee: number;
  prepayment_penalty: number;
  origination_fee: number;
  other_fees: number;
}

// Base for all accounts
export interface BaseAccount {
  id: string; // UUID
  name: string;
  type: AccountType;
  balance: number; // Standardized balance figure for display, derived from specific fields
  currency: string; // e.g., USD, EUR
  description?: string; // General description, kept optional as it's often not in Python models' core
}

// Specific Account Types based on Python models
export interface TSInvestmentAccount extends BaseAccount {
  type: 'Investment';
  uninvested_amount: number;
  assest_distribution: AssetDistribution[]; // Corrected name from Python
}

export interface TSHSAAccount extends BaseAccount {
  type: 'HSA';
  average_monthly_contribution: number;
  uninvested_amount: number;
  assest_distribution: AssetDistribution[]; // Corrected name
}

export interface TSTraditionalIRAAccount extends BaseAccount {
  type: 'Traditional IRA';
  uninvested_amount: number;
  average_monthly_contribution: number;
  assest_distribution: AssetDistribution[]; // Corrected name
}

export interface TSRothIRAAccount extends BaseAccount {
  type: 'Roth IRA';
  uninvested_amount: number;
  average_monthly_contribution: number;
  assest_distribution: AssetDistribution[]; // Corrected name
}

export interface TSRetirement401kAccount extends BaseAccount {
  type: 'Retirement 401k';
  average_monthly_contribution: number;
  uninvested_amount: number;
  assest_distribution: AssetDistribution[]; // Corrected name
  employer_match: string;
}

export interface TSRoth401kAccount extends BaseAccount {
  type: 'Roth 401k';
  average_monthly_contribution: number;
  uninvested_amount: number;
  assest_distribution: AssetDistribution[]; // Corrected name
  employer_match: string;
}

export interface TSCreditCardAccount extends BaseAccount {
  type: 'Credit Card';
  total_limit: number;
  current_limit: number; // Python: current_limit, was availableCredit in TS
  rewards_summary: string;
  interest: number; // Python: interest
  outstanding_debt: number;
  current_billing_cycle_transactions: BillingCycleTransaction[]; // Actual list, though form might summarize
  annual_fee?: number; // Python: Optional[float] = 0.0
  // Fields not in Python model explicitly but useful from previous TS, keeping optional if used:
  dueDate?: string; 
  cardNumberLast4?: string;
  transactionsSummary?: string; // If current_billing_cycle_transactions is too complex for direct form input
}

export interface TSCheckingOrSavingsAccount extends BaseAccount {
  type: 'Checking/Savings';
  current_amount: number; // Python: current_amount
  rewards_summary: string;
  interest: number; // Python: interest
  overdraft_protection: string;
  minimum_balance_requirement: number;
  fee: CheckingOrSavingsAccountFee; // Python: fee
  current_billing_cycle_transactions: BillingCycleTransaction[]; // Actual list
  // Fields not in Python model explicitly but useful from previous TS, keeping optional if used:
  accountNumberLast4?: string;
  bankName?: string;
  transactionsSummary?: string; // If current_billing_cycle_transactions is too complex
}

export interface TSLoanAccount extends BaseAccount {
  type: 'Loan';
  principal_left: number; // Python: principal_left
  interest_rate: number; // Python: interest_rate (used this in Py, will stick to it)
  monthly_contribution: number;
  loan_term: string;
  loan_start_date: string; // ISO Date
  loan_end_date: string; // ISO Date
  outstanding_balance: number; // Python has this, might be redundant if principal_left is primary
  total_paid: number; // Python: total_paid
  payment_due_date: string; // Python: payment_due_date
  payment_history: Array<Record<string, any>>; // Kept generic as per Python
  loan_type: string;
  collateral?: string; // Python: Optional[str] = None
  current_outstanding_fees: LoanFee;
  other_payments: Array<Record<string, any>>; // Python: list[dict[str, str | float]] - simplified generic for TS
  // Fields not in Python model explicitly but useful from previous TS, keeping optional if used:
  paymentHistorySummary?: string; // if payment_history is too complex for form
  originalAmount?: number; // Useful for progress calculation
}

export interface TSPayrollAccount extends BaseAccount {
  type: 'Payroll';
  annual_income: number;
  federal_taxes_withheld: number;
  state: string; // Python: state
  state_taxes_withheld: number;
  social_security_withheld: number;
  medicare_withheld: number;
  other_deductions: number;
  net_income: number; // Python: net_income
  pay_period_start_date: string;
  pay_period_end_date: string;
  pay_frequency: string;
  benefits: string; // Python: benefits
  bonus_income: number;
  year_to_date_income: number;
  // Fields not in Python model explicitly but useful from previous TS, keeping optional if used:
  employerName?: string; 
  benefitsSummary?: string; // if 'benefits' string is not enough
}

export interface TSOtherAccount extends BaseAccount {
  type: 'Other';
  total_income: number; // Python: total_income
  total_debt: number; // Python: total_debt
  // Previous TS had totalAssetValue, totalLiabilityValue. Python has total_income, total_debt.
  // Sticking to Python model for data structure.
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
  'Investment',
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

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number; // Unix timestamp
  isLoading?: boolean;
}
