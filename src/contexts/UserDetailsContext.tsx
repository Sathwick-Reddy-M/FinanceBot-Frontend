
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UserDetails } from '@/lib/types';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';
import { SESSION_STORAGE_USER_DETAILS_KEY } from '@/lib/constants';

interface UserDetailsContextType {
  userDetails: UserDetails | null;
  updateUserDetails: (details: UserDetails) => void;
  loading: boolean;
}

const UserDetailsContext = createContext<UserDetailsContextType | undefined>(undefined);

const defaultUserDetails: UserDetails | null = null;

export const UserDetailsProvider = ({ children }: { children: ReactNode }) => {
  const [userDetails, setUserDetails] = useSessionStorageState<UserDetails | null>(
    SESSION_STORAGE_USER_DETAILS_KEY,
    defaultUserDetails
  );
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Simulate loading delay if needed, or just set to false if data is ready fast
    // This helps prevent UI flicker if session storage is quick
    const item = sessionStorage.getItem(SESSION_STORAGE_USER_DETAILS_KEY);
    if (item) {
        try {
            setUserDetails(JSON.parse(item));
        } catch (e) {
            console.error("Failed to parse user details from session storage", e);
            setUserDetails(defaultUserDetails);
        }
    }
    setLoading(false);
  }, [setUserDetails]);

  const updateUserDetails = useCallback((details: UserDetails) => {
    setUserDetails(details);
  }, [setUserDetails]);

  return (
    <UserDetailsContext.Provider value={{ userDetails, updateUserDetails, loading }}>
      {children}
    </UserDetailsContext.Provider>
  );
};

export const useUserDetails = () => {
  const context = useContext(UserDetailsContext);
  if (context === undefined) {
    throw new Error('useUserDetails must be used within a UserDetailsProvider');
  }
  return context;
};
