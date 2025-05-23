
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import type { Account, AssetDistribution } from '@/lib/types';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';
import { SESSION_STORAGE_ACCOUNTS_KEY } from '@/lib/constants';

interface AccountContextType {
  accounts: Account[];
  addAccount: (account: Account) => void; // Expects full Account object now
  editAccount: (updatedAccount: Account) => void;
  deleteAccount: (accountId: string) => void;
  getAccountById: (accountId: string) => Account | undefined;
  loading: boolean;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useSessionStorageState<Account[]>(SESSION_STORAGE_ACCOUNTS_KEY, []);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(false); 
  }, []);

  const addAccount = (account: Account) => {
    // Account object from form submission should already have id and calculated balance
    let accountToAdd = { ...account };
    
    if ('assest_distribution' in accountToAdd && accountToAdd.assest_distribution) {
      accountToAdd.assest_distribution = accountToAdd.assest_distribution.map((h: AssetDistribution) => ({...h, id: h.id || crypto.randomUUID()}));
    }
    // Similar logic for other array fields if they need client-side IDs for React keys, e.g., current_billing_cycle_transactions
    // For now, only assest_distribution is explicitly managed with useFieldArray in the form for IDs.

    setAccounts((prevAccounts) => [...prevAccounts, accountToAdd]);
  };

  const editAccount = (updatedAccount: Account) => {
    let accountToUpdate = { ...updatedAccount };
    if ('assest_distribution' in accountToUpdate && accountToUpdate.assest_distribution) {
      accountToUpdate.assest_distribution = accountToUpdate.assest_distribution.map((h: AssetDistribution) => ({...h, id: h.id || crypto.randomUUID()}));
    }
    // Similar for other arrays if needed
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) =>
        acc.id === accountToUpdate.id ? accountToUpdate : acc
      )
    );
  };

  const deleteAccount = (accountId: string) => {
    setAccounts((prevAccounts) =>
      prevAccounts.filter((acc) => acc.id !== accountId)
    );
  };

  const getAccountById = (accountId: string) => {
    return accounts.find(acc => acc.id === accountId);
  };
  

  return (
    <AccountContext.Provider value={{ accounts, addAccount, editAccount, deleteAccount, getAccountById, loading }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
};
