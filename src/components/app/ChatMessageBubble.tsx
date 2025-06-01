
"use client";

import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Removed AvatarImage as it's not used
import { User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.sender === 'user';
  const avatarIcon = isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />;
  // const avatarFallback = isUser ? 'U' : 'B'; // Not strictly needed if using icons

  return (
    <div
      className={cn(
        'flex items-start space-x-3 py-3 px-2 rounded-lg max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        {/* Placeholder for actual avatar images if available */}
        {/* <AvatarImage src={isUser ? '/user-avatar.png' : '/bot-avatar.png'} /> */}
        <AvatarFallback className={cn(
          "flex items-center justify-center",
          isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
        )}>
          {avatarIcon}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'p-3 rounded-lg shadow-md prose prose-sm dark:prose-invert max-w-full', // Added prose classes for markdown styling
          isUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card text-card-foreground rounded-bl-none border'
        )}
      >
        {message.isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{message.text}</span>
          </div>
        ) : (
          // Using ReactMarkdown to render the text.
          // The 'prose' classes help style the markdown output.
          // You might need to install @tailwindcss/typography if not already.
          <ReactMarkdown
            components={{
              // Ensure links open in a new tab
              a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
            }}
          >
            {message.text}
          </ReactMarkdown>
        )}
        <p
          className={cn(
            'text-xs mt-1',
            isUser ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
