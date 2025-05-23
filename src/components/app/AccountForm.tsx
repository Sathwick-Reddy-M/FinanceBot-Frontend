
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
import type { Account, AccountType, AssetDistribution } from '@/lib/types';
import { ACCOUNT_TYPES_ENUM as ACCOUNT_TYPES } from '@/lib/types'; // Use the enum directly
import { useAccounts } from '@/contexts/AccountContext';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Schema for Asset Distribution (Holdings) - remains unchanged
const assetDistributionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Asset name is required"),
  percentage: z.coerce.number().min(0, "Percentage must be non-negative").max(100, "Percentage cannot exceed 100"),
});

// Base Schema for all accounts
const baseAccountSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(ACCOUNT_TYPES, { required_error: 'Account type is required' }),
  balance: z.coerce.number({invalid_type_error: 'Balance must be a number'}), // Standardized balance
  currency: z.string().min(3, 'Currency code is required (e.g., USD)').max(3).default('USD'),
  description: z.string().optional(),
});

// Schemas for Investment-like accounts
const investmentRelatedFeatures = {
  uninvestedAmount: z.coerce.number().optional(),
  holdings: z.array(assetDistributionSchema).optional(),
  averageMonthlyContribution: z.coerce.number().optional(),
};
const tsInvestmentAccountSchema = baseAccountSchema.extend({
  type: z.literal('Investment'),
  ...investmentRelatedFeatures,
  uninvestedAmount: z.coerce.number({ required_error: 'Uninvested amount is required for balance calculation if not providing balance directly.' }).optional(),
});
const tsHSAAccountSchema = baseAccountSchema.extend({ type: z.literal('HSA'), ...investmentRelatedFeatures });
const tsTraditionalIRAAccountSchema = baseAccountSchema.extend({ type: z.literal('Traditional IRA'), ...investmentRelatedFeatures });
const tsRothIRAAccountSchema = baseAccountSchema.extend({ type: z.literal('Roth IRA'), ...investmentRelatedFeatures });

const k401Features = {
  ...investmentRelatedFeatures,
  employerMatch: z.string().optional(),
}
const tsRetirement401kAccountSchema = baseAccountSchema.extend({ type: z.literal('Retirement 401k'), ...k401Features });
const tsRoth401kAccountSchema = baseAccountSchema.extend({ type: z.literal('Roth 401k'), ...k401Features });

// Schema for Credit Card Account
const tsCreditCardAccountSchema = baseAccountSchema.extend({
  type: z.literal('Credit Card'),
  totalLimit: z.coerce.number().optional(),
  availableCredit: z.coerce.number().optional(), // Primarily for display, balance is outstandingDebt
  rewardsSummary: z.string().optional(),
  interestRate: z.coerce.number().optional(),
  outstandingDebt: z.coerce.number({ required_error: 'Outstanding debt is required for balance calculation if not providing balance directly.' }).optional(), // Maps to balance
  transactionsSummary: z.string().optional(),
  annualFee: z.coerce.number().optional(),
  dueDate: z.string().optional(),
  cardNumberLast4: z.string().max(4, "Last 4 digits only").optional(),
});

// Schema for Checking/Savings Account Fees
const checkingOrSavingsAccountFeeSchema = z.object({
  noMinimumBalanceFee: z.coerce.number().optional(),
  monthlyFee: z.coerce.number().optional(),
  atmFee: z.coerce.number().optional(),
  overdraftFee: z.coerce.number().optional(),
});
// Schema for Checking/Savings Account
const tsCheckingOrSavingsAccountSchema = baseAccountSchema.extend({
  type: z.literal('Checking/Savings'),
  // currentAmount is 'balance'
  rewardsSummary: z.string().optional(),
  interestRate: z.coerce.number().optional(),
  overdraftProtection: z.string().optional(),
  minimumBalanceRequirement: z.coerce.number().optional(),
  fees: checkingOrSavingsAccountFeeSchema.optional(),
  transactionsSummary: z.string().optional(),
  accountNumberLast4: z.string().max(4, "Last 4 digits only").optional(),
  bankName: z.string().optional(),
});

// Schema for Loan Fees
const loanFeeSchema = z.object({
  lateFee: z.coerce.number().optional(),
  prepaymentPenalty: z.coerce.number().optional(),
  originationFee: z.coerce.number().optional(),
  otherFees: z.coerce.number().optional(),
});
// Schema for Loan Account
const tsLoanAccountSchema = baseAccountSchema.extend({
  type: z.literal('Loan'),
  // outstandingBalance or principalLeft is 'balance'
  interestRate: z.coerce.number().optional(),
  monthlyContribution: z.coerce.number().optional(),
  loanTerm: z.string().optional(),
  loanStartDate: z.string().optional(), // Consider date picker
  loanEndDate: z.string().optional(),   // Consider date picker
  totalPaidToDate: z.coerce.number().optional(),
  nextPaymentDueDate: z.string().optional(), // Consider date picker
  paymentHistorySummary: z.string().optional(),
  loanType: z.string().optional(),
  collateral: z.string().optional(),
  currentOutstandingFees: loanFeeSchema.optional(),
  originalAmount: z.coerce.number().optional(),
});

// Schema for Payroll Account
const tsPayrollAccountSchema = baseAccountSchema.extend({
  type: z.literal('Payroll'),
  // netIncome (last period) is 'balance'
  annualIncome: z.coerce.number().optional(),
  federalTaxesWithheld: z.coerce.number().optional(),
  stateOfWork: z.string().optional(),
  stateTaxesWithheld: z.coerce.number().optional(),
  socialSecurityWithheld: z.coerce.number().optional(),
  medicareWithheld: z.coerce.number().optional(),
  otherDeductions: z.coerce.number().optional(),
  payPeriodStartDate: z.string().optional(),
  payPeriodEndDate: z.string().optional(),
  payFrequency: z.string().optional(),
  benefitsSummary: z.string().optional(),
  bonusIncome: z.coerce.number().optional(),
  yearToDateIncome: z.coerce.number().optional(),
  employerName: z.string().optional(),
});

// Schema for Other Account
const tsOtherAccountSchema = baseAccountSchema.extend({
  type: z.literal('Other'),
  totalAssetValue: z.coerce.number().optional(), // For balance calculation
  totalLiabilityValue: z.coerce.number().optional(), // For balance calculation
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

export type AccountFormData = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  accountToEdit?: Account;
}

export function AccountForm({ isOpen, onOpenChange, accountToEdit }: AccountFormProps) {
  const { addAccount, editAccount } = useAccounts();
  const { toast } = useToast();
  const [inputType, setInputType] = useState<'form' | 'json'>('form');
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: accountToEdit ? (accountToEdit as AccountFormData) : { // Map specific balance fields
      name: '',
      balance: 0,
      currency: 'USD',
      type: 'Checking/Savings', // Default type
      description: '',
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control as Control<AccountFormData & { holdings?: AssetDistribution[] }>,
    name: "holdings" as 'holdings',
  });

  useEffect(() => {
    let defaultValues: Partial<AccountFormData> = {
      name: '',
      balance: 0,
      currency: 'USD',
      type: 'Checking/Savings',
      description: '',
      holdings: [], // Common for investment types
    };

    if (accountToEdit) {
      defaultValues = { ...accountToEdit } as AccountFormData;
      // Ensure holdings are correctly populated for relevant types
      if (['Investment', 'HSA', 'Traditional IRA', 'Roth IRA', 'Retirement 401k', 'Roth 401k'].includes(accountToEdit.type) && (accountToEdit as any).holdings) {
        form.setValue('holdings', (accountToEdit as any).holdings as AssetDistribution[]);
      } else {
        form.setValue('holdings', []);
      }
    }
    form.reset(defaultValues);
  }, [accountToEdit, form, isOpen]);


  const watchedAccountType = form.watch('type');

  // Helper to calculate balance before submission if specific fields are used
  const prepareDataForSubmit = (data: AccountFormData): AccountFormData => {
    let balance = data.balance; // Use provided balance by default
    switch (data.type) {
      case 'Investment':
      case 'HSA':
      case 'Traditional IRA':
      case 'Roth IRA':
      case 'Retirement 401k':
      case 'Roth 401k':
        balance = data.uninvestedAmount ?? data.balance ?? 0;
        break;
      case 'Credit Card':
        balance = data.outstandingDebt !== undefined ? -Math.abs(data.outstandingDebt) : data.balance ?? 0;
        break;
      case 'Checking/Savings':
        // 'balance' is already currentAmount for Checking/Savings type
        break;
      case 'Loan':
        balance = data.originalAmount !== undefined && data.totalPaidToDate !== undefined
                    ? -(data.originalAmount - data.totalPaidToDate) // Simplified, might need more robust logic for actual outstanding balance
                    : data.balance ?? 0; // Fallback to manually entered balance if specific fields are missing
        break;
      case 'Payroll':
        // 'balance' field can store last net income for Payroll
        break;
      case 'Other':
        balance = (data.totalAssetValue ?? 0) - (data.totalLiabilityValue ?? 0);
        break;
    }
    return { ...data, balance };
  };


  const onSubmit = (data: AccountFormData) => {
    const processedData = prepareDataForSubmit(data);
    try {
      if (accountToEdit) {
        editAccount({ ...processedData, id: accountToEdit.id } as Account);
        toast({ title: "Success", description: "Account updated successfully." });
      } else {
        addAccount(processedData as Account);
        toast({ title: "Success", description: "Account added successfully." });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Submission error", error);
      toast({ title: "Error", description: "Failed to save account.", variant: "destructive" });
    }
  };

  const handleJsonSubmit = () => {
    try {
      const parsedData = JSON.parse(jsonInput);
      const validationResult = accountFormSchema.safeParse(parsedData);
      if (validationResult.success) {
        setJsonError(null);
        onSubmit(validationResult.data); // onSubmit will handle balance calculation
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
            <Select onValueChange={(value) => { field.onChange(value); form.setValue('holdings', []); }} defaultValue={field.value}> {/* Reset holdings on type change */}
              <FormControl><SelectTrigger><SelectValue placeholder="Select account type" /></SelectTrigger></FormControl>
              <SelectContent>{ACCOUNT_TYPES.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
            </Select><FormMessage /></FormItem>
        )} />
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="balance" render={({ field }) => (
            <FormItem><FormLabel>Balance / Primary Value</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage />
            <p className="text-xs text-muted-foreground pt-1">Represents main balance, uninvested cash, outstanding debt (negative), or net income based on type.</p>
            </FormItem>
          )} />
        <FormField control={form.control} name="currency" render={({ field }) => (
            <FormItem><FormLabel>Currency</FormLabel><FormControl><Input placeholder="USD" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
      </div>
      <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Any notes about this account" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
        )} />
    </>
  );
  
  const renderInvestmentHoldingsFields = () => (
    <div className="space-y-4 pt-2 border-t mt-4">
      <Label className="text-base font-medium">Holdings / Asset Distribution</Label>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md bg-muted/30">
          <FormField control={form.control} name={`holdings.${index}.name`} render={({ field: f }) => (
              <FormItem className="flex-1"><FormLabel className="text-xs">Asset Name</FormLabel><FormControl><Input placeholder="E.g., AAPL, VTI" {...f} /></FormControl><FormMessage /></FormItem>
            )} />
          <FormField control={form.control} name={`holdings.${index}.percentage`} render={({ field: f }) => (
              <FormItem className="w-1/3"><FormLabel className="text-xs">Percentage (%)</FormLabel><FormControl><Input type="number" placeholder="20" {...f} /></FormControl><FormMessage /></FormItem>
            )} />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove asset"><MinusCircle className="h-5 w-5 text-destructive" /></Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ id: crypto.randomUUID(), name: '', percentage: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Holding</Button>
    </div>
  );

  const renderInvestmentLikeFields = (is401k = false) => (
    <>
      <FormField control={form.control} name="uninvestedAmount" render={({ field }) => ( <FormItem><FormLabel>Uninvested Cash Amount (Optional)</FormLabel><FormControl><Input type="number" placeholder="1000.00" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="averageMonthlyContribution" render={({ field }) => ( <FormItem><FormLabel>Avg. Monthly Contribution (Optional)</FormLabel><FormControl><Input type="number" placeholder="500.00" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      {is401k && <FormField control={form.control} name="employerMatch" render={({ field }) => ( <FormItem><FormLabel>Employer Match (e.g., 50% up to 6%)</FormLabel><FormControl><Input placeholder="Details of employer match" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />}
      {renderInvestmentHoldingsFields()}
    </>
  );

  const renderCreditCardFields = () => (
    <>
      <FormField control={form.control} name="outstandingDebt" render={({ field }) => ( <FormItem><FormLabel>Outstanding Debt (Positive Number)</FormLabel><FormControl><Input type="number" placeholder="1200.50" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="totalLimit" render={({ field }) => ( <FormItem><FormLabel>Total Credit Limit</FormLabel><FormControl><Input type="number" placeholder="5000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="interestRate" render={({ field }) => ( <FormItem><FormLabel>Interest Rate (APR %)</FormLabel><FormControl><Input type="number" placeholder="19.99" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="cardNumberLast4" render={({ field }) => ( <FormItem><FormLabel>Card Number (Last 4, Optional)</FormLabel><FormControl><Input placeholder="1234" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="dueDate" render={({ field }) => ( <FormItem><FormLabel>Payment Due Date (Optional)</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="annualFee" render={({ field }) => ( <FormItem><FormLabel>Annual Fee (Optional)</FormLabel><FormControl><Input type="number" placeholder="95" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="rewardsSummary" render={({ field }) => ( <FormItem><FormLabel>Rewards Summary (Optional)</FormLabel><FormControl><Textarea placeholder="E.g., 2% cashback on travel" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="transactionsSummary" render={({ field }) => ( <FormItem><FormLabel>Recent Transactions Note (Optional)</FormLabel><FormControl><Textarea placeholder="Summary of recent spending activity" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
    </>
  );
  
  const renderCheckingSavingsFields = () => (
    <>
      <FormField control={form.control} name="bankName" render={({ field }) => ( <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="E.g., Chase, Wells Fargo" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="accountNumberLast4" render={({ field }) => ( <FormItem><FormLabel>Account Number (Last 4, Optional)</FormLabel><FormControl><Input placeholder="5678" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="interestRate" render={({ field }) => ( <FormItem><FormLabel>Interest Rate (APY %, Optional)</FormLabel><FormControl><Input type="number" placeholder="0.5" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="minimumBalanceRequirement" render={({ field }) => ( <FormItem><FormLabel>Minimum Balance Req. (Optional)</FormLabel><FormControl><Input type="number" placeholder="1500" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="overdraftProtection" render={({ field }) => ( <FormItem><FormLabel>Overdraft Protection (Optional)</FormLabel><FormControl><Input placeholder="E.g., Enabled, Linked to Savings" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <Label className="text-base font-medium mt-3 mb-1 block">Fees (Optional)</Label>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 border rounded-md bg-muted/30">
        <FormField control={form.control} name="fees.monthlyFee" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Monthly Fee</FormLabel><FormControl><Input type="number" placeholder="10" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="fees.atmFee" render={({ field }) => ( <FormItem><FormLabel className="text-xs">ATM Fee</FormLabel><FormControl><Input type="number" placeholder="2.50" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="fees.overdraftFee" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Overdraft Fee</FormLabel><FormControl><Input type="number" placeholder="35" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="fees.noMinimumBalanceFee" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Min. Balance Fee</FormLabel><FormControl><Input type="number" placeholder="12" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      </div>
      <FormField control={form.control} name="rewardsSummary" render={({ field }) => ( <FormItem><FormLabel>Rewards Summary (Optional)</FormLabel><FormControl><Textarea placeholder="E.g., $200 bonus for new account" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="transactionsSummary" render={({ field }) => ( <FormItem><FormLabel>Recent Transactions Note (Optional)</FormLabel><FormControl><Textarea placeholder="Summary of recent activity" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
    </>
  );

  const renderLoanFields = () => (
    <>
      <FormField control={form.control} name="originalAmount" render={({ field }) => ( <FormItem><FormLabel>Original Loan Amount</FormLabel><FormControl><Input type="number" placeholder="250000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="interestRate" render={({ field }) => ( <FormItem><FormLabel>Interest Rate (%)</FormLabel><FormControl><Input type="number" placeholder="3.75" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="monthlyContribution" render={({ field }) => ( <FormItem><FormLabel>Monthly Payment</FormLabel><FormControl><Input type="number" placeholder="1200" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="loanType" render={({ field }) => ( <FormItem><FormLabel>Loan Type (e.g., Mortgage, Auto)</FormLabel><FormControl><Input placeholder="Mortgage" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="loanTerm" render={({ field }) => ( <FormItem><FormLabel>Loan Term (e.g., 30 years)</FormLabel><FormControl><Input placeholder="30 years" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="loanStartDate" render={({ field }) => ( <FormItem><FormLabel>Loan Start Date</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="loanEndDate" render={({ field }) => ( <FormItem><FormLabel>Loan End Date (Optional)</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="nextPaymentDueDate" render={({ field }) => ( <FormItem><FormLabel>Next Payment Due Date (Optional)</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="totalPaidToDate" render={({ field }) => ( <FormItem><FormLabel>Total Paid to Date (Optional)</FormLabel><FormControl><Input type="number" placeholder="50000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="collateral" render={({ field }) => ( <FormItem><FormLabel>Collateral (Optional)</FormLabel><FormControl><Input placeholder="E.g., Property address, Car VIN" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <Label className="text-base font-medium mt-3 mb-1 block">Loan Fees (Optional)</Label>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 border rounded-md bg-muted/30">
        <FormField control={form.control} name="currentOutstandingFees.lateFee" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Late Fee</FormLabel><FormControl><Input type="number" placeholder="25" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="currentOutstandingFees.prepaymentPenalty" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Prepayment Penalty</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="currentOutstandingFees.originationFee" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Origination Fee</FormLabel><FormControl><Input type="number" placeholder="500" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="currentOutstandingFees.otherFees" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Other Fees</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      </div>
      <FormField control={form.control} name="paymentHistorySummary" render={({ field }) => ( <FormItem><FormLabel>Payment History Note (Optional)</FormLabel><FormControl><Textarea placeholder="Summary of payment history" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
    </>
  );

  const renderPayrollFields = () => (
    <>
      <FormField control={form.control} name="employerName" render={({ field }) => ( <FormItem><FormLabel>Employer Name</FormLabel><FormControl><Input placeholder="E.g., Acme Corp" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="annualIncome" render={({ field }) => ( <FormItem><FormLabel>Annual Income (Gross)</FormLabel><FormControl><Input type="number" placeholder="75000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="payFrequency" render={({ field }) => ( <FormItem><FormLabel>Pay Frequency</FormLabel><FormControl><Input placeholder="E.g., Bi-weekly, Monthly" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="yearToDateIncome" render={({ field }) => ( <FormItem><FormLabel>Year-to-Date Income (Gross, Optional)</FormLabel><FormControl><Input type="number" placeholder="30000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="bonusIncome" render={({ field }) => ( <FormItem><FormLabel>Bonus Income (Annual, Optional)</FormLabel><FormControl><Input type="number" placeholder="5000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="payPeriodStartDate" render={({ field }) => ( <FormItem><FormLabel>Last Pay Period Start Date</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="payPeriodEndDate" render={({ field }) => ( <FormItem><FormLabel>Last Pay Period End Date</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <Label className="text-base font-medium mt-3 mb-1 block">Withholdings for Last Pay Period (Optional)</Label>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 border rounded-md bg-muted/30">
        <FormField control={form.control} name="federalTaxesWithheld" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Federal Taxes</FormLabel><FormControl><Input type="number" placeholder="300" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="stateOfWork" render={({ field }) => ( <FormItem><FormLabel className="text-xs">State of Work</FormLabel><FormControl><Input placeholder="E.g., CA, NY" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="stateTaxesWithheld" render={({ field }) => ( <FormItem><FormLabel className="text-xs">State Taxes</FormLabel><FormControl><Input type="number" placeholder="100" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="socialSecurityWithheld" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Social Security</FormLabel><FormControl><Input type="number" placeholder="150" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="medicareWithheld" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Medicare</FormLabel><FormControl><Input type="number" placeholder="70" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="otherDeductions" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Other Deductions</FormLabel><FormControl><Input type="number" placeholder="50" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      </div>
      <FormField control={form.control} name="benefitsSummary" render={({ field }) => ( <FormItem><FormLabel>Benefits Summary (Optional)</FormLabel><FormControl><Textarea placeholder="E.g., Health Insurance, 401k contribution" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
    </>
  );

  const renderOtherFields = () => (
    <>
      <FormField control={form.control} name="totalAssetValue" render={({ field }) => ( <FormItem><FormLabel>Total Asset Value (Optional)</FormLabel><FormControl><Input type="number" placeholder="10000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={form.control} name="totalLiabilityValue" render={({ field }) => ( <FormItem><FormLabel>Total Liability Value (Optional)</FormLabel><FormControl><Input type="number" placeholder="2000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if (!open) { form.reset(); setJsonInput(''); setJsonError(null); } }}>
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
              {watchedAccountType === 'HSA' && renderInvestmentLikeFields()}
              {watchedAccountType === 'Traditional IRA' && renderInvestmentLikeFields()}
              {watchedAccountType === 'Roth IRA' && renderInvestmentLikeFields()}
              {watchedAccountType === 'Retirement 401k' && renderInvestmentLikeFields(true)}
              {watchedAccountType === 'Roth 401k' && renderInvestmentLikeFields(true)}
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
              placeholder='{ "name": "My New Account", "type": "Checking/Savings", "balance": 5000, "currency": "USD", ... }' />
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
