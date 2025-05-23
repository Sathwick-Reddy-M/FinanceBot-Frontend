
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import type { Account, AssetDistribution } from '@/lib/types';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';
import { SESSION_STORAGE_ACCOUNTS_KEY } from '@/lib/constants';

interface AccountContextType {
  accounts: Account[];
  addAccount: (account: Account) => void;
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
    // Simulate loading delay or if there were async operations to fetch initial state
    setLoading(false); 
  }, []);

  const addAccount = (account: Account) => {
    const newAccount = { ...account, id: account.id || crypto.randomUUID() };
    if (newAccount.type === 'Investment' && newAccount.holdings) {
      newAccount.holdings = newAccount.holdings.map(h => ({...h, id: h.id || crypto.randomUUID()}));
    }
    setAccounts((prevAccounts) => [...prevAccounts, newAccount]);
  };

  const editAccount = (updatedAccount: Account) => {
    if (updatedAccount.type === 'Investment' && updatedAccount.holdings) {
      updatedAccount.holdings = updatedAccount.holdings.map(h => ({...h, id: h.id || crypto.randomUUID()}));
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
