
"use client";

import type { Control } from 'react-hook-form';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Account, AccountType, AssetDistribution, BillingCycleTransaction, CheckingOrSavingsAccountFee, LoanFee } from '@/lib/types';
import { ACCOUNT_TYPES_ENUM as ACCOUNT_TYPES } from '@/lib/types';
import { useAccounts } from '@/contexts/AccountContext';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Schema for Asset Distribution (aligns with Python's AssetDistribution)
const assetDistributionSchema = z.object({
  id: z.string().optional(), // Client-side UUID
  ticker: z.string().min(1, "Ticker is required"),
  quantity: z.coerce.number().min(0, "Quantity must be non-negative"),
  average_cost_basis: z.coerce.number().min(0, "Average cost basis must be non-negative"),
});

// Schema for Billing Cycle Transaction (simplified for form)
const billingCycleTransactionSchema = z.object({
  id: z.string().optional(), // Client-side UUID
  amount: z.coerce.number(),
  category: z.string().min(1, "Category is required"),
  // For full form, would add date, description. For now, assuming these are summarized.
});

// Schema for Checking/Savings Account Fees
const checkingOrSavingsAccountFeeSchema = z.object({
  no_minimum_balance_fee: z.coerce.number({ required_error: "No minimum balance fee is required" }),
  monthly_fee: z.coerce.number({ required_error: "Monthly fee is required" }),
  atm_fee: z.coerce.number({ required_error: "ATM fee is required" }), // Python: ATM_fee
  overdraft_fee: z.coerce.number({ required_error: "Overdraft fee is required" }),
});

// Schema for Loan Fees
const loanFeeSchema = z.object({
  late_fee: z.coerce.number({ required_error: "Late fee is required" }),
  prepayment_penalty: z.coerce.number({ required_error: "Prepayment penalty is required" }),
  origination_fee: z.coerce.number({ required_error: "Origination fee is required" }),
  other_fees: z.coerce.number({ required_error: "Other fees is required" }),
});


// Base Schema for all accounts
const baseAccountSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(ACCOUNT_TYPES, { required_error: 'Account type is required' }),
  currency: z.string().min(3, 'Currency code is required (e.g., USD)').max(3).default('USD'),
  description: z.string().optional(),
  // balance is NOT in base Zod schema; it's calculated and added to final Account object
});

// Schemas for Investment-like accounts
const investmentRelatedFeaturesBase = {
  uninvested_amount: z.coerce.number({ required_error: "Uninvested amount is required" }),
  assest_distribution: z.array(assetDistributionSchema).min(0, "Asset distribution list cannot be null"), // Python: assest_distribution
};

const tsInvestmentAccountSchema = baseAccountSchema.extend({
  type: z.literal('Investment'),
  ...investmentRelatedFeaturesBase,
});

const hsaAndIRARelatedFeatures = {
  ...investmentRelatedFeaturesBase,
  average_monthly_contribution: z.coerce.number({ required_error: "Average monthly contribution is required" }),
};

const tsHSAAccountSchema = baseAccountSchema.extend({ type: z.literal('HSA'), ...hsaAndIRARelatedFeatures });
const tsTraditionalIRAAccountSchema = baseAccountSchema.extend({ type: z.literal('Traditional IRA'), ...hsaAndIRARelatedFeatures });
const tsRothIRAAccountSchema = baseAccountSchema.extend({ type: z.literal('Roth IRA'), ...hsaAndIRARelatedFeatures });

const k401Features = {
  ...hsaAndIRARelatedFeatures,
  employer_match: z.string().min(1, "Employer match details are required"),
};
const tsRetirement401kAccountSchema = baseAccountSchema.extend({ type: z.literal('Retirement 401k'), ...k401Features });
const tsRoth401kAccountSchema = baseAccountSchema.extend({ type: z.literal('Roth 401k'), ...k401Features });

// Schema for Credit Card Account
const tsCreditCardAccountSchema = baseAccountSchema.extend({
  type: z.literal('Credit Card'),
  total_limit: z.coerce.number({ required_error: "Total limit is required" }),
  current_limit: z.coerce.number({ required_error: "Current limit is required" }),
  rewards_summary: z.string().min(1, "Rewards summary is required"),
  interest: z.coerce.number({ required_error: "Interest rate is required" }),
  outstanding_debt: z.coerce.number({ required_error: "Outstanding debt is required" }),
  current_billing_cycle_transactions: z.array(billingCycleTransactionSchema).min(0), // Kept as array, form might simplify
  annual_fee: z.coerce.number().optional().default(0), // Python: Optional[float] = 0.0
  dueDate: z.string().optional(), // Not in Python model, kept optional from previous version
  cardNumberLast4: z.string().max(4).optional(), // Not in Python model, kept optional
  transactionsSummary: z.string().optional(), // For UI simplification if array is too much
});

// Schema for Checking/Savings Account
const tsCheckingOrSavingsAccountSchema = baseAccountSchema.extend({
  type: z.literal('Checking/Savings'),
  current_amount: z.coerce.number({ required_error: "Current amount is required" }),
  rewards_summary: z.string().min(1, "Rewards summary is required"),
  interest: z.coerce.number({ required_error: "Interest rate is required" }),
  overdraft_protection: z.string().min(1, "Overdraft protection status is required"),
  minimum_balance_requirement: z.coerce.number({ required_error: "Minimum balance requirement is required" }),
  fee: checkingOrSavingsAccountFeeSchema,
  current_billing_cycle_transactions: z.array(billingCycleTransactionSchema).min(0),
  accountNumberLast4: z.string().max(4).optional(), // Not in Python, kept optional
  bankName: z.string().optional(), // Not in Python, kept optional
  transactionsSummary: z.string().optional(), // For UI simplification
});

// Schema for Loan Account
const tsLoanAccountSchema = baseAccountSchema.extend({
  type: z.literal('Loan'),
  principal_left: z.coerce.number({ required_error: "Principal left is required" }),
  interest_rate: z.coerce.number({ required_error: "Interest rate is required" }),
  monthly_contribution: z.coerce.number({ required_error: "Monthly contribution is required" }),
  loan_term: z.string().min(1, "Loan term is required"),
  loan_start_date: z.string().min(1, "Loan start date is required"), // Consider date picker
  loan_end_date: z.string().min(1, "Loan end date is required"),   // Consider date picker
  outstanding_balance: z.coerce.number({required_error: "Outstanding balance is required"}), // Python has this.
  total_paid: z.coerce.number({required_error: "Total paid to date is required"}),
  payment_due_date: z.string().min(1, "Payment due date is required"),
  payment_history: z.array(z.record(z.any())).min(0), // Kept generic
  loan_type: z.string().min(1, "Loan type is required"),
  collateral: z.string().optional(), // Python: Optional[str] = None
  current_outstanding_fees: loanFeeSchema,
  other_payments: z.array(z.record(z.any())).min(0), // Kept generic
  paymentHistorySummary: z.string().optional(), // For UI simplification
  originalAmount: z.coerce.number().optional(), // Not in Python, kept optional for UI
});

// Schema for Payroll Account
const tsPayrollAccountSchema = baseAccountSchema.extend({
  type: z.literal('Payroll'),
  annual_income: z.coerce.number({ required_error: "Annual income is required" }),
  federal_taxes_withheld: z.coerce.number({ required_error: "Federal taxes withheld is required" }),
  state: z.string().min(1, "State of work is required"),
  state_taxes_withheld: z.coerce.number({ required_error: "State taxes withheld is required" }),
  social_security_withheld: z.coerce.number({ required_error: "Social Security withheld is required" }),
  medicare_withheld: z.coerce.number({ required_error: "Medicare withheld is required" }),
  other_deductions: z.coerce.number({ required_error: "Other deductions are required" }),
  net_income: z.coerce.number({ required_error: "Net income for pay period is required" }),
  pay_period_start_date: z.string().min(1, "Pay period start date is required"),
  pay_period_end_date: z.string().min(1, "Pay period end date is required"),
  pay_frequency: z.string().min(1, "Pay frequency is required"),
  benefits: z.string().min(1, "Benefits summary is required"),
  bonus_income: z.coerce.number({ required_error: "Bonus income is required (can be 0)" }),
  year_to_date_income: z.coerce.number({ required_error: "Year-to-date income is required" }),
  employerName: z.string().optional(), // Not in Python, kept optional
  benefitsSummary: z.string().optional(), // if 'benefits' field is not enough
});

// Schema for Other Account
const tsOtherAccountSchema = baseAccountSchema.extend({
  type: z.literal('Other'),
  total_income: z.coerce.number({ required_error: "Total income is required" }),
  total_debt: z.coerce.number({ required_error: "Total debt is required" }),
});


// Discriminated union of all account schemas
const accountFormSchema = z.discriminatedUnion("type", [
  tsInvestmentAccountSchema,
  tsHSAAccountSchema,
  tsTraditionalIRAAccountSchema,
  tsRothIRAAccountSchema,
  tsRetirement401kAccountSchema,
  tsRoth401kAccountSchema,
  tsCreditCardAccountSchema,
  tsCheckingOrSavingsAccountSchema,
  tsLoanAccountSchema,
  tsPayrollAccountSchema,
  tsOtherAccountSchema,
]);

// This type is for the form data itself, which won't have 'balance' directly from common fields.
export type AccountFormData = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  accountToEdit?: Account; // This is the final Account type, which includes 'balance'
}

export function AccountForm({ isOpen, onOpenChange, accountToEdit }: AccountFormProps) {
  const { addAccount, editAccount } = useAccounts();
  const { toast } = useToast();
  const [inputType, setInputType] = useState<'form' | 'json'>('form');
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Default values for the form, aligning with required fields in Zod schemas
  const getDefaultValues = (account?: Account): Partial<AccountFormData> => {
    const base = {
      name: '',
      currency: 'USD',
      description: '',
      // Investment-like
      uninvested_amount: 0,
      assest_distribution: [],
      average_monthly_contribution: 0,
      employer_match: '',
      // Credit Card
      total_limit: 0,
      current_limit: 0,
      rewards_summary: '',
      interest: 0, // for CC and C/S
      outstanding_debt: 0,
      current_billing_cycle_transactions: [], // Simplified for default
      annual_fee: 0,
      // Checking/Savings
      current_amount: 0,
      overdraft_protection: '',
      minimum_balance_requirement: 0,
      fee: { no_minimum_balance_fee: 0, monthly_fee: 0, atm_fee: 0, overdraft_fee: 0 },
      // Loan
      principal_left: 0,
      interest_rate: 0, // for Loan
      monthly_contribution: 0, // for Loan
      loan_term: '',
      loan_start_date: '',
      loan_end_date: '',
      outstanding_balance: 0,
      total_paid: 0,
      payment_due_date: '',
      payment_history: [], // Simplified
      loan_type: '',
      current_outstanding_fees: { late_fee: 0, prepayment_penalty: 0, origination_fee: 0, other_fees: 0 },
      other_payments: [], // Simplified
      // Payroll
      annual_income: 0,
      federal_taxes_withheld: 0,
      state: '',
      state_taxes_withheld: 0,
      social_security_withheld: 0,
      medicare_withheld: 0,
      other_deductions: 0,
      net_income: 0,
      pay_period_start_date: '',
      pay_period_end_date: '',
      pay_frequency: '',
      benefits: '',
      bonus_income: 0,
      year_to_date_income: 0,
      // Other
      total_income: 0,
      total_debt: 0,
    };
    if (account) {
      // Spreading accountToEdit might bring the 'balance' field which is not in AccountFormData.
      // So, we explicitly pick fields.
      const { balance, id, ...restOfAccountToEdit } = account; // Exclude balance and id from spreading directly
      return {
        ...base, // Start with base defaults
        type: account.type, // Set type first
        ...restOfAccountToEdit, // Spread the actual data
        // Ensure array fields are defaulted if not present in restOfAccountToEdit
        assest_distribution: (account as any).assest_distribution || [],
        current_billing_cycle_transactions: (account as any).current_billing_cycle_transactions || [],
        payment_history: (account as any).payment_history || [],
        other_payments: (account as any).other_payments || [],
      } as AccountFormData; // Cast because we're building it carefully
    }
    return { ...base, type: 'Checking/Savings' } as AccountFormData; // Default new account type
  };
  

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: getDefaultValues(accountToEdit),
  });
  
  const { fields: assetFields, append: appendAsset, remove: removeAsset } = useFieldArray({
    control: form.control as Control<AccountFormData & { assest_distribution?: AssetDistribution[] }>, // Adjusted type
    name: "assest_distribution" as 'assest_distribution', // Corrected name
  });

  useEffect(() => {
    form.reset(getDefaultValues(accountToEdit));
     if (accountToEdit && ['Investment', 'HSA', 'Traditional IRA', 'Roth IRA', 'Retirement 401k', 'Roth 401k'].includes(accountToEdit.type)) {
        const currentAssets = (accountToEdit as any).assest_distribution || [];
        // Reset and then set value for array fields to ensure reactivity with useFieldArray
        form.setValue('assest_distribution', []); 
        form.setValue('assest_distribution', currentAssets as AssetDistribution[]);
    } else {
        form.setValue('assest_distribution', []);
    }
  }, [accountToEdit, form, isOpen]);


  const watchedAccountType = form.watch('type');

  const prepareDataForSubmit = (data: AccountFormData): Account => {
    let calculatedBalance = 0;
    const accountId = accountToEdit?.id || crypto.randomUUID();
    
    // Base data common to all, ensuring ID is present
    const baseData = { 
        id: accountId, 
        name: data.name, 
        type: data.type, 
        currency: data.currency, 
        description: data.description 
    };

    let specificData: Omit<Account, keyof typeof baseData | 'balance'>;

    switch (data.type) {
      case 'Investment':
        calculatedBalance = data.uninvested_amount;
        specificData = { uninvested_amount: data.uninvested_amount, assest_distribution: data.assest_distribution };
        break;
      case 'HSA':
      case 'Traditional IRA':
      case 'Roth IRA':
        calculatedBalance = data.uninvested_amount;
        specificData = { 
            uninvested_amount: data.uninvested_amount, 
            assest_distribution: data.assest_distribution,
            average_monthly_contribution: data.average_monthly_contribution
        };
        break;
      case 'Retirement 401k':
      case 'Roth 401k':
        calculatedBalance = data.uninvested_amount;
        specificData = { 
            uninvested_amount: data.uninvested_amount, 
            assest_distribution: data.assest_distribution,
            average_monthly_contribution: data.average_monthly_contribution,
            employer_match: data.employer_match
        };
        break;
      case 'Credit Card':
        calculatedBalance = -Math.abs(data.outstanding_debt);
        specificData = { 
            total_limit: data.total_limit, 
            current_limit: data.current_limit,
            rewards_summary: data.rewards_summary,
            interest: data.interest,
            outstanding_debt: data.outstanding_debt,
            current_billing_cycle_transactions: data.current_billing_cycle_transactions, // Assuming form handles this
            annual_fee: data.annual_fee,
            ...(data.dueDate && { dueDate: data.dueDate }), // Keep if form has these optional fields
            ...(data.cardNumberLast4 && { cardNumberLast4: data.cardNumberLast4 }),
            ...(data.transactionsSummary && { transactionsSummary: data.transactionsSummary }),
        };
        break;
      case 'Checking/Savings':
        calculatedBalance = data.current_amount;
        specificData = {
            current_amount: data.current_amount,
            rewards_summary: data.rewards_summary,
            interest: data.interest,
            overdraft_protection: data.overdraft_protection,
            minimum_balance_requirement: data.minimum_balance_requirement,
            fee: data.fee,
            current_billing_cycle_transactions: data.current_billing_cycle_transactions, // Assuming form handles this
             ...(data.accountNumberLast4 && { accountNumberLast4: data.accountNumberLast4 }),
            ...(data.bankName && { bankName: data.bankName }),
            ...(data.transactionsSummary && { transactionsSummary: data.transactionsSummary }),
        };
        break;
      case 'Loan':
        calculatedBalance = -Math.abs(data.principal_left);
        specificData = {
            principal_left: data.principal_left,
            interest_rate: data.interest_rate,
            monthly_contribution: data.monthly_contribution,
            loan_term: data.loan_term,
            loan_start_date: data.loan_start_date,
            loan_end_date: data.loan_end_date,
            outstanding_balance: data.outstanding_balance,
            total_paid: data.total_paid,
            payment_due_date: data.payment_due_date,
            payment_history: data.payment_history, // Assuming form handles this
            loan_type: data.loan_type,
            collateral: data.collateral,
            current_outstanding_fees: data.current_outstanding_fees,
            other_payments: data.other_payments, // Assuming form handles this
            ...(data.paymentHistorySummary && { paymentHistorySummary: data.paymentHistorySummary }),
            ...(data.originalAmount && { originalAmount: data.originalAmount }),
        };
        break;
      case 'Payroll':
        calculatedBalance = data.net_income;
        specificData = {
            annual_income: data.annual_income,
            federal_taxes_withheld: data.federal_taxes_withheld,
            state: data.state,
            state_taxes_withheld: data.state_taxes_withheld,
            social_security_withheld: data.social_security_withheld,
            medicare_withheld: data.medicare_withheld,
            other_deductions: data.other_deductions,
            net_income: data.net_income,
            pay_period_start_date: data.pay_period_start_date,
            pay_period_end_date: data.pay_period_end_date,
            pay_frequency: data.pay_frequency,
            benefits: data.benefits,
            bonus_income: data.bonus_income,
            year_to_date_income: data.year_to_date_income,
            ...(data.employerName && { employerName: data.employerName }),
            ...(data.benefitsSummary && { benefitsSummary: data.benefitsSummary }),
        };
        break;
      case 'Other':
        calculatedBalance = data.total_income - data.total_debt;
        specificData = { total_income: data.total_income, total_debt: data.total_debt };
        break;
      default:
        // Should not happen with discriminated union, but as a fallback:
        throw new Error("Invalid account type for data preparation");
    }
    return { ...baseData, balance: calculatedBalance, ...specificData } as Account;
  };


  const onSubmit = (data: AccountFormData) => {
    try {
      const finalAccountObject = prepareDataForSubmit(data);
      if (accountToEdit) {
        editAccount(finalAccountObject); // editAccount expects full Account object with id
        toast({ title: "Success", description: "Account updated successfully." });
      } else {
        addAccount(finalAccountObject); // addAccount can also take full Account object
        toast({ title: "Success", description: "Account added successfully." });
      }
      onOpenChange(false);
      form.reset(getDefaultValues()); // Reset to blank form defaults
    } catch (error) {
      console.error("Submission error", error);
      toast({ title: "Error", description: `Failed to save account. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
    }
  };

  const handleJsonSubmit = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      // We need to validate against the AccountFormData schema (which doesn't include 'balance' directly)
      const validationResult = accountFormSchema.safeParse(parsedJson);
      if (validationResult.success) {
        setJsonError(null);
        // The validated data (AccountFormData) is then passed to onSubmit,
        // which uses prepareDataForSubmit to construct the final Account object with calculated balance.
        onSubmit(validationResult.data); 
      } else {
        const errorMsg = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        setJsonError(errorMsg);
        toast({ title: "JSON Validation Error", description: errorMsg, variant: "destructive" });
      }
    } catch (e) {
      setJsonError('Invalid JSON format.');
      toast({ title: "JSON Parse Error", description: "Invalid JSON format.", variant: "destructive" });
    }
  };
  
  const renderCommonFields = () => (
    <>
      <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Account Name</FormLabel><FormControl><Input placeholder="E.g., Main Checking" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      <FormField control={form.control} name="type" render={({ field }) => (
          <FormItem><FormLabel>Account Type</FormLabel>
            <Select onValueChange={(value) => { field.onChange(value); form.setValue('assest_distribution', []); }} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select account type" /></SelectTrigger></FormControl>
              <SelectContent>{ACCOUNT_TYPES.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
            </Select><FormMessage /></FormItem>
        )} />
      <FormField control={form.control} name="currency" render={({ field }) => (
          <FormItem><FormLabel>Currency</FormLabel><FormControl><Input placeholder="USD" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Any notes about this account" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
        )} />
    </>
  );
  
  const renderAssetDistributionFields = () => (
    <div className="space-y-4 pt-2 border-t mt-4">
      <Label className="text-base font-medium">Asset Distribution</Label>
      {assetFields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2 p-3 border rounded-md bg-muted/30">
          <FormField control={form.control} name={`assest_distribution.${index}.ticker`} render={({ field: f }) => (
              <FormItem className="flex-1"><FormLabel className="text-xs">Ticker</FormLabel><FormControl><Input placeholder="E.g., AAPL, VTI" {...f} /></FormControl><FormMessage /></FormItem>
            )} />
          <FormField control={form.control} name={`assest_distribution.${index}.quantity`} render={({ field: f }) => (
              <FormItem className="w-1/4"><FormLabel className="text-xs">Quantity</FormLabel><FormControl><Input type="number" placeholder="10" {...f} /></FormControl><FormMessage /></FormItem>
            )} />
          <FormField control={form.control} name={`assest_distribution.${index}.average_cost_basis`} render={({ field: f }) => (
              <FormItem className="w-1/3"><FormLabel className="text-xs">Avg. Cost Basis ($)</FormLabel><FormControl><Input type="number" placeholder="150.25" {...f} /></FormControl><FormMessage /></FormItem>
            )} />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeAsset(index)} aria-label="Remove asset" className="mt-auto"><MinusCircle className="h-5 w-5 text-destructive" /></Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => appendAsset({ id: crypto.randomUUID(), ticker: '', quantity: 0, average_cost_basis: 0 })}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add Asset
      </Button>
    </div>
  );

  const renderInvestmentLikeFields = (is401k = false, isHSAIRA = false) => (
    <>
      <FormField control={form.control} name="uninvested_amount" render={({ field }) => ( <FormItem><FormLabel>Uninvested Cash Amount</FormLabel><FormControl><Input type="number" placeholder="1000.00" {...field} /></FormControl><FormMessage /></FormItem> )} />
      {(is401k || isHSAIRA) && <FormField control={form.control} name="average_monthly_contribution" render={({ field }) => ( <FormItem><FormLabel>Avg. Monthly Contribution</FormLabel><FormControl><Input type="number" placeholder="500.00" {...field} /></FormControl><FormMessage /></FormItem> )} />}
      {is401k && <FormField control={form.control} name="employer_match" render={({ field }) => ( <FormItem><FormLabel>Employer Match (e.g., 50% up to 6%)</FormLabel><FormControl><Input placeholder="Details of employer match" {...field} /></FormControl><FormMessage /></FormItem> )} />}
      {renderAssetDistributionFields()}
    </>
  );

  const renderCreditCardFields = () => (
    <>
      <FormField control={form.control} name="outstanding_debt" render={({ field }) => ( <FormItem><FormLabel>Outstanding Debt (Positive Number)</FormLabel><FormControl><Input type="number" placeholder="1200.50" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="total_limit" render={({ field }) => ( <FormItem><FormLabel>Total Credit Limit</FormLabel><FormControl><Input type="number" placeholder="5000" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="current_limit" render={({ field }) => ( <FormItem><FormLabel>Current Available Limit</FormLabel><FormControl><Input type="number" placeholder="3800" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="interest" render={({ field }) => ( <FormItem><FormLabel>Interest Rate (APR %)</FormLabel><FormControl><Input type="number" placeholder="19.99" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="rewards_summary" render={({ field }) => ( <FormItem><FormLabel>Rewards Summary</FormLabel><FormControl><Textarea placeholder="E.g., 2% cashback on travel" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="annual_fee" render={({ field }) => ( <FormItem><FormLabel>Annual Fee (Optional)</FormLabel><FormControl><Input type="number" placeholder="95" {...field} value={field.value ?? 0} /></FormControl><FormMessage /></FormItem> )} />
      {/* For current_billing_cycle_transactions, a full array input is complex. Simplified to summary or not shown. */}
       <FormField control={form.control} name="transactionsSummary" render={({ field }) => ( <FormItem><FormLabel>Recent Transactions Note (Optional, if not detailing all)</FormLabel><FormControl><Textarea placeholder="Summary of recent spending activity" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="cardNumberLast4" render={({ field }) => ( <FormItem><FormLabel>Card Number (Last 4, Optional)</FormLabel><FormControl><Input placeholder="1234" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="dueDate" render={({ field }) => ( <FormItem><FormLabel>Payment Due Date (Optional)</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
    </>
  );
  
  const renderCheckingSavingsFields = () => (
    <>
      <FormField control={form.control} name="current_amount" render={({ field }) => ( <FormItem><FormLabel>Current Amount</FormLabel><FormControl><Input type="number" placeholder="5000.00" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="bankName" render={({ field }) => ( <FormItem><FormLabel>Bank Name (Optional)</FormLabel><FormControl><Input placeholder="E.g., Chase" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="accountNumberLast4" render={({ field }) => ( <FormItem><FormLabel>Account Number (Last 4, Optional)</FormLabel><FormControl><Input placeholder="5678" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="interest" render={({ field }) => ( <FormItem><FormLabel>Interest Rate (APY %)</FormLabel><FormControl><Input type="number" placeholder="0.5" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="rewards_summary" render={({ field }) => ( <FormItem><FormLabel>Rewards Summary</FormLabel><FormControl><Textarea placeholder="E.g., $200 bonus for new account" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="overdraft_protection" render={({ field }) => ( <FormItem><FormLabel>Overdraft Protection</FormLabel><FormControl><Input placeholder="E.g., Enabled, Linked to Savings" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="minimum_balance_requirement" render={({ field }) => ( <FormItem><FormLabel>Minimum Balance Req.</FormLabel><FormControl><Input type="number" placeholder="1500" {...field} /></FormControl><FormMessage /></FormItem> )} />
      
      <Label className="text-base font-medium mt-3 mb-1 block">Fees</Label>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 border rounded-md bg-muted/30">
        <FormField control={form.control} name="fee.monthly_fee" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Monthly Fee</FormLabel><FormControl><Input type="number" placeholder="10" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="fee.atm_fee" render={({ field }) => ( <FormItem><FormLabel className="text-xs">ATM Fee</FormLabel><FormControl><Input type="number" placeholder="2.50" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="fee.overdraft_fee" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Overdraft Fee</FormLabel><FormControl><Input type="number" placeholder="35" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="fee.no_minimum_balance_fee" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Min. Balance Fee</FormLabel><FormControl><Input type="number" placeholder="12" {...field} /></FormControl><FormMessage /></FormItem> )} />
      </div>
       <FormField control={form.control} name="transactionsSummary" render={({ field }) => ( <FormItem><FormLabel>Recent Transactions Note (Optional, if not detailing all)</FormLabel><FormControl><Textarea placeholder="Summary of recent activity" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
    </>
  );

  const renderLoanFields = () => (
    <>
      <FormField control={form.control} name="principal_left" render={({ field }) => ( <FormItem><FormLabel>Principal Left</FormLabel><FormControl><Input type="number" placeholder="180000" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="originalAmount" render={({ field }) => ( <FormItem><FormLabel>Original Loan Amount (Optional, for UI)</FormLabel><FormControl><Input type="number" placeholder="250000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="interest_rate" render={({ field }) => ( <FormItem><FormLabel>Interest Rate (%)</FormLabel><FormControl><Input type="number" placeholder="3.75" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="monthly_contribution" render={({ field }) => ( <FormItem><FormLabel>Monthly Payment</FormLabel><FormControl><Input type="number" placeholder="1200" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="loan_type" render={({ field }) => ( <FormItem><FormLabel>Loan Type (e.g., Mortgage, Auto)</FormLabel><FormControl><Input placeholder="Mortgage" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="loan_term" render={({ field }) => ( <FormItem><FormLabel>Loan Term (e.g., 30 years)</FormLabel><FormControl><Input placeholder="30 years" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="loan_start_date" render={({ field }) => ( <FormItem><FormLabel>Loan Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="loan_end_date" render={({ field }) => ( <FormItem><FormLabel>Loan End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="payment_due_date" render={({ field }) => ( <FormItem><FormLabel>Next Payment Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="outstanding_balance" render={({ field }) => ( <FormItem><FormLabel>Outstanding Balance (as per Python)</FormLabel><FormControl><Input type="number" placeholder="180000" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="total_paid" render={({ field }) => ( <FormItem><FormLabel>Total Paid to Date</FormLabel><FormControl><Input type="number" placeholder="70000" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="collateral" render={({ field }) => ( <FormItem><FormLabel>Collateral (Optional)</FormLabel><FormControl><Input placeholder="E.g., Property address" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      
      <Label className="text-base font-medium mt-3 mb-1 block">Current Outstanding Loan Fees</Label>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 border rounded-md bg-muted/30">
        <FormField control={form.control} name="current_outstanding_fees.late_fee" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Late Fee</FormLabel><FormControl><Input type="number" placeholder="25" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="current_outstanding_fees.prepayment_penalty" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Prepayment Penalty</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="current_outstanding_fees.origination_fee" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Origination Fee</FormLabel><FormControl><Input type="number" placeholder="500" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="current_outstanding_fees.other_fees" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Other Fees</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem> )} />
      </div>
      {/* payment_history and other_payments are arrays of records, complex for direct form. Simplified. */}
      <FormField control={form.control} name="paymentHistorySummary" render={({ field }) => ( <FormItem><FormLabel>Payment History Note (Optional)</FormLabel><FormControl><Textarea placeholder="Summary of payment history" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
    </>
  );

  const renderPayrollFields = () => (
    <>
      <FormField control={form.control} name="employerName" render={({ field }) => ( <FormItem><FormLabel>Employer Name (Optional)</FormLabel><FormControl><Input placeholder="E.g., Acme Corp" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="annual_income" render={({ field }) => ( <FormItem><FormLabel>Annual Income (Gross)</FormLabel><FormControl><Input type="number" placeholder="75000" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="net_income" render={({ field }) => ( <FormItem><FormLabel>Net Income (Last Pay Period)</FormLabel><FormControl><Input type="number" placeholder="2500" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="pay_frequency" render={({ field }) => ( <FormItem><FormLabel>Pay Frequency</FormLabel><FormControl><Input placeholder="E.g., Bi-weekly, Monthly" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="year_to_date_income" render={({ field }) => ( <FormItem><FormLabel>Year-to-Date Income (Gross)</FormLabel><FormControl><Input type="number" placeholder="30000" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="bonus_income" render={({ field }) => ( <FormItem><FormLabel>Bonus Income (Annual, can be 0)</FormLabel><FormControl><Input type="number" placeholder="5000" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="pay_period_start_date" render={({ field }) => ( <FormItem><FormLabel>Last Pay Period Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="pay_period_end_date" render={({ field }) => ( <FormItem><FormLabel>Last Pay Period End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
      
      <Label className="text-base font-medium mt-3 mb-1 block">Withholdings & Deductions (Last Pay Period)</Label>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 border rounded-md bg-muted/30">
        <FormField control={form.control} name="federal_taxes_withheld" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Federal Taxes</FormLabel><FormControl><Input type="number" placeholder="300" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="state" render={({ field }) => ( <FormItem><FormLabel className="text-xs">State of Work</FormLabel><FormControl><Input placeholder="E.g., CA, NY" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="state_taxes_withheld" render={({ field }) => ( <FormItem><FormLabel className="text-xs">State Taxes</FormLabel><FormControl><Input type="number" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="social_security_withheld" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Social Security</FormLabel><FormControl><Input type="number" placeholder="150" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="medicare_withheld" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Medicare</FormLabel><FormControl><Input type="number" placeholder="70" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="other_deductions" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Other Deductions</FormLabel><FormControl><Input type="number" placeholder="50" {...field} /></FormControl><FormMessage /></FormItem> )} />
      </div>
      <FormField control={form.control} name="benefits" render={({ field }) => ( <FormItem><FormLabel>Benefits Description</FormLabel><FormControl><Textarea placeholder="E.g., Health Insurance, 401k plan details" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="benefitsSummary" render={({ field }) => ( <FormItem><FormLabel>Benefits Summary (Optional, if 'benefits' field is main one)</FormLabel><FormControl><Textarea placeholder="Brief summary of benefits" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
    </>
  );

  const renderOtherFields = () => (
    <>
      <FormField control={form.control} name="total_income" render={({ field }) => ( <FormItem><FormLabel>Total Income / Asset Value</FormLabel><FormControl><Input type="number" placeholder="10000" {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="total_debt" render={({ field }) => ( <FormItem><FormLabel>Total Debt / Liability Value</FormLabel><FormControl><Input type="number" placeholder="2000" {...field} /></FormControl><FormMessage /></FormItem> )} />
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if (!open) { form.reset(getDefaultValues()); setJsonInput(''); setJsonError(null); } }}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{accountToEdit ? 'Edit Account' : 'Add New Account'}</DialogTitle></DialogHeader>
        <div className="flex justify-center my-4">
          <Button variant={inputType === 'form' ? 'default' : 'outline'} onClick={() => setInputType('form')} className="mr-2">Form Input</Button>
          <Button variant={inputType === 'json' ? 'default' : 'outline'} onClick={() => setInputType('json')}>JSON Input</Button>
        </div>

        {inputType === 'form' ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
              {renderCommonFields()}
              {watchedAccountType === 'Investment' && renderInvestmentLikeFields()}
              {watchedAccountType === 'HSA' && renderInvestmentLikeFields(false, true)}
              {watchedAccountType === 'Traditional IRA' && renderInvestmentLikeFields(false, true)}
              {watchedAccountType === 'Roth IRA' && renderInvestmentLikeFields(false, true)}
              {watchedAccountType === 'Retirement 401k' && renderInvestmentLikeFields(true, true)}
              {watchedAccountType === 'Roth 401k' && renderInvestmentLikeFields(true, true)}
              {watchedAccountType === 'Credit Card' && renderCreditCardFields()}
              {watchedAccountType === 'Checking/Savings' && renderCheckingSavingsFields()}
              {watchedAccountType === 'Loan' && renderLoanFields()}
              {watchedAccountType === 'Payroll' && renderPayrollFields()}
              {watchedAccountType === 'Other' && renderOtherFields()}
              <DialogFooter className="pt-6">
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">{accountToEdit ? 'Save Changes' : 'Add Account'}</Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <Label htmlFor="json-input">Paste JSON data for the account</Label>
            <Textarea id="json-input" value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} rows={12}
              placeholder='{ "name": "My Investment", "type": "Investment", "currency": "USD", "uninvested_amount": 1000, "assest_distribution": [{"ticker": "AAPL", "quantity": 10, "average_cost_basis": 150}], ... }' />
            {jsonError && <p className="text-sm text-destructive">{jsonError}</p>}
            <DialogFooter className="pt-6">
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleJsonSubmit}>{accountToEdit ? 'Save Changes via JSON' : 'Add Account via JSON'}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
