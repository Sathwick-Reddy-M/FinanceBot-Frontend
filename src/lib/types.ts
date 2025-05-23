
// Client-side representation of Python's AssetDistribution, with an added ID for React keys
export interface AssetDistribution {
  id: string; // Client-side generated UUID for React keys
  ticker: string;
  quantity: number; // Client-side representation of Python's AssetDistribution, with an added ID for React keys
  average_cost_basis: number;
}

export interface BillingCycleTransaction {
  id: string; // Added for list key, though source Python doesn't have it. Assuming client-side need.
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
}

// Specific Account Types based on Python models
export interface TSInvestmentAccount extends BaseAccount {
  type: 'Investment';
  uninvested_amount: number;
  asset_distribution: AssetDistribution[];
}

export interface TSHSAAccount extends BaseAccount {
  type: 'HSA';
  average_monthly_contribution: number;
  uninvested_amount: number; // Client-side representation of Python's AssetDistribution, with an added ID for React keys
  asset_distribution: AssetDistribution[];
}

export interface TSTraditionalIRAAccount extends BaseAccount {
  type: 'Traditional IRA';
  uninvested_amount: number;
  average_monthly_contribution: number; // Client-side representation of Python's AssetDistribution, with an added ID for React keys
  asset_distribution: AssetDistribution[];
}

export interface TSRothIRAAccount extends BaseAccount {
  type: 'Roth IRA';
  uninvested_amount: number;
  average_monthly_contribution: number; // Client-side representation of Python's AssetDistribution, with an added ID for React keys
  asset_distribution: AssetDistribution[];
}

export interface TSRetirement401kAccount extends BaseAccount {
  type: 'Retirement 401k';
  average_monthly_contribution: number;
  uninvested_amount: number; // Client-side representation of Python's AssetDistribution, with an added ID for React keys
  asset_distribution: AssetDistribution[];
  employer_match: string;
}

export interface TSRoth401kAccount extends BaseAccount {
  type: 'Roth 401k';
  average_monthly_contribution: number;
  uninvested_amount: number; // Client-side representation of Python's AssetDistribution, with an added ID for React keys
  asset_distribution: AssetDistribution[];
  employer_match: string;
}

export interface TSCreditCardAccount extends BaseAccount {
  type: 'Credit Card';
  total_limit: number;
  current_limit: number;
  rewards_summary: string;
  interest: number;
  outstanding_debt: number;
  current_billing_cycle_transactions: BillingCycleTransaction[];
  annual_fee: number; // Python: Optional[float] = 0.0, so non-optional in TS, with default if undefined from source
}

export interface TSCheckingOrSavingsAccount extends BaseAccount {
  type: 'Checking/Savings';
  current_amount: number;
  rewards_summary: string;
  interest: number;
  overdraft_protection: string;
  minimum_balance_requirement: number;
  fee: CheckingOrSavingsAccountFee;
  current_billing_cycle_transactions: BillingCycleTransaction[];
}

export interface TSLoanAccount extends BaseAccount {
  type: 'Loan';
  principal_left: number;
  interest_rate: number;
  monthly_contribution: number;
  loan_term: string;
  loan_start_date: string; // ISO Date
  loan_end_date: string; // ISO Date
  outstanding_balance: number;
  total_paid: number;
  payment_due_date: string;
  payment_history: Array<Record<string, any>>;
  loan_type: string;
  collateral?: string; // Python: Optional[str] = None
  current_outstanding_fees: LoanFee;
  other_payments: Array<Record<string, any>>;
}

export interface TSPayrollAccount extends BaseAccount {
  type: 'Payroll';
  annual_income: number;
  federal_taxes_withheld: number;
  state: string;
  state_taxes_withheld: number;
  social_security_withheld: number;
  medicare_withheld: number;
  other_deductions: number;
  net_income: number;
  pay_period_start_date: string;
  pay_period_end_date: string;
  pay_frequency: string;
  benefits: string;
  bonus_income: number;
  year_to_date_income: number;
}

export interface TSOtherAccount extends BaseAccount {
  type: 'Other';
  total_income: number;
  total_debt: number;
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
