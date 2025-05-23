
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import type { Account, AssetDistribution } from '@/lib/types'; // AssetDistribution is already here
import { useSessionStorageState } from '@/hooks/useSessionStorageState';
import { SESSION_STORAGE_ACCOUNTS_KEY } from '@/lib/constants';

interface AccountContextType {
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id'> | Account) => void; // Allow passing account without ID for adding
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

  const addAccount = (account: Omit<Account, 'id'> | Account) => {
    const newAccountWithId = { ...account, id: (account as Account).id || crypto.randomUUID() } as Account;
    
    // Ensure holdings have IDs if they exist (common for investment-like types)
    if ('holdings' in newAccountWithId && newAccountWithId.holdings) {
      newAccountWithId.holdings = newAccountWithId.holdings.map((h: AssetDistribution) => ({...h, id: h.id || crypto.randomUUID()}));
    }
    setAccounts((prevAccounts) => [...prevAccounts, newAccountWithId]);
  };

  const editAccount = (updatedAccount: Account) => {
     // Ensure holdings have IDs if they exist
    if ('holdings' in updatedAccount && updatedAccount.holdings) {
      updatedAccount.holdings = updatedAccount.holdings.map((h: AssetDistribution) => ({...h, id: h.id || crypto.randomUUID()}));
    }
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) =>
        acc.id === updatedAccount.id ? updatedAccount : acc
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
