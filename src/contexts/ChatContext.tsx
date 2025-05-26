
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ChatMessage, Account } from '@/lib/types';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';
import { submitChatMessageAction } from '@/lib/actions';
import { SESSION_STORAGE_CHAT_KEY, SESSION_STORAGE_USER_DETAILS_KEY, SESSION_STORAGE_ACCOUNTS_KEY } from '@/lib/constants';
import { useAccounts } from './AccountContext'; // To get financial data

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  sendMessage: (text: string) => Promise<void>;
  isSending: boolean;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useSessionStorageState<ChatMessage[]>(SESSION_STORAGE_CHAT_KEY, []);
  const [isSending, setIsSending] = useState(false);
  const { accounts } = useAccounts(); // Get current accounts

  const addMessageInternal = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>, isLoading = false) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      isLoading,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    return newMessage.id;
  }, [setMessages]);

  const updateMessageLoadingState = useCallback((messageId: string, isLoading: boolean, newText?: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isLoading, ...(newText && {text: newText}) } : msg
    ));
  }, [setMessages]);


  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    addMessageInternal({ sender: 'user', text });
    setIsSending(true);
    const botMessageId = addMessageInternal({ sender: 'bot', text: "Thinking..." }, true);

    try {
      const userDetailsString = sessionStorage.getItem(SESSION_STORAGE_USER_DETAILS_KEY);
      const userDetails = userDetailsString ? JSON.parse(userDetailsString) : {};
      const userAccountsString = sessionStorage.getItem(SESSION_STORAGE_ACCOUNTS_KEY);
      const accountsData = userAccountsString ? JSON.parse(userAccountsString) : [];
      const chatMessages = sessionStorage.getItem(SESSION_STORAGE_CHAT_KEY);
      const chatMessagesData = chatMessages ? JSON.parse(chatMessages) : [];

      const response = await fetch('https://financebot-backend-yf9z.onrender.com/chat', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_details: userDetails,
          accounts: accountsData,
          chatMessages: chatMessagesData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const botResponseText = data.response || "No response from the bot.";
      updateMessageLoadingState(botMessageId, false, botResponseText);
    } catch (error) {
      console.error("Error sending message:", error);
      updateMessageLoadingState(botMessageId, false, "Sorry, I couldn't get a response. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    addMessageInternal(message);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage, sendMessage, isSending, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
