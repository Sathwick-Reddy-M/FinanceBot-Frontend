
"use client";

import type { ReactNode } from 'react';
import { AccountProvider } from '@/contexts/AccountContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { UserDetailsProvider } from '@/contexts/UserDetailsContext'; // Added
import { Toaster } from "@/components/ui/toaster";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UserDetailsProvider> {/* Added UserDetailsProvider */}
      <AccountProvider>
        <ChatProvider>
          {children}
          <Toaster />
        </ChatProvider>
      </AccountProvider>
    </UserDetailsProvider>
  );
}
