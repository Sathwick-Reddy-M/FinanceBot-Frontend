
"use client";

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useUserDetails } from '@/contexts/UserDetailsContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Trash2, Loader2, MessageCircle } from 'lucide-react';
import { ChatMessageBubble } from './ChatMessageBubble';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Chatbot() {
  const { messages, sendMessage, isSending, clearChat } = useChat();
  const { userDetails, loading: userDetailsLoading } = useUserDetails();
  const [inputValue, setInputValue] = useState('');
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollEl = viewportRef.current;
    if (scrollEl) {
      let animationFrameId: number;
      const doScroll = () => {
        scrollEl.scrollTop = scrollEl.scrollHeight;
      };
      // Defer scroll to the next animation frame
      animationFrameId = requestAnimationFrame(doScroll);
      // Cleanup the animation frame if messages change again before it fires
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [messages]);

  const areUserDetailsComplete = !!userDetails;
  const isChatDisabledByUserDetails = !userDetailsLoading && !areUserDetailsComplete;
  const finalDisabledState = isSending || userDetailsLoading || !areUserDetailsComplete;

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || finalDisabledState) return;
    await sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <Card className="shadow-xl flex flex-col max-h-[600px] w-full mx-auto border border-border/70"> {/* Adjusted height constraints */}
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Financial Assistant</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={clearChat} disabled={messages.length === 0 || finalDisabledState} aria-label="Clear chat">
          <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-0 min-h-0"> {/* Added min-h-0 */}
        <ScrollArea className="h-full" viewportRef={viewportRef}>
          <div className="p-4 space-y-2">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground pt-8 flex flex-col items-center">
                <MessageCircle className="h-12 w-12 text-primary/50 mb-4" />
                <p className="font-medium">Ask me anything about your finances!</p>
                <p className="text-sm">
                  E.g., "Can I afford a new car?" or "Summarize my investments."
                </p>
                {/* Reserve space for the conditional message to stabilize layout */}
                <div className="h-6 mt-2"> {/* Approx height of a 'text-sm' line + 'mt-2' */}
                  {isChatDisabledByUserDetails && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      (Complete your user profile to enable chat)
                    </p>
                  )}
                </div>
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
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div className="flex-grow" tabIndex={isChatDisabledByUserDetails ? 0 : undefined}>
                  <Input
                    type="text"
                    placeholder={isChatDisabledByUserDetails ? "Complete user profile to chat" : "Type your message..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={finalDisabledState}
                    className="w-full"
                    aria-label="Chat message input"
                    style={isChatDisabledByUserDetails ? { cursor: 'not-allowed' } : {}}
                  />
                </div>
              </TooltipTrigger>
              {isChatDisabledByUserDetails && (
                <TooltipContent>
                  <p>Please complete your user profile to enable the chat.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <Button type="submit" disabled={finalDisabledState || !inputValue.trim()} size="icon" aria-label="Send message">
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
