
"use client";

import type { Control, UseFormReturn } from 'react-hook-form';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import type { Account, AccountType, AssetDistribution, InvestmentAccount } from '@/lib/types';
import { ACCOUNT_TYPES } from '@/lib/types';
import { useAccounts } from '@/contexts/AccountContext';
import { PlusCircle, Trash2, MinusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const assetDistributionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Asset name is required"),
  percentage: z.coerce.number().min(0, "Percentage must be non-negative").max(100, "Percentage cannot exceed 100"),
});

const baseAccountSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(ACCOUNT_TYPES, { required_error: 'Account type is required' }),
  balance: z.coerce.number({invalid_type_error: 'Balance must be a number'}),
  currency: z.string().min(3, 'Currency code is required (e.g., USD)').max(3).default('USD'),
});

const investmentAccountSchema = baseAccountSchema.extend({
  type: z.literal('Investment'),
  holdings: z.array(assetDistributionSchema).optional(),
});

const bankingAccountSchema = baseAccountSchema.extend({
  type: z.literal('Banking'),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
});

const loanAccountSchema = baseAccountSchema.extend({
  type: z.literal('Loan'),
  interestRate: z.coerce.number().optional(),
  originalAmount: z.coerce.number().optional(),
});

const creditCardAccountSchema = baseAccountSchema.extend({
  type: z.literal('CreditCard'),
  cardNumber: z.string().optional(),
  creditLimit: z.coerce.number().optional(),
  dueDate: z.string().optional(), // Consider date validation if needed
});

const otherAccountSchema = baseAccountSchema.extend({
  type: z.literal('Other'),
  description: z.string().optional(),
});

// This combined schema is used for validation within the form
// It's a discriminated union based on the 'type' field
const accountFormSchema = z.discriminatedUnion("type", [
  investmentAccountSchema,
  bankingAccountSchema,
  loanAccountSchema,
  creditCardAccountSchema,
  otherAccountSchema,
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
    defaultValues: accountToEdit || {
      name: '',
      balance: 0,
      currency: 'USD',
      type: 'Banking', // Default type
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control as Control<InvestmentAccount>, // Cast control type
    name: "holdings" as 'holdings', // Explicitly type name
  });

  useEffect(() => {
    if (accountToEdit) {
      form.reset(accountToEdit as AccountFormData);
      if (accountToEdit.type === 'Investment' && accountToEdit.holdings) {
        // useFieldArray doesn't reset properly with nested arrays sometimes
        // Ensure holdings are correctly populated
        form.setValue('holdings', accountToEdit.holdings as AssetDistribution[]);
      }
    } else {
      form.reset({
        name: '',
        balance: 0,
        currency: 'USD',
        type: 'Banking',
        holdings: [],
      });
    }
  }, [accountToEdit, form, isOpen]);

  const watchedAccountType = form.watch('type');

  const onSubmit = (data: AccountFormData) => {
    try {
      if (accountToEdit) {
        editAccount({ ...data, id: accountToEdit.id } as Account);
        toast({ title: "Success", description: "Account updated successfully." });
      } else {
        addAccount(data as Account);
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
        onSubmit(validationResult.data);
      } else {
        setJsonError(validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
        toast({ title: "JSON Validation Error", description: jsonError, variant: "destructive" });
      }
    } catch (e) {
      setJsonError('Invalid JSON format.');
      toast({ title: "JSON Parse Error", description: "Invalid JSON format.", variant: "destructive" });
    }
  };

  const renderCommonFields = () => (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Name</FormLabel>
            <FormControl>
              <Input placeholder="E.g., Chase Checking" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Balance</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input placeholder="USD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
  
  const renderInvestmentFields = () => (
    <div className="space-y-4">
      <Label>Asset Distributions</Label>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-end gap-2 p-2 border rounded-md">
          <FormField
            control={form.control}
            name={`holdings.${index}.name`}
            render={({ field: f }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs">Asset Name</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., AAPL" {...f} />
                </FormControl>
                 <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`holdings.${index}.percentage`}
            render={({ field: f }) => (
              <FormItem className="w-1/3">
                <FormLabel className="text-xs">Percentage (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="20" {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove asset">
            <MinusCircle className="h-5 w-5 text-destructive" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ id: crypto.randomUUID(), name: '', percentage: 0 })}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add Asset
      </Button>
    </div>
  );


  const renderBankingFields = () => (
    <>
      <FormField
        control={form.control}
        name="accountNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Number (Optional, last 4 digits)</FormLabel>
            <FormControl>
              <Input placeholder="1234" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="bankName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bank Name (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="E.g., Chase" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
  
  const renderLoanFields = () => (
    <>
       <FormField
        control={form.control}
        name="interestRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Interest Rate (Optional, %)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="3.5" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="originalAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Original Loan Amount (Optional)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="20000" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderCreditCardFields = () => (
    <>
      <FormField
        control={form.control}
        name="cardNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Card Number (Optional, last 4 digits)</FormLabel>
            <FormControl>
              <Input placeholder="5678" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name="creditLimit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Credit Limit (Optional)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="5000" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name="dueDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Due Date (Optional)</FormLabel>
            <FormControl>
              <Input type="date" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderOtherFields = () => (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description (Optional)</FormLabel>
          <FormControl>
            <Textarea placeholder="Details about this account" {...field} value={field.value || ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if (!open) form.reset(); setJsonInput(''); setJsonError(null); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{accountToEdit ? 'Edit Account' : 'Add New Account'}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center my-4">
          <Button variant={inputType === 'form' ? 'default' : 'outline'} onClick={() => setInputType('form')} className="mr-2">Form</Button>
          <Button variant={inputType === 'json' ? 'default' : 'outline'} onClick={() => setInputType('json')}>JSON</Button>
        </div>

        {inputType === 'form' ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {renderCommonFields()}
              {watchedAccountType === 'Investment' && renderInvestmentFields()}
              {watchedAccountType === 'Banking' && renderBankingFields()}
              {watchedAccountType === 'Loan' && renderLoanFields()}
              {watchedAccountType === 'CreditCard' && renderCreditCardFields()}
              {watchedAccountType === 'Other' && renderOtherFields()}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">{accountToEdit ? 'Save Changes' : 'Add Account'}</Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <Label htmlFor="json-input">Paste JSON data</Label>
            <Textarea
              id="json-input"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={10}
              placeholder='{ "name": "My Investment", "type": "Investment", "balance": 10000, "currency": "USD", "holdings": [{ "name": "Stock A", "percentage": 50 }] }'
            />
            {jsonError && <p className="text-sm text-destructive">{jsonError}</p>}
            <DialogFooter>
              <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleJsonSubmit}>{accountToEdit ? 'Save Changes via JSON' : 'Add Account via JSON'}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
