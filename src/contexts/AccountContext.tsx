
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import type { Account, AssetDistribution } from '@/lib/types';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';
import { SESSION_STORAGE_ACCOUNTS_KEY } from '@/lib/constants';

interface AccountContextType {
  accounts: Account[];
  addAccount: (account: Account) => boolean; // Returns true if added, false if duplicate
  editAccount: (updatedAccount: Account) => void;
  deleteAccount: (accountId: string) => void;
  getAccountById: (accountId: string) => Account | undefined;
  loading: boolean;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const EMPTY_ACCOUNTS: Account[] = []; // Define stable initial value

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useSessionStorageState<Account[]>(SESSION_STORAGE_ACCOUNTS_KEY, EMPTY_ACCOUNTS);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(false); 
  }, []);

  const addAccount = (account: Account): boolean => {
    if (accounts.some(existingAccount => existingAccount.id === account.id)) {
      alert('Account with this ID already exists. Please use a unique ID.');
      return false; // Indicate failure due to duplicate ID
    }
    
    let accountToAdd = { ...account };
    
    if ('asset_distribution' in accountToAdd && Array.isArray((accountToAdd as any).asset_distribution)) {
      (accountToAdd as any).asset_distribution = (accountToAdd as any).asset_distribution.map((item: AssetDistribution) => ({
        ...item,
        id: item.id || crypto.randomUUID(), 
      }));
    }
    setAccounts((prevAccounts) => [...prevAccounts, accountToAdd]);
    return true; // Indicate success
  };

  const editAccount = (updatedAccount: Account) => {
    let accountToUpdate = { ...updatedAccount };
    if ('asset_distribution' in accountToUpdate && Array.isArray((accountToUpdate as any).asset_distribution)) {
      (accountToUpdate as any).asset_distribution = (accountToUpdate as any).asset_distribution.map((item: AssetDistribution) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
      }));
    }
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

