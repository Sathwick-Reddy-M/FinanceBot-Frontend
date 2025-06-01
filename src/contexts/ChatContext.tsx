
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ChatMessage, Account } from '@/lib/types';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';
import { SESSION_STORAGE_CHAT_KEY, SESSION_STORAGE_USER_DETAILS_KEY, SESSION_STORAGE_ACCOUNTS_KEY } from '@/lib/constants';
import { useAccounts } from './AccountContext'; // To get financial data

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  sendMessage: (text: string) => Promise<void>;
  isSending: boolean;
  clearChat: () => void;
  chatLoading: boolean; // Exposed for Chatbot
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const EMPTY_MESSAGES: ChatMessage[] = []; // Define stable initial value

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [rawMessages, setRawMessages] = useSessionStorageState<ChatMessage[]>(SESSION_STORAGE_CHAT_KEY, EMPTY_MESSAGES);
  const [clientMessages, setClientMessages] = useState<ChatMessage[]>(EMPTY_MESSAGES);
  const [chatLoading, setChatLoading] = useState(true); // Renamed from isLoading to avoid conflict
  const [isSending, setIsSending] = useState(false);
  const { accounts } = useAccounts(); // Get current accounts

  useEffect(() => {
    // This effect ensures clientMessages are populated after rawMessages (from session storage) are loaded
    // and sets chatLoading to false.
    setClientMessages(rawMessages);
    setChatLoading(false);
  }, [rawMessages]);


  const addMessageInternal = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>, isLoadingFlag = false) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      isLoading: isLoadingFlag,
    };
    // Update rawMessages (which updates session storage via useSessionStorageState)
    setRawMessages((prevMessages) => [...prevMessages, newMessage]);
    // clientMessages will update via the useEffect listening to rawMessages
    return newMessage.id;
  }, [setRawMessages]);

  const updateMessageLoadingState = useCallback((messageId: string, isLoadingFlag: boolean, newText?: string) => {
    setRawMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isLoading: isLoadingFlag, ...(newText && {text: newText}) } : msg
    ));
  }, [setRawMessages]);


  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    addMessageInternal({ sender: 'user', text });
    setIsSending(true);
    const botMessageId = addMessageInternal({ sender: 'bot', text: "Thinking..." }, true);

    try {
      const userDetailsString = sessionStorage.getItem(SESSION_STORAGE_USER_DETAILS_KEY);
      const userDetails = userDetailsString ? JSON.parse(userDetailsString) : {};
      // accounts are already available from useAccounts()
      const chatMessagesString = sessionStorage.getItem(SESSION_STORAGE_CHAT_KEY); // Get latest messages from storage
      const chatMessagesData = chatMessagesString ? JSON.parse(chatMessagesString) : [];


      const response = await fetch('https://financebot-backend-yf9z.onrender.com/chat', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_details: userDetails,
          accounts: accounts, // Use accounts from context
          chatMessages: chatMessagesData, // Send current messages for context
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
    setRawMessages(EMPTY_MESSAGES); // Reset rawMessages (and thus session storage)
    setClientMessages(EMPTY_MESSAGES); // Also reset clientMessages
  };

  return (
    <ChatContext.Provider value={{ messages: clientMessages, addMessage, sendMessage, isSending, clearChat, chatLoading }}>
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

