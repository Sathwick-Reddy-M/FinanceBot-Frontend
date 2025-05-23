
"use client";

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Trash2, Loader2, MessageCircle } from 'lucide-react';
import { ChatMessageBubble } from './ChatMessageBubble';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function Chatbot() {
  const { messages, sendMessage, isSending, clearChat } = useChat();
  const [inputValue, setInputValue] = useState('');
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isSending) return;
    await sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <Card className="shadow-xl flex flex-col h-[calc(100vh-12rem)] max-h-[700px] w-full max-w-2xl mx-auto border border-border/70">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Financial Assistant</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={clearChat} disabled={messages.length === 0 || isSending} aria-label="Clear chat">
          <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-full" viewportRef={viewportRef}>
          <div className="p-4 space-y-2">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground pt-8 flex flex-col items-center">
                <MessageCircle className="h-12 w-12 text-primary/50 mb-4" />
                <p className="font-medium">Ask me anything about your finances!</p>
                <p className="text-sm">
                  E.g., "Can I afford a new car?" or "Summarize my investments."
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSending}
            className="flex-grow"
            aria-label="Chat message input"
          />
          <Button type="submit" disabled={isSending || !inputValue.trim()} size="icon" aria-label="Send message">
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
