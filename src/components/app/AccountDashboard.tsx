
"use client";

import { useState, useMemo } from 'react';
import { useAccounts } from '@/contexts/AccountContext';
import { AccountCard } from './AccountCard';
import { Button } from '@/components/ui/button';
import { AccountForm } from './AccountForm';
import type { Account, AccountType } from '@/lib/types';
import { ACCOUNT_TYPES } from '@/lib/types';
import { DeleteAccountDialog } from './DeleteAccountDialog';
import { PlusCircle, Briefcase, Landmark, TrendingUp, CreditCard, Layers } from 'lucide-react'; // Specific icons
import { Skeleton } from '@/components/ui/skeleton';

const AccountTypeIcons: Record<AccountType, React.ElementType> = {
  Banking: Landmark,
  Investment: TrendingUp,
  Loan: Briefcase, // Using Briefcase for loans as an alternative to a more direct money icon.
  CreditCard: CreditCard,
  Other: Layers,
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
      <div className="space-y-8">
        {ACCOUNT_TYPES.map(type => (
          <div key={type}>
            <Skeleton className="h-8 w-1/4 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2].map(i => <Skeleton key={`${type}-skel-${i}`} className="h-60 rounded-lg" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold">My Accounts</h2>
        <Button onClick={handleAddAccount} size="lg">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Account
        </Button>
      </div>

      {ACCOUNT_TYPES.map((type) => {
        const accountsOfType = groupedAccounts[type] || [];
        if (accountsOfType.length === 0 && !accounts.some(acc => acc.type === type && accountsOfType.length > 0)) { // Show section header only if there's potential for accounts
          // If no accounts of this type, but want to keep sections, can render a placeholder or skip
          // return null; // Or a message like "No ${type} accounts yet."
        }
        const IconComponent = AccountTypeIcons[type];
        return (
          (accountsOfType.length > 0 || accounts.length === 0) && ( // Show section if accounts exist or if no accounts at all (for initial empty state)
            <section key={type} className="space-y-4">
              <h3 className="text-2xl font-medium text-primary border-b-2 border-primary/30 pb-2 flex items-center">
                <IconComponent className="mr-3 h-6 w-6" />
                {type} Accounts
              </h3>
              {accountsOfType.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {accountsOfType.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      onEdit={handleEditAccount}
                      onDelete={handleDeleteAccount}
                    />
                  ))}
                </div>
              ) : (
                 accounts.length === 0 && ( <p className="text-muted-foreground">No {type.toLowerCase()} accounts added yet. Click "Add New Account" to get started.</p> )
              )}
            </section>
          )
        );
      })}

      {accounts.length === 0 && !loading && (
         <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Accounts Yet</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your financial accounts.</p>
            <Button onClick={handleAddAccount}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add First Account
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
