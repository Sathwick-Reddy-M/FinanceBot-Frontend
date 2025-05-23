
"use client";

import type { ReactNode } from 'react';
import { AccountProvider } from '@/contexts/AccountContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { Toaster } from "@/components/ui/toaster";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AccountProvider>
      <ChatProvider>
        {children}
        <Toaster />
      </ChatProvider>
    </AccountProvider>
  );
}
