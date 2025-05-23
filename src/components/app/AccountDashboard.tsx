
"use client";

import { useState, useMemo } from 'react';
import { useAccounts } from '@/contexts/AccountContext';
import { AccountCard } from './AccountCard';
import { Button } from '@/components/ui/button';
import { AccountForm } from './AccountForm';
import type { Account, AccountType } from '@/lib/types';
import { ACCOUNT_TYPES_ENUM as ACCOUNT_TYPES_ALL } from '@/lib/types'; // Use the new enum
import { DeleteAccountDialog } from './DeleteAccountDialog';
import { PlusCircle, Briefcase, Landmark, TrendingUp, CreditCardIcon, Layers, Wallet, ShieldCheck, PiggyBank, Building2, FileText, FileSpreadsheet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Updated Icons for new account types
const AccountTypeIcons: Record<AccountType, React.ElementType> = {
  'Investment': TrendingUp,
  'HSA': ShieldCheck,
  'Traditional IRA': PiggyBank,
  'Roth IRA': PiggyBank, // Can be same or different
  'Retirement 401k': Briefcase, // Or Building2
  'Roth 401k': Building2, // Or Briefcase
  'Credit Card': CreditCardIcon,
  'Checking/Savings': Landmark,
  'Loan': FileText,
  'Payroll': FileSpreadsheet,
  'Other': Layers,
};


export function AccountDashboard() {
  const { accounts, loading } = useAccounts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const handleAddAccount = () => {
    setAccountToEdit(undefined);
    setIsFormOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setAccountToEdit(account);
    setIsFormOpen(true);
  };

  const handleDeleteAccount = (account: Account) => {
    setAccountToDelete(account);
    setIsDeleteDialogOpen(true);
  };

  const groupedAccounts = useMemo(() => {
    return accounts.reduce((acc, account) => {
      (acc[account.type] = acc[account.type] || []).push(account);
      return acc;
    }, {} as Record<AccountType, Account[]>);
  }, [accounts]);

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-48" />
        </div>
        {ACCOUNT_TYPES_ALL.map(type => (
          <div key={type}>
            <Skeleton className="h-8 w-1/4 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1,2].map(i => <Skeleton key={`${type}-skel-${i}`} className="h-72 rounded-xl" />)} {/* Slightly taller skeleton for new card height */}
            </div>
          </div>
        ))}
      </div>
    );
  }


  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">My Accounts Dashboard</h2>
        <Button onClick={handleAddAccount} size="lg" className="shadow-md hover:shadow-primary/30 transition-shadow">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Account
        </Button>
      </div>

      {ACCOUNT_TYPES_ALL.map((type) => {
        const accountsOfType = groupedAccounts[type] || [];
        // Only render section if there are accounts of this type
        if (accountsOfType.length === 0) { 
           return null; 
        }
        
        const IconComponent = AccountTypeIcons[type] || Layers; // Fallback icon
        return (
          <section key={type} className="space-y-4">
            <h3 className="text-2xl font-semibold text-primary border-b-2 border-primary/20 pb-2 flex items-center">
              <IconComponent className="mr-3 h-6 w-6" />
              {type} Accounts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              {accountsOfType.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onEdit={handleEditAccount}
                  onDelete={handleDeleteAccount}
                />
              ))}
            </div>
          </section>
        );
      })}

      {accounts.length === 0 && !loading && (
         <div className="text-center py-16 border-2 border-dashed border-border/50 rounded-xl bg-card/50">
            <Wallet className="mx-auto h-16 w-16 text-primary/60 mb-6" />
            <h3 className="text-2xl font-semibold text-foreground mb-3">No Accounts Added Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by adding your financial accounts to get a clear overview of your finances. 
              Click the button below to add your first account.
            </p>
            <Button onClick={handleAddAccount} size="lg" className="shadow-md hover:shadow-primary/30 transition-shadow">
              <PlusCircle className="mr-2 h-5 w-5" /> Add First Account
            </Button>
          </div>
      )}


      <AccountForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        accountToEdit={accountToEdit}
      />
      <DeleteAccountDialog
        account={accountToDelete}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </div>
  );
}
